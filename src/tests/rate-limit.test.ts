import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

describe("Database-Backed Rate Limiter", () => {
  const testIp = "192.0.2.100";
  const action = "test-action";

  beforeEach(async () => {
    // Clean test key entries before each run
    try {
      await db.delete(rateLimits);
    } catch {
      // Table may be empty
    }
  });

  it("should allow first request and initialize remaining points counter", async () => {
    const res = await checkRateLimit(testIp, action, { maxRequests: 5, windowSeconds: 60 });
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(4);
    expect(res.resetAt).toBeInstanceOf(Date);
  });

  it("should decrement remaining allowance on subsequent requests", async () => {
    await checkRateLimit(testIp, action, { maxRequests: 3, windowSeconds: 60 });
    const second = await checkRateLimit(testIp, action, { maxRequests: 3, windowSeconds: 60 });
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(1);

    const third = await checkRateLimit(testIp, action, { maxRequests: 3, windowSeconds: 60 });
    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("should reject requests exceeding max allowed requests within window", async () => {
    const config = { maxRequests: 2, windowSeconds: 60 };
    await checkRateLimit(testIp, "burst-test", config);
    await checkRateLimit(testIp, "burst-test", config);

    const blocked = await checkRateLimit(testIp, "burst-test", config);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("should reset allowance when the expiration window has passed", async () => {
    // 0-second window to immediately expire
    const config = { maxRequests: 1, windowSeconds: 0 };
    await checkRateLimit(testIp, "expire-test", config);

    // Wait 10ms for timestamp expiry
    await new Promise((r) => setTimeout(r, 15));

    const refreshed = await checkRateLimit(testIp, "expire-test", { maxRequests: 5, windowSeconds: 60 });
    expect(refreshed.success).toBe(true);
    expect(refreshed.remaining).toBe(4);
  });
});
