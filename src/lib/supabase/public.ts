// Public (anon-key) Supabase client for browser usage.
// Safe to expose the anon key. This is the client future client-side features
// (realtime, storage) use; auth itself is handled server-side via server functions.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let publicClient: SupabaseClient | null = null;

export function getPublicClient(env: {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}): SupabaseClient {
  if (publicClient && publicClient.supabaseUrl === env.supabaseUrl) {
    return publicClient;
  }
  const url = env.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.supabaseAnonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase public credentials are not configured.");
  }
  publicClient = createClient(url, anon);
  return publicClient;
}
