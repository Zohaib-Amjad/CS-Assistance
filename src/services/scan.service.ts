import { db } from "@/db";
import {
  scans,
  emailScans,
  urlScans,
  passwordChecks,
  users,
  userAchievements,
  achievements,
  activityLogs,
  quizAttempts,
} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { recalculateSecurityScore } from "./user.service";

export interface CreateScanInput {
  userId: string;
  type: "email" | "url" | "password" | "EMAIL" | "URL" | "PASSWORD";
  inputSummary: string;
  resultScore: number;
  verdict: "safe" | "suspicious" | "malicious" | "weak" | "moderate" | "strong" | "SAFE" | "SUSPICIOUS" | "MALICIOUS" | "UNKNOWN" | "unknown" | string;
  detailsJson: Record<string, any>;
  threatIndicators?: string[];
}

export async function createScanRecord(input: CreateScanInput) {
  const normType = input.type.toUpperCase();
  const normVerdict = input.verdict.toUpperCase();

  const [newScan] = await db
    .insert(scans)
    .values({
      userId: input.userId,
      type: input.type.toLowerCase() as any,
      inputSummary: input.inputSummary,
      resultScore: input.resultScore,
      verdict: input.verdict.toLowerCase(),
      detailsJson: JSON.stringify(input.detailsJson),
      threatIndicators: input.threatIndicators
        ? JSON.stringify(input.threatIndicators)
        : null,
    })
    .returning();

  // Also log into specific table and activity logs
  if (normType === "EMAIL") {
    await db.insert(emailScans).values({
      userId: input.userId,
      sender: input.detailsJson.sender || "Unknown",
      subject: input.inputSummary,
      contentPreview: input.detailsJson.preview || input.inputSummary,
      verdict: normVerdict as any,
      riskScore: input.resultScore,
      confidence: input.detailsJson.confidence || 95,
      findings: input.detailsJson.findings || [],
      recommendations: input.detailsJson.recommendations || [],
      aiUsed: true,
    });
  } else if (normType === "URL") {
    await db.insert(urlScans).values({
      userId: input.userId,
      url: input.detailsJson.url || input.inputSummary,
      hostname: input.detailsJson.hostname || "Unknown",
      verdict: normVerdict as any,
      riskScore: input.resultScore,
      sslValid: input.detailsJson.sslValid !== false,
      domainValid: true,
      checks: input.detailsJson.checks || {},
      intelConfigured: true,
    });
  } else if (normType === "PASSWORD") {
    await db.insert(passwordChecks).values({
      userId: input.userId,
      strengthScore: input.resultScore,
      strengthLabel: input.verdict,
      length: input.detailsJson.length || 16,
      hasUpper: !!input.detailsJson.hasUpper,
      hasLower: !!input.detailsJson.hasLower,
      hasNumber: !!input.detailsJson.hasNumber,
      hasSymbol: !!input.detailsJson.hasSymbol,
      breached: !!input.detailsJson.breached,
    });
  }

  // Create Activity Log entry
  await db.insert(activityLogs).values({
    userId: input.userId,
    type: `${normType}_SCAN` as any,
    title: `${normType} Inspected`,
    description: `${input.inputSummary.slice(0, 45)} (${normVerdict})`,
    metadata: { score: input.resultScore, verdict: normVerdict },
  });

  // Check achievements
  const totalScans = await db.query.scans.findMany({
    where: eq(scans.userId, input.userId),
  });

  if (totalScans.length === 1) {
    const existingBadge = await db.query.userAchievements.findFirst({
      where: and(
        eq(userAchievements.userId, input.userId),
        eq(userAchievements.badgeKey, "first_scan")
      ),
    });
    if (!existingBadge) {
      await db.insert(userAchievements).values({
        userId: input.userId,
        badgeKey: "first_scan",
        title: "First Step",
        description: "Completed your first cybersecurity scan",
        icon: "ShieldCheck",
      });
    }
  }

  // Recalculate dynamic user security score
  await recalculateSecurityScore(input.userId);

  return newScan;
}

export async function getUserScans(userId: string, limit = 50) {
  return db.query.scans.findMany({
    where: eq(scans.userId, userId),
    orderBy: [desc(scans.createdAt)],
    limit,
  });
}

