// Server-side Supabase Auth: sign-up / sign-in / sign-out + RBAC helper.
//
// Sessions use an HttpOnly cookie carrying the Supabase access token (see
// src/server/session.ts). Every protected server function verifies the token
// against the service-role client and reads the role from the user's
// `app_metadata.role`, which is authoritative (set server-side on signup and
// via the seed script — never trusted from the client).
//
// Server-only modules (Supabase admin client, cookie helpers, Prisma) are
// imported dynamically INSIDE handlers so this file stays importable from the
// browser: TanStack's compiler keeps a thin RPC stub in the client bundle while
// handlers run server-side. Nothing in here touches the service-role key in the
// browser.
import { createServerFn } from "@tanstack/react-start";
import { registerSchema, signInSchema, type RegisterInput, type SignInInput } from "~/lib/auth/validation";
import { isRole, type Role } from "~/lib/auth/roles";

export type SessionPrincipal = {
  supabaseId: string;
  email?: string;
  name?: string | null;
  role: Role;
};

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

// Best-effort sync of a Supabase user into the app User table once Prisma is
// connected. Role defaults to CUSTOMER. Non-fatal if the DB isn't wired yet.
async function syncUserToDb(
  supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  role: Role,
) {
  try {
    const { getPrisma } = await import("~/lib/db/prisma");
    const prisma = getPrisma();
    await prisma.user.upsert({
      where: { supabaseId: supabaseUser.id },
      create: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email ?? "",
        name: typeof supabaseUser.user_metadata?.full_name === "string"
          ? supabaseUser.user_metadata.full_name
          : null,
        role,
      },
      update: { email: supabaseUser.email ?? "", role },
    });
  } catch {
    // DB not connected yet — auth still works against Supabase.
  }
}

type SignUpResult = { ok: true; email: string; role: Role };
const signUp = createServerFn()
  .validator((d: RegisterInput) => registerSchema.parse(d))
  .handler(async ({ data }): Promise<SignUpResult> => {
    const { getAdminClient } = await import("~/lib/supabase/admin");
    const { setSessionCookie } = await import("~/server/session");
    const { rateLimit } = await import("~/lib/redis");
    const admin = getAdminClient();

    // Rate limit signup attempts per IP (best-effort; keyed by client IP when
    // available, falling back to the email). Redis-backed — see src/lib/redis.ts.
    const ip = (process.env.REMOTE_ADDR ?? "") || data.email;
    const lim = await rateLimit(`signup:${ip}`, 10, 60);
    if (!lim.allowed) {
      throw new AuthError(
        `Too many sign-up attempts. Try again in ${lim.retryAfterSeconds ?? 60}s.`,
        429,
      );
    }

    // Create the user via the service role so we can set an authoritative role.
    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // auto-confirm so the session can start immediately (dev-friendly)
      user_metadata: { full_name: data.name },
      app_metadata: { role: "CUSTOMER" },
    });
    if (error || !created.user) {
      throw new AuthError(error?.message ?? "Could not create account", 400);
    }

    // Sign in to obtain a session to store in the HttpOnly cookie.
    const { data: sessionRes, error: signInError } = await admin.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (signInError || !sessionRes.session) {
      throw new AuthError(signInError?.message ?? "Account created but sign-in failed", 500);
    }
    setSessionCookie(sessionRes.session.access_token);
    await syncUserToDb(created.user, "CUSTOMER");
    return { ok: true, email: data.email, role: "CUSTOMER" };
  });

type SignInResult = { ok: true; email: string; role: Role };
const signIn = createServerFn()
  .validator((d: SignInInput) => signInSchema.parse(d))
  .handler(async ({ data }): Promise<SignInResult> => {
    const { getAdminClient } = await import("~/lib/supabase/admin");
    const { setSessionCookie } = await import("~/server/session");
    const { rateLimit } = await import("~/lib/redis");
    const admin = getAdminClient();

    // Rate limit sign-in attempts per IP (best-effort). Redis-backed.
    const ip = (process.env.REMOTE_ADDR ?? "") || data.email;
    const lim = await rateLimit(`signin:${ip}`, 20, 60);
    if (!lim.allowed) {
      throw new AuthError(
        `Too many sign-in attempts. Try again in ${lim.retryAfterSeconds ?? 60}s.`,
        429,
      );
    }

    const { data: res, error } = await admin.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error || !res.session) {
      throw new AuthError(error?.message ?? "Invalid email or password", 401);
    }
    setSessionCookie(res.session.access_token);
    const role = isRole(res.user?.app_metadata?.role) ? res.user!.app_metadata.role : "CUSTOMER";
    return { ok: true, email: res.user?.email ?? data.email, role };
  });

type SignOutResult = { ok: true };
const signOut = createServerFn().handler(async (): Promise<SignOutResult> => {
  const { getAdminClient } = await import("~/lib/supabase/admin");
  const { clearSessionCookie, readSessionToken } = await import("~/server/session");
  const token = readSessionToken();
  if (token) {
    try {
      await getAdminClient().auth.admin.signOut(token);
    } catch {
      // ignore — cookie must still be cleared
    }
  }
  clearSessionCookie();
  return { ok: true };
});

type SessionResult = SessionPrincipal | null;
const getSession = createServerFn().handler(async (): Promise<SessionResult> => {
  const { getAdminClient } = await import("~/lib/supabase/admin");
  const { readSessionToken } = await import("~/server/session");
  const token = readSessionToken();
  if (!token) return null;
  const { data, error } = await getAdminClient().auth.getUser(token);
  if (error || !data.user) return null;
  const role = isRole(data.user.app_metadata?.role) ? data.user.app_metadata.role : "CUSTOMER";
  return {
    supabaseId: data.user.id,
    email: data.user.email,
    name:
      typeof data.user.user_metadata?.full_name === "string"
        ? data.user.user_metadata.full_name
        : null,
    role,
  };
});

/**
 * RBAC guard — call at the top of any protected server function / handler.
 * Verifies the session token and that the principal has one of the allowed roles.
 * Throws AuthError(401/403) otherwise.
 */
export async function requireRole(allowed: Role[]): Promise<SessionPrincipal> {
  const { getAdminClient } = await import("~/lib/supabase/admin");
  const { readSessionToken } = await import("~/server/session");
  const token = readSessionToken();
  if (!token) throw new AuthError("Unauthorized", 401);
  const { data, error } = await getAdminClient().auth.getUser(token);
  if (error || !data.user) throw new AuthError("Unauthorized", 401);
  const role = isRole(data.user.app_metadata?.role) ? data.user.app_metadata.role : "CUSTOMER";
  if (!allowed.includes(role)) throw new AuthError("Forbidden", 403);
  return {
    supabaseId: data.user.id,
    email: data.user.email,
    name:
      typeof data.user.user_metadata?.full_name === "string"
        ? data.user.user_metadata.full_name
        : null,
    role,
  };
}

export { signUp, signIn, signOut, getSession };
