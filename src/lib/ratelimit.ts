import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * RATE LIMITING (OPTIONAL — Deferred to Phase 8+)
 *
 * Upstash Redis provides distributed rate limiting for auth endpoints.
 * Status: Not yet set up (fails open, allows all requests)
 *
 * To enable (future):
 * 1. Sign up at upstash.com (free tier: 10k commands/day)
 * 2. Create Redis database
 * 3. Add to .env.local:
 *    UPSTASH_REDIS_REST_URL=...
 *    UPSTASH_REDIS_REST_TOKEN=...
 * 4. Rate limiting activates automatically
 *
 * Until then: No enforcement, suitable for local dev + early testing
 */

const hasKeys = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis only if keys are present to prevent crashes during local setup
const redis = hasKeys
  ? new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  : null;

// Standard Vibe Limit: 5 requests every 10 seconds per identifier
const ratelimit = redis
  ? new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "10 s"),
    analytics: true,
  })
  : null;

/**
 * Universal Rate Limiter for Server Actions.
 * Drop `await verifyRateLimit(user.id)` at the top of any sensitive action.
 *
 * Currently: Fails open (allows all requests if Upstash not configured).
 * Production: Add Upstash keys to activate enforcement.
 */
export async function verifyRateLimit(identifier: string) {
  if (!ratelimit) {
    // Graceful degradation: rate limiting not yet configured
    // In production, you'd want Upstash to prevent brute force attacks
    return { success: true };
  }

  return await ratelimit.limit(identifier);
}