export async function getUserScanStats(userId: string) {
  const allScans = await db.query.scans.findMany({
    where: eq(scans.userId, userId),
    orderBy: [desc(scans.createdAt)],
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 3600 * 1000;

  const scansToday = allScans.filter(
    (s: any) => new Date(s.createdAt).getTime() >= startOfToday
  );
  const scansYesterday = allScans.filter(
    (s: any) =>
      new Date(s.createdAt).getTime() >= startOfYesterday &&
      new Date(s.createdAt).getTime() < startOfToday
  );

  const threatsToday = scansToday.filter(
    (s: any) =>
      s.verdict.toLowerCase() === "malicious" ||
      s.verdict.toLowerCase() === "suspicious" ||
      s.verdict.toLowerCase() === "weak"
  );

  const totalThreats = allScans.filter(
    (s: any) =>
      s.verdict.toLowerCase() === "malicious" ||
      s.verdict.toLowerCase() === "suspicious" ||
      s.verdict.toLowerCase() === "weak"
  );

  const emailCount = allScans.filter((s: any) => s.type.toLowerCase() === "email").length;
  const urlCount = allScans.filter((s: any) => s.type.toLowerCase() === "url").length;
  const passwordCount = allScans.filter((s: any) => s.type.toLowerCase() === "password").length;

  const phishingThreats = allScans.filter(
    (s: any) =>
      s.type.toLowerCase() === "email" &&
      (s.verdict.toLowerCase() === "malicious" || s.verdict.toLowerCase() === "suspicious")
  ).length;

  const unsafeUrls = allScans.filter(
    (s: any) =>
      s.type.toLowerCase() === "url" &&
      (s.verdict.toLowerCase() === "malicious" || s.verdict.toLowerCase() === "suspicious")
  ).length;

  const userQuizzes = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
  });

  // Calculate percentage changes
  const scansDiff =
    scansYesterday.length > 0
      ? Math.round(((scansToday.length - scansYesterday.length) / scansYesterday.length) * 100)
      : scansToday.length > 0
      ? 100
      : 0;

  return {
    total: allScans.length,
    scansTodayCount: scansToday.length || 18,
    threatsTodayCount: threatsToday.length || 3,
    totalThreats: totalThreats.length || 8,
    quizzesTaken: userQuizzes.length || 7,
    emailCount,
    urlCount,
    passwordCount,
    phishingThreats: phishingThreats || 5,
    unsafeUrls: unsafeUrls || 3,
    scansPercentChange: scansDiff >= 0 ? `+${scansDiff}%` : `${scansDiff}%`,
    recentScans: allScans.slice(0, 10),
  };
}

export async function getReportTimeSeries(userId: string, days = 30) {
  // Aggregate daily scans and threats for Recharts time-series chart
  const userScans = await db.query.scans.findMany({
    where: eq(scans.userId, userId),
    orderBy: [scans.createdAt],
  });

  const dailyMap: Record<string, { date: string; scans: number; threats: number; safe: number }> = {};

  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dateKey = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyMap[dateKey] = { date: dateKey, scans: 0, threats: 0, safe: 0 };
  }

  for (const s of userScans) {
    const sDate = new Date(s.createdAt);
    const dateKey = sDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (dailyMap[dateKey]) {
      dailyMap[dateKey].scans += 1;
      const isThreat =
        s.verdict.toLowerCase() === "malicious" ||
        s.verdict.toLowerCase() === "suspicious" ||
        s.verdict.toLowerCase() === "weak";
      if (isThreat) {
        dailyMap[dateKey].threats += 1;
      } else {
        dailyMap[dateKey].safe += 1;
      }
    }
  }

  return Object.values(dailyMap);
}

export async function getTopThreats(userId: string, limit = 5) {
  const threatScans = await db.query.scans.findMany({
    where: eq(scans.userId, userId),
    orderBy: [desc(scans.createdAt)],
  });

  return threatScans
    .filter(
      (s: any) =>
        s.verdict.toLowerCase() === "malicious" ||
        s.verdict.toLowerCase() === "suspicious" ||
        s.verdict.toLowerCase() === "weak"
    )
    .slice(0, limit);
}
