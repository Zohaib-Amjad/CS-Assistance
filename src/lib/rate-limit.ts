import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export async function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig = { maxRequests: 20, windowSeconds: 60 }
): Promise<{ success: boolean; remaining: number; resetAt: Date }> {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const resetTime = now + config.windowSeconds * 1000;

  try {
    const existing = await db.query.rateLimits.findFirst({
      where: eq(rateLimits.key, key),
    });

    if (!existing) {
      await db.insert(rateLimits).values({
        key,
        points: 1,
        expireAt: new Date(resetTime),
      });
      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(resetTime),
      };
    }

    if (existing.expireAt.getTime() < now) {
      // Window expired, reset counter
      await db
        .update(rateLimits)
        .set({ points: 1, expireAt: new Date(resetTime) })
        .where(eq(rateLimits.key, key));

      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(resetTime),
      };
    }

    if (existing.points >= config.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetAt: existing.expireAt,
      };
    }

    // Increment points
    await db
      .update(rateLimits)
      .set({ points: sql`${rateLimits.points} + 1` })
      .where(eq(rateLimits.key, key));

    return {
      success: true,
      remaining: config.maxRequests - (existing.points + 1),
      resetAt: existing.expireAt,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail-open for UX resilience if DB has transient error
    return {
      success: true,
      remaining: config.maxRequests,
      resetAt: new Date(resetTime),
    };
  }
}
