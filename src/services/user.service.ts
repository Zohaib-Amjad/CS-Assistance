import { db } from "@/db";
import {
  users,
  scans,
  emailScans,
  urlScans,
  passwordChecks,
  quizAttempts,
  userAchievements,
  activityLogs,
  chatConversations,
  chatMessages,
  notifications,
} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { checkAchievements } from "./achievement.service";

export async function getUserById(id: string) {
  const user = (await db.query.users.findFirst({
    where: eq(users.id, id),
  })) as any;
  if (!user) return null;
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });
}

/**
 * Returns complete profile data, aggregated stats (quizzes taken, scans performed, threats detected),
 * security score, and achievement progress.
 */
export async function getUserProfileData(userId: string) {
  const user = (await db.query.users.findFirst({
    where: eq(users.id, userId),
  })) as any;
  if (!user) return null;

  const [userScans, attempts, achievementsData] = await Promise.all([
    db.query.scans.findMany({
      where: eq(scans.userId, userId),
      orderBy: [desc(scans.createdAt)],
    }) as Promise<any[]>,
    db.query.quizAttempts.findMany({
      where: eq(quizAttempts.userId, userId),
      orderBy: [desc(quizAttempts.createdAt)],
    }) as Promise<any[]>,
    checkAchievements(userId),
  ]);

  // Aggregate stats
  const quizzesTaken = attempts.length;
  const scansPerformed = userScans.length;
  const threatsDetected = userScans.filter((s: any) => {
    const verdict = (s.verdict || "").toLowerCase();
    return (
      verdict === "malicious" ||
      verdict === "suspicious" ||
      verdict === "weak" ||
      verdict === "danger"
    );
  }).length;

  const { passwordHash, ...safeUser } = user;

  return {
    user: safeUser,
    stats: {
      quizzesTaken,
      scansPerformed,
      threatsDetected,
      securityScore: user.securityScore ?? 75,
      loginStreak: user.loginStreak ?? 1,
    },
    recentScans: userScans.slice(0, 10),
    quizAttempts: attempts.slice(0, 10),
    achievements: achievementsData.all,
    recentAchievements: achievementsData.recent,
  };
}

/**
 * Update user editable profile attributes and log activity
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string; country?: string; bio?: string }
) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new Error("User not found.");

  const updatePayload: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.name?.trim()) updatePayload.name = data.name.trim();
  if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
  if (data.country !== undefined) updatePayload.country = data.country.trim();
  if (data.bio !== undefined) updatePayload.bio = data.bio.trim();

  const [updated] = await db
    .update(users)
    .set(updatePayload)
    .where(eq(users.id, userId))
    .returning();

  // Log activity
  await db.insert(activityLogs).values({
    userId,
    type: "PROFILE_UPDATED",
    title: "Profile Updated",
    description: "User profile contact and biographical details were updated",
    metadata: { updatedFields: Object.keys(data) },
  });

  const { passwordHash, ...safeUser } = updated;
  return safeUser;
}

/**
 * Update user profile picture / avatar
 */
export async function updateUserAvatar(userId: string, imageUrl: string) {
  const [updated] = await db
    .update(users)
    .set({
      image: imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  // Log activity
  await db.insert(activityLogs).values({
    userId,
    type: "PROFILE_UPDATED",
    title: "Avatar Changed",
    description: "Profile picture avatar updated successfully",
    metadata: { imageUrl },
  });

  const { passwordHash, ...safeUser } = updated;
  return safeUser;
}

/**
 * Change password, verify current password, and bump tokenVersion to invalidate existing auth sessions
 */
export async function changeUserPassword(
  userId: string,
  currentPasswordRaw: string,
  newPasswordRaw: string
) {
  const user = (await db.query.users.findFirst({
    where: eq(users.id, userId),
  })) as any;

  if (!user) throw new Error("User account not found.");

  // If user has a passwordHash, verify it
  if (user.passwordHash) {
    const isCurrentValid = await bcrypt.compare(currentPasswordRaw, user.passwordHash);
    if (!isCurrentValid) {
      throw new Error("Incorrect current password.");
    }
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPasswordRaw, 10);
  const nextTokenVersion = (user.tokenVersion || 1) + 1;

  await db
    .update(users)
    .set({
      passwordHash: newHash,
      tokenVersion: nextTokenVersion,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Log activity
  await db.insert(activityLogs).values({
    userId,
    type: "PROFILE_UPDATED",
    title: "Password Changed",
    description: "Account master password was changed and session tokens rotated",
    metadata: { tokenVersion: nextTokenVersion },
  });

  return { success: true, tokenVersion: nextTokenVersion };
}

/**
 * Safely delete user account with password confirmation & cascading removal
 */
export async function deleteUserAccount(userId: string, passwordConfirm: string) {
  const user = (await db.query.users.findFirst({
    where: eq(users.id, userId),
  })) as any;

  if (!user) throw new Error("User not found.");

  if (user.passwordHash) {
    const isValid = await bcrypt.compare(passwordConfirm, user.passwordHash);
    if (!isValid) {
      throw new Error("Password verification failed. Account deletion aborted.");
    }
  }

  // Delete all cascading records and user
  await db.delete(users).where(eq(users.id, userId));

  return { success: true };
}

/**
 * Recalculate security score for user
 */
export async function recalculateSecurityScore(userId: string): Promise<number> {
  const userScans = (await db.query.scans.findMany({
    where: eq(scans.userId, userId),
  })) as any[];

  const userQuizAttempts = (await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
  })) as any[];

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

  await db
    .update(users)
    .set({ securityScore: finalScore, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Also trigger achievement check
  await checkAchievements(userId).catch(() => {});

  return finalScore;
}
