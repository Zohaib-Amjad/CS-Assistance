import { db } from "@/db";
import { users, scans, quizAttempts, userAchievements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getUserById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  if (!user) return null;
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });
}

export async function getUserProfileData(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) return null;

  const userScans = await db.query.scans.findMany({
    where: eq(scans.userId, userId),
    orderBy: [desc(scans.createdAt)],
    limit: 10,
  });

  const attempts = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
    orderBy: [desc(quizAttempts.createdAt)],
    limit: 5,
  });

  const achievements = await db.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
    orderBy: [desc(userAchievements.unlockedAt)],
  });

  const { passwordHash, ...safeUser } = user;
  return {
    user: safeUser,
    recentScans: userScans,
    quizAttempts: attempts,
    achievements,
  };
}

export async function recalculateSecurityScore(userId: string): Promise<number> {
  const userScans = await db.query.scans.findMany({
    where: eq(scans.userId, userId),
  });

  const userQuizAttempts = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
  });

  let baseScore = 70;

  // Bonus for scan activity (up to +15)
  const scanBonus = Math.min(15, userScans.length * 2);

  // Bonus for quiz performance (up to +15)
  let quizBonus = 0;
  if (userQuizAttempts.length > 0) {
    const passed = userQuizAttempts.filter((a: any) => a.passed).length;
    quizBonus = Math.min(15, passed * 5);
  }

  // Penalty if latest password check was weak (-10)
  const lastPasswordScan = userScans.find((s: any) => s.type === "password");
  let passwordPenalty = 0;
  if (lastPasswordScan && lastPasswordScan.verdict === "weak") {
    passwordPenalty = 10;
  }

  const finalScore = Math.min(100, Math.max(20, baseScore + scanBonus + quizBonus - passwordPenalty));

  await db.update(users)
    .set({ securityScore: finalScore })
    .where(eq(users.id, userId));

  return finalScore;
}
