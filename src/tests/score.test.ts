import { describe, it, expect } from "vitest";
import { calculateCyberGuardScore, UserSecurityMetrics } from "@/lib/score";

describe("CyberGuard Security Score Engine (5 Factors x 20 Points)", () => {
  it("should calculate baseline score for a fresh user with low activity", () => {
    const metrics: UserSecurityMetrics = {
      twoFaEnabled: false,
      hasStrongPassword: false,
      quizzesCompleted: 0,
      urlScansCount: 0,
      emailScansCount: 0,
      loginStreakDays: 0,
    };

    const res = calculateCyberGuardScore(metrics);
    expect(res.score).toBeGreaterThanOrEqual(0);
    expect(res.score).toBeLessThan(40);
    expect(res.label).toBe("Needs Improvement");
    expect(res.badgeColor).toBe("danger");
    expect(res.recommendations.length).toBeGreaterThan(0);
    expect(res.disclaimer).toContain("educational indicator");
  });

  it("should calculate score for an intermediate user (Fair/Good)", () => {
    const metrics: UserSecurityMetrics = {
      twoFaEnabled: true,
      hasStrongPassword: true,
      lastPasswordScore: 65,
      recentPasswordScansCount: 1,
      quizzesCompleted: 2,
      quizAverageScore: 75,
      urlScansCount: 4,
      emailScansCount: 2,
      loginStreakDays: 3,
      scansPast30Days: 6,
    };

    const res = calculateCyberGuardScore(metrics);
    expect(res.score).toBeGreaterThanOrEqual(60);
    expect(res.score).toBeLessThanOrEqual(85);
    expect(["Fair", "Good", "Excellent"]).toContain(res.label);
  });

  it("should award top points (80-100 / Excellent) for comprehensive high security hygiene", () => {
    const metrics: UserSecurityMetrics = {
      twoFaEnabled: true,
      hasStrongPassword: true,
      failedLoginAttemptsCount: 0,
      lastPasswordScore: 95,
      recentPasswordScansCount: 3,
      quizzesCompleted: 5,
      quizAverageScore: 90,
      urlScansCount: 15,
      emailScansCount: 10,
      loginStreakDays: 14,
      scansPast30Days: 25,
    };

    const res = calculateCyberGuardScore(metrics);
    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(res.score).toBeLessThanOrEqual(100);
    expect(res.label).toBe("Excellent");
    expect(res.badgeColor).toBe("success");

    // All 5 factors must be present with maxScore = 20
    expect(res.factors.passwordHygiene.maxScore).toBe(20);
    expect(res.factors.quizKnowledge.maxScore).toBe(20);
    expect(res.factors.safeBrowsing.maxScore).toBe(20);
    expect(res.factors.securityActivity.maxScore).toBe(20);
    expect(res.factors.accountSecurity.maxScore).toBe(20);

    expect(res.factors.passwordHygiene.score).toBe(20);
    expect(res.factors.quizKnowledge.score).toBe(20);
    expect(res.factors.safeBrowsing.score).toBe(20);
    expect(res.factors.securityActivity.score).toBe(20);
    expect(res.factors.accountSecurity.score).toBe(20);
  });

  it("should generate actionable tips for deficient security factors", () => {
    const metrics: UserSecurityMetrics = {
      twoFaEnabled: false,
      hasStrongPassword: false,
      lastPasswordScore: 30,
      quizzesCompleted: 0,
    };

    const res = calculateCyberGuardScore(metrics);
    expect(res.factors.accountSecurity.tips.some((t) => t.includes("Two-Factor"))).toBe(true);
    expect(res.factors.passwordHygiene.tips.some((t) => t.includes("passphrase") || t.includes("password"))).toBe(true);
  });
});
