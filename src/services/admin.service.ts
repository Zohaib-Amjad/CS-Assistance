import { db } from "@/db";
import { users, scans, quizQuestions, securityTips, auditLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getAdminMetrics() {
  const allUsers = await db.query.users.findMany();
  const allScans = await db.query.scans.findMany();
  const allTips = await db.query.securityTips.findMany();
  const allQuestions = await db.query.quizQuestions.findMany();

  const totalUsers = allUsers.length;
  const totalScans = allScans.length;
  const maliciousDetected = allScans.filter((s: any) => s.verdict === "malicious").length;

  const emailScans = allScans.filter((s: any) => s.type === "email").length;
  const urlScans = allScans.filter((s: any) => s.type === "url").length;
  const passwordScans = allScans.filter((s: any) => s.type === "password").length;

  return {
    totalUsers,
    totalScans,
    maliciousDetected,
    emailScans,
    urlScans,
    passwordScans,
    totalTips: allTips.length,
    totalQuestions: allQuestions.length,
    recentUsers: allUsers.slice(0, 8),
    recentScans: allScans.slice(0, 10),
  };
}

export async function getAllUsersAdmin() {
  const rawUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });
  return rawUsers.map((u: any) => {
    const { passwordHash, ...safe } = u;
    return safe;
  });
}

export async function getEmailScanLogs() {
  return db.query.scans.findMany({
    where: eq(scans.type, "email"),
    orderBy: [desc(scans.createdAt)],
    limit: 50,
  });
}

export async function getUrlScanLogs() {
  return db.query.scans.findMany({
    where: eq(scans.type, "url"),
    orderBy: [desc(scans.createdAt)],
    limit: 50,
  });
}

export async function getAuditLogs() {
  return db.query.auditLogs.findMany({
    orderBy: [desc(auditLogs.createdAt)],
    limit: 50,
  });
}
