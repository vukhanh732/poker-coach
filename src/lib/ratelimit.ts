import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function makeRatelimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!process.env.RATELIMIT_REDIS_URL || !process.env.RATELIMIT_REDIS_TOKEN) {
    return null;
  }
  const redis = new Redis({
    url: process.env.RATELIMIT_REDIS_URL,
    token: process.env.RATELIMIT_REDIS_TOKEN,
  });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// 10 Claude hand analyses per user per hour
export const analyzerLimiter = makeRatelimiter(10, "1 h");

// 30 Groq simulation analyses per user per hour
export const simulationLimiter = makeRatelimiter(30, "1 h");

export async function checkRateLimit(
  limiter: ReturnType<typeof makeRatelimiter>,
  userId: string
): Promise<{ limited: boolean; resetAt?: Date }> {
  if (!limiter) return { limited: false };

  const { success, reset } = await limiter.limit(userId);
  if (!success) {
    return { limited: true, resetAt: new Date(reset) };
  }
  return { limited: false };
}
