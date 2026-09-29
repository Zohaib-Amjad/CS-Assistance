import { db } from "@/db";
import {
  quizzes,
  quizQuestions,
  quizAttempts,
  userAchievements,
  achievements,
  activityLogs,
  notifications,
  securityTips,
} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { recalculateSecurityScore } from "./user.service";

export interface SanitizedQuestion {
  id: string;
  quizId: string | null;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
}

export interface QuizSubmissionDetail {
  questionId: string;
  question: string;
  selectedOption: string | number;
  correctOptionText: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizEvaluationResult {
  attemptId: string;
  score: number; // e.g. 8 (out of 10)
  correctCount: number;
  totalCount: number;
  totalQuestions: number;
  percentage: number; // e.g. 80
  durationSeconds: number;
  timeTakenSec: number;
  passed: boolean;
  details: QuizSubmissionDetail[];
  securityTips: Array<{
    id: string;
    title: string;
    category: string;
    tip: string;
    actionPrompt?: string | null;
  }>;
}

/**
 * Shuffle an array in-place / copy using Fisher-Yates
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j]!;
    arr[j] = temp!;
  }
  return arr;
}

/**
 * Fetch published quizzes with question counts and categories
 */
export async function getPublishedQuizzes() {
  const allQuizzes = (await db.query.quizzes.findMany({
    where: eq(quizzes.isPublished, true),
    orderBy: [desc(quizzes.createdAt)],
  })) as any[];

  const allQuestions = (await db.query.quizQuestions.findMany()) as any[];

  return allQuizzes.map((quiz: any) => {
    const questionCount = allQuestions.filter((q: any) => q.quizId === quiz.id).length;
    return {
      ...quiz,
      questionCount: questionCount > 0 ? questionCount : 10,
    };
  });
}

/**
 * Fetch randomized questions WITHOUT answers/explanations (anti-cheat server-side protection)
 */
export async function getQuizQuestionsSanitized(params?: {
  quizId?: string;
  category?: string;
  difficulty?: string;
  limit?: number;
}): Promise<SanitizedQuestion[]> {
  const limit = params?.limit || 10;
  let allQuestions = (await db.query.quizQuestions.findMany()) as any[];

  if (params?.quizId && params.quizId !== "all") {
    allQuestions = allQuestions.filter((q: any) => q.quizId === params.quizId);
  }

  if (params?.category && params.category !== "All") {
    allQuestions = allQuestions.filter(
      (q: any) => q.category?.toLowerCase() === params?.category?.toLowerCase()
    );
  }

  if (params?.difficulty && params.difficulty !== "All") {
    allQuestions = allQuestions.filter(
      (q: any) => q.difficulty?.toLowerCase() === params?.difficulty?.toLowerCase()
    );
  }

  // Fallback to all if filtered result is too small
  if (allQuestions.length === 0) {
    allQuestions = (await db.query.quizQuestions.findMany()) as any[];
  }

  const randomizedQuestions = shuffleArray(allQuestions).slice(0, limit);

  return randomizedQuestions.map((q: any) => {
    // Extract 4 options
    let rawOptions: string[] = [];
    if (Array.isArray(q.options) && q.options.length > 0) {
      rawOptions = (q.options as any[]).map(String);
    } else {
      rawOptions = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean) as string[];
    }

    if (rawOptions.length < 2) {
      rawOptions = ["Option A", "Option B", "Option C", "Option D"];
    }

    // Shuffle options for this question
    const shuffledOptions = shuffleArray(rawOptions);

    return {
      id: q.id,
      quizId: q.quizId,
      category: q.category || "General Security",
      difficulty: q.difficulty || "Beginner",
      question: q.question,
      options: shuffledOptions,
      // NOTE: correctIndex, correctOption, and explanation are explicitly omitted for anti-cheat
    };
  });
}

/**
 * Backwards compatible getQuizQuestions
 */
export async function getQuizQuestions(limit = 10) {
  return getQuizQuestionsSanitized({ limit });
}

/**
 * Log activity when user starts a quiz
 */
