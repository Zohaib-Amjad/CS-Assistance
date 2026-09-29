import { db } from "@/db";
import {
  users,
  scans,
  emailScans,
  urlScans,
  passwordChecks,
  quizAttempts,
  chatMessages,
  achievements,
  userAchievements,
  notifications,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface AchievementDefinition {
  code: string;
  title: string;
  description: string;
  icon: string;
  category: "quiz" | "scan" | "security" | "activity";
  target: number;
  unit: string;
}

export const ALL_ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    code: "quiz_master",
    title: "Quiz Master",
    description: "Completed 5 quizzes",
    icon: "ShieldAlert",
    category: "quiz",
    target: 5,
    unit: "quizzes",
  },
  {
    code: "security_expert",
    title: "Security Expert",
    description: "Scored 90% or above in a quiz",
    icon: "Award",
    category: "quiz",
    target: 90,
    unit: "%",
  },
  {
    code: "active_user",
    title: "Active User",
    description: "Logged in for 7 days",
    icon: "ShieldCheck",
    category: "activity",
    target: 7,
    unit: "days",
  },
  {
    code: "first_scan",
    title: "First Scan",
    description: "Completed your first security inspection on email, URL, or credentials",
    icon: "ShieldCheck",
    category: "scan",
    target: 1,
    unit: "scans",
  },
  {
    code: "first_quiz",
    title: "First Quiz",
    description: "Completed your first cybersecurity awareness challenge",
    icon: "Award",
    category: "quiz",
    target: 1,
    unit: "quizzes",
  },
  {
    code: "url_guardian",
    title: "URL Guardian",
    description: "Inspected 5 web links with the URL inspector",
    icon: "Globe",
    category: "scan",
    target: 5,
    unit: "links",
  },
  {
    code: "phishing_detector",
    title: "Phishing Detector",
    description: "Analyzed 5 email messages for social engineering threats",
    icon: "MailCheck",
    category: "scan",
    target: 5,
    unit: "emails",
  },
  {
    code: "security_champion",
    title: "Security Champion",
    description: "Reached an overall security score of 90% or above",
    icon: "Trophy",
    category: "security",
    target: 90,
    unit: "points",
  },
  {
    code: "perfect_score",
    title: "Perfect Score",
    description: "Scored a flawless 100% on a cybersecurity quiz",
    icon: "Sparkles",
    category: "quiz",
    target: 100,
    unit: "%",
  },
  {
    code: "curious_mind",
    title: "Curious Mind",
    description: "Consulted the AI cybersecurity assistant for threat guidance",
    icon: "BotMessageSquare",
    category: "activity",
    target: 1,
    unit: "queries",
  },
];

export interface EvaluatedAchievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string | null;
  progress: {
    current: number;
    target: number;
    unit: string;
    percentage: number;
  };
}

/**
 * Evaluates all achievements for a user, records newly unlocked achievements, and sends notifications
 */
