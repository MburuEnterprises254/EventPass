// EventPass — typed access to Upstash Redis (server-only).
//
// The client is built lazily and reads env vars at call time (same pattern as
// src/lib/env.ts) so server code picks up whatever the host injects — local
// shell, preview, or production. THIS FILE IS SERVER-ONLY: never import it into
// a client component, and never ship the token to the browser.
import { Redis } from "@upstash/redis";
import { env } from "~/lib/env";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) return redis;
  if (!env.redisUrl || !env.redisToken) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not configured. Add them to run Redis-backed code.",
    );
  }
  redis = new Redis({ url: env.redisUrl, token: env.redisToken });
  return redis;
}

/** True when the Upstash REST env vars are present (Redis-backed code can run). */
export function hasRedis(): boolean {
  return Boolean(env.redisUrl && env.redisToken);
}

/**
 * Fixed-window Redis rate limiter for server functions (login / signup etc).
 *
 * Returns `true` when the request is allowed. When the limit is exceeded the
 * caller gets a structured response so it can surface a friendly error.
 *
 * The counter is an incrementing integer with an expiry — atomic via INCR+EXPIRE.
 * Implemented as a Lua-free pair of calls (SETNX/INCR) kept race-tolerant for a
 * rate limiter: slightly-off counts under concurrency are acceptable for the
 * auth surface, and the fallback below keeps auth working if Redis is down.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds?: number }> {
  if (!hasRedis()) {
    // Redis not wired yet — fail open so auth keeps working while the infra is
    // being stood up. Flip to fail-closed once Redis is a hard dependency.
    return { allowed: true, remaining: Number.POSITIVE_INFINITY };
  }
  const rk = `rl:${key}`;
  try {
    const current = await getRedis().incr(rk);
    if (current === 1) {
      await getRedis().expire(rk, windowSeconds);
    }
    const ttl = await getRedis().ttl(rk);
    const remaining = Math.max(0, limit - current);
    if (current > limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, ttl) };
    }
    return { allowed: true, remaining };
  } catch {
    // Redis transient failure — allow the request rather than bricking login.
    return { allowed: true, remaining: Number.POSITIVE_INFINITY };
  }
}