export async function recordQuizStart(userId: string, quizTitle = "Cyber Defense Challenge", quizId?: string) {
  try {
    await db.insert(activityLogs).values({
      userId,
      type: "QUIZ_STARTED",
      title: "Cyber Defense Quiz Started",
      description: `User started the "${quizTitle}" knowledge challenge`,
      metadata: { quizId, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error("Failed to log QUIZ_STARTED activity:", err);
  }
}

/**
 * Server-side grading of quiz submission, score calculation, activity logging, notification & achievements
 */
export async function submitQuizAttempt(
  userId: string,
  answers: Record<string, string | number>,
  timeTakenSec: number,
  quizId?: string
): Promise<QuizEvaluationResult> {
  const questionIds = Object.keys(answers);
  const questions = (await db.query.quizQuestions.findMany()) as any[];
  const qMap = new Map<string, any>(questions.map((q: any) => [q.id, q]));

  let correctCount = 0;
  const totalCount = questionIds.length > 0 ? questionIds.length : questions.length;
  const questionDetails: QuizSubmissionDetail[] = [];

  for (const qId of questionIds) {
    const q = qMap.get(qId);
    if (!q) continue;

    // Identify correct answer text
    let correctText = "";
    if (Array.isArray(q.options) && q.options.length > 0) {
      const idx = typeof q.correctIndex === "number" ? q.correctIndex : (q.correctOption ? q.correctOption - 1 : 0);
      correctText = String(q.options[idx] ?? q.options[0]);
    } else {
      const optIdx = q.correctOption || (typeof q.correctIndex === "number" ? q.correctIndex + 1 : 1);
      if (optIdx === 1) correctText = q.optionA || "";
      else if (optIdx === 2) correctText = q.optionB || "";
      else if (optIdx === 3) correctText = q.optionC || "";
      else correctText = q.optionD || "";
    }

    const userVal = answers[qId];
    let isCorrect = false;

    if (typeof userVal === "string") {
      // Direct string comparison
      isCorrect = userVal.trim().toLowerCase() === correctText.trim().toLowerCase();
    } else if (typeof userVal === "number") {
      // 1-based or 0-based option number comparison
      const targetOption1Based = q.correctOption || (typeof q.correctIndex === "number" ? q.correctIndex + 1 : 1);
      const targetOption0Based = typeof q.correctIndex === "number" ? q.correctIndex : targetOption1Based - 1;
      isCorrect = userVal === targetOption1Based || userVal === targetOption0Based;
    }

    if (isCorrect) correctCount++;

    questionDetails.push({
      questionId: q.id,
      question: q.question,
      selectedOption: userVal ?? "",
      correctOptionText: correctText,
      isCorrect,
      explanation: q.explanation || "Review fundamental cybersecurity best practices for this category.",
    });
  }

  const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const passed = scorePercentage >= 70;

  // 1. Insert quiz attempt record
  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      userId,
      quizId: quizId || null,
      score: scorePercentage,
      total: totalCount,
      totalQuestions: totalCount,
      percentage: scorePercentage,
      durationSeconds: timeTakenSec,
      timeTakenSec,
      passed,
      answers: questionDetails,
      answersJson: JSON.stringify(questionDetails),
    })
    .returning();

  // 2. Insert QUIZ_COMPLETED activity log
  try {
    await db.insert(activityLogs).values({
      userId,
      type: "QUIZ_COMPLETED",
      title: "Cyber Defense Quiz Completed",
      description: `Scored ${scorePercentage}% (${correctCount}/${totalCount} correct) in ${timeTakenSec}s`,
      metadata: {
        score: scorePercentage,
        correctCount,
        totalCount,
        passed,
        timeTakenSec,
        quizId,
      },
    });
  } catch (err) {
    console.error("Failed to log QUIZ_COMPLETED activity:", err);
  }

  // 3. Create user notification
  try {
    await db.insert(notifications).values({
      userId,
      title: passed ? "Quiz Passed! 🛡️" : "Quiz Knowledge Completed",
      message: passed
        ? `Great job! You passed the cybersecurity quiz with a score of ${scorePercentage}% (${correctCount}/${totalCount}).`
        : `You completed the cybersecurity challenge with ${scorePercentage}%. Check out the explanation tips to level up!`,
      type: passed ? "SUCCESS" : "INFO",
      link: "/dashboard/quiz",
    });
  } catch (err) {
    console.error("Failed to create quiz notification:", err);
  }

  // 4. Check & award achievements
  try {
    // 100% Champion
    if (scorePercentage === 100) {
      const existingChamp = await db.query.userAchievements.findFirst({
        where: and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.badgeKey, "quiz_champion")
        ),
      });
      if (!existingChamp) {
        const champDef = await db.query.achievements.findFirst({
          where: eq(achievements.code, "quiz_champion"),
        });
        await db.insert(userAchievements).values({
          userId,
          achievementId: champDef?.id,
          badgeKey: "quiz_champion",
          title: "Quiz Champion",
          description: "Scored a flawless 100% on a cybersecurity quiz",
          icon: "Trophy",
        });
      }
    }

    // First scan/quiz achievement
    const attemptsCount = (await db.query.quizAttempts.findMany({
      where: eq(quizAttempts.userId, userId),
    })) as any[];
    if (attemptsCount.length === 1) {
      const existingFirst = await db.query.userAchievements.findFirst({
        where: and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.badgeKey, "first_scan")
        ),
      });
      if (!existingFirst) {
        const firstDef = await db.query.achievements.findFirst({
          where: eq(achievements.code, "first_scan"),
        });
        await db.insert(userAchievements).values({
          userId,
          achievementId: firstDef?.id,
          badgeKey: "first_scan",
          title: "First Scan & Challenge",
          description: "Completed your first security inspection or quiz challenge.",
          icon: "ShieldCheck",
        });
      }
    }
  } catch (err) {
    console.error("Failed to process quiz achievements:", err);
  }

  // 5. Recalculate security score
  try {
    await recalculateSecurityScore(userId);
  } catch (err) {
    console.error("Failed to recalculate security score:", err);
  }

  // 6. Fetch 2-3 relevant security tips
  const tips = (await db.query.securityTips.findMany({
    limit: 3,
  })) as any[];

  return {
    attemptId: attempt.id,
    score: correctCount,
    correctCount,
    totalCount,
    totalQuestions: totalCount,
    percentage: scorePercentage,
    durationSeconds: timeTakenSec,
    timeTakenSec,
    passed,
    details: questionDetails,
    securityTips: tips.map((t: any) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      tip: t.tip || t.text || "",
      actionPrompt: t.actionPrompt || null,
    })),
  };
}

/**
 * Fetch past attempts and stats for user
 */
export async function getUserQuizHistory(userId: string) {
  const attempts = (await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
    orderBy: [desc(quizAttempts.createdAt)],
    limit: 20,
  })) as any[];

  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a: any) => a.score || a.percentage || 0)) : 0;
  const totalCompleted = attempts.length;
  const passedCount = attempts.filter((a: any) => a.passed).length;

  return {
    attempts,
    bestScore,
    totalCompleted,
    passedCount,
  };
}