export async function checkAchievements(userId: string): Promise<{
  all: EvaluatedAchievement[];
  recent: EvaluatedAchievement[];
  newlyUnlocked: EvaluatedAchievement[];
}> {
  // 1. Fetch user metrics
  const user = (await db.query.users.findFirst({
    where: eq(users.id, userId),
  })) as any;

  if (!user) {
    return { all: [], recent: [], newlyUnlocked: [] };
  }

  const [userScans, userQuizzes, userChats, userBadges, dbAchievements] = await Promise.all([
    db.query.scans.findMany({ where: eq(scans.userId, userId) }) as Promise<any[]>,
    db.query.quizAttempts.findMany({ where: eq(quizAttempts.userId, userId) }) as Promise<any[]>,
    db.query.chatMessages.findMany({ where: eq(chatMessages.userId, userId) }) as Promise<any[]>,
    db.query.userAchievements.findMany({ where: eq(userAchievements.userId, userId) }) as Promise<any[]>,
    db.query.achievements.findMany() as Promise<any[]>,
  ]);

  const existingBadgeMap = new Map<string, any>();
  for (const b of userBadges) {
    if (b.badgeKey) existingBadgeMap.set(b.badgeKey, b);
  }

  // Pre-calculate user metric values
  const totalScansCount = userScans.length;
  const totalQuizzesCount = userQuizzes.length;
  const maxQuizScore = userQuizzes.length > 0 ? Math.max(...userQuizzes.map((q) => q.percentage || q.score || 0)) : 0;
  const hasPerfectScore = userQuizzes.some((q) => (q.percentage || q.score) === 100);
  const urlScansCount = userScans.filter((s) => s.type?.toLowerCase() === "url").length;
  const emailScansCount = userScans.filter((s) => s.type?.toLowerCase() === "email").length;
  const loginStreakDays = user.loginStreak || 1;
  const currentSecurityScore = user.securityScore || 75;
  const chatMessagesCount = userChats.length;

  const newlyUnlocked: EvaluatedAchievement[] = [];
  const evaluatedAll: EvaluatedAchievement[] = [];

  for (const def of ALL_ACHIEVEMENT_DEFINITIONS) {
    let currentVal = 0;
    let shouldUnlock = false;

    switch (def.code) {
      case "first_scan":
        currentVal = totalScansCount;
        shouldUnlock = currentVal >= 1;
        break;
      case "first_quiz":
        currentVal = totalQuizzesCount;
        shouldUnlock = currentVal >= 1;
        break;
      case "quiz_master":
        currentVal = totalQuizzesCount;
        shouldUnlock = currentVal >= 5;
        break;
      case "security_expert":
        currentVal = maxQuizScore;
        shouldUnlock = currentVal >= 90;
        break;
      case "url_guardian":
        currentVal = urlScansCount;
        shouldUnlock = currentVal >= 5;
        break;
      case "phishing_detector":
        currentVal = emailScansCount;
        shouldUnlock = currentVal >= 5;
        break;
      case "active_user":
        currentVal = loginStreakDays;
        shouldUnlock = currentVal >= 7;
        break;
      case "security_champion":
        currentVal = currentSecurityScore;
        shouldUnlock = currentVal >= 90;
        break;
      case "perfect_score":
        currentVal = hasPerfectScore ? 100 : maxQuizScore;
        shouldUnlock = hasPerfectScore;
        break;
      case "curious_mind":
        currentVal = chatMessagesCount;
        shouldUnlock = currentVal >= 1;
        break;
      default:
        currentVal = 0;
        shouldUnlock = false;
    }

    const progressPercentage = Math.min(100, Math.round((currentVal / def.target) * 100));
    const alreadyUnlocked = existingBadgeMap.has(def.code);

    const evaluatedItem: EvaluatedAchievement = {
      code: def.code,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      unlocked: alreadyUnlocked || shouldUnlock,
      unlockedAt: alreadyUnlocked
        ? new Date(existingBadgeMap.get(def.code).unlockedAt).toISOString()
        : shouldUnlock
        ? new Date().toISOString()
        : null,
      progress: {
        current: currentVal,
        target: def.target,
        unit: def.unit,
        percentage: progressPercentage,
      },
    };

    evaluatedAll.push(evaluatedItem);

    // If should unlock and not already in userAchievements, save to DB and notify!
    if (shouldUnlock && !alreadyUnlocked) {
      newlyUnlocked.push(evaluatedItem);

      try {
        const matchingDbAch = dbAchievements.find((a) => a.code === def.code);
        await db.insert(userAchievements).values({
          userId,
          achievementId: matchingDbAch?.id || null,
          badgeKey: def.code,
          title: def.title,
          description: def.description,
          icon: def.icon,
        });

        // Insert celebration notification
        await db.insert(notifications).values({
          userId,
          title: `Achievement Unlocked: ${def.title}! 🏆`,
          message: `Congratulations! You unlocked '${def.title}' — ${def.description}`,
          type: "SUCCESS",
          link: "/dashboard/profile",
        });
      } catch (err) {
        console.error(`Failed to record unlocked achievement ${def.code}:`, err);
      }
    }
  }

  // Pick recent unlocked achievements (up to 3) or top featured
  const unlockedList = evaluatedAll.filter((a) => a.unlocked);
  const recent =
    unlockedList.length > 0
      ? unlockedList.slice(0, 3)
      : evaluatedAll.slice(0, 3);

  return {
    all: evaluatedAll,
    recent,
    newlyUnlocked,
  };
}
