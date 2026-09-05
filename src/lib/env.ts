// EventPass — typed access to environment variables.
// Reads happen at call time (not module scope) so server functions pick up
// whatever the host injects (local shell, preview, or production).
// NEVER import this file into client components in a way that leaks secrets;
// the service-role key is server-only.

export const env = {
  get supabaseUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  },
  get supabaseAnonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  get supabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  get databaseUrl() {
    return process.env.DATABASE_URL
  },
  get redisUrl() {
    return process.env.UPSTASH_REDIS_REST_URL
  },
  get redisToken() {
    return process.env.UPSTASH_REDIS_REST_TOKEN
  },
}
