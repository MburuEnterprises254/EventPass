// EventPass — role provisioning script.
//
// Supabase Auth owns credentials; the app User rows + role lives in our Postgres
// (User.supabaseId -> auth.users) AND in the Supabase user's `app_metadata.role`,
// which is embedded in the JWT (so requireRole() works even before the DB upsert
// completes).
//
// HOW ROLES ARE ASSIGNED TODAY (until an admin dashboard exists):
//   • Sign-up always creates a CUSTOMER (see src/lib/auth/authServer.ts).
//   • To promote a user to ORGANIZER / STAFF / PLATFORM_ADMIN, run this script
//     with a real SUPABASE_SERVICE_ROLE_KEY + an email:
//         SUPABASE_SERVICE_ROLE_KEY=<key> bun run prisma/seed.ts -- --role ORGANIZER --email you@example.com
//     It sets app_metadata.role (authoritative, embedded in JWT) and, once
//     DATABASE_URL is wired, updates the app User row to match.
//
// DATABASE_URL is optional here: Supabase role update works without it.
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Add Supabase credentials to run role provisioning.",
    );
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const email = args[args.indexOf("--email") + 1];
  const role = args[args.indexOf("--role") + 1];
  if (!email || !role) {
    console.error("Usage: bun prisma/seed.ts -- --email <email> --role <ORGANIZER|STAFF|PLATFORM_ADMIN|CUSTOMER>");
    process.exit(1);
  }

  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Find the user by email, then set app_metadata.role.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) throw listErr;
  const found = list.users.find((u) => u.email === email);
  if (!found) {
    console.error(`No Supabase user found for ${email}. Create the account through the site first.`);
    process.exit(1);
  }

  const { data: updated, error: updErr } = await admin.auth.admin.updateUserById(found.id, {
    app_metadata: { ...(found.app_metadata ?? {}), role },
  });
  if (updErr) throw updErr;
  console.log(`OK: set role=${role} for ${email} (supabase id ${found.id})`);

  // Best-effort: sync the app User row once a DB is wired.
  try {
    const { getPrisma } = await import("../src/lib/db/prisma");
    const prisma = getPrisma();
    await prisma.user.upsert({
      where: { supabaseId: found.id },
      create: { supabaseId: found.id, email, role: role as never },
      update: { role: role as never },
    });
    console.log("OK: app User row role synced.");
  } catch {
    console.log("DB not wired (no DATABASE_URL) — skipping app User row sync.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
