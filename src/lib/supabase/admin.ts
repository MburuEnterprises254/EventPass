// Server-only Supabase client using the SERVICE-ROLE key.
// Never import this module from client code. Use it in server functions to
// verify sessions, manage users, and assign roles.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "~/lib/env";

let adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = env.supabaseUrl;
  const serviceRole = env.supabaseServiceRoleKey;
  if (!url || !serviceRole) {
    throw new Error(
      "Supabase service-role credentials are not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). " +
        "Add them to the environment to enable auth.",
    );
  }
  adminClient = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return adminClient;
}
