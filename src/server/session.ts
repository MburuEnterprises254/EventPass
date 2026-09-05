// src/server/session.ts
// HttpOnly session cookie helpers for server functions.
// The cookie carries the Supabase access token; server functions verify it
// against the service-role client and read the role from app_metadata.
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

const SESSION_COOKIE = "ep_session";
const ONE_DAY = 60 * 60 * 24;

function isLocal(): boolean {
  const host = process.env.NODE_ENV === "development" ? "localhost" : undefined;
  // Secure flag is only set in production where we serve behind HTTPS.
  return host === "localhost" && !process.env.VERCEL;
}

export function setSessionCookie(token: string) {
  setResponseHeader("Set-Cookie", [
    `${SESSION_COOKIE}=${token}`,
    "HttpOnly",
    ...(isLocal() ? [] : ["Secure"]),
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${ONE_DAY}`,
  ].join("; "));
}

export function clearSessionCookie() {
  setResponseHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  );
}

export function readSessionToken(): string | null {
  const header = getRequestHeader("cookie");
  if (!header) return null;
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === SESSION_COOKIE) return part.slice(eq + 1);
  }
  return null;
}
