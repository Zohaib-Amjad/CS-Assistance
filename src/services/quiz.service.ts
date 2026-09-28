import { db } from "@/db";
import { quizQuestions, quizAttempts, userAchievements, activityLogs } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { recalculateSecurityScore } from "./user.service";

export async function getQuizQuestions(limit = 10) {
  const all = await db.query.quizQuestions.findMany();
  const shuffled = [...all].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

export async function submitQuizAttempt(
  userId: string,
  answers: Record<string, number>,
  timeTakenSec: number
) {
  const questions = await db.query.quizQuestions.findMany();
  const qMap = new Map<string, any>(questions.map((q: any) => [q.id, q]));

  let correctCount = 0;
  let totalCount = Object.keys(answers).length;
  const questionDetails = [];

  for (const [qId, selectedOption] of Object.entries(answers)) {
    const q = qMap.get(qId);
    if (q) {
      const isCorrect = (q.correctOption || q.correctIndex + 1) === selectedOption;
      if (isCorrect) correctCount++;
      questionDetails.push({
        questionId: q.id,
        question: q.question,
        selectedOption,
        correctOption: q.correctOption || q.correctIndex + 1,
        isCorrect,
        explanation: q.explanation,
      });
    }
  }

  const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const passed = scorePercentage >= 70;

  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      userId,
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

  // Log activity
  await db.insert(activityLogs).values({
    userId,
    type: "QUIZ_COMPLETED",
    title: "Cyber Defense Quiz Completed",
    description: `Score: ${scorePercentage}% (${correctCount}/${totalCount} correct)`,
    metadata: { score: scorePercentage, passed },
  });

  if (scorePercentage === 100) {
    const existing = await db.query.userAchievements.findFirst({
      where: and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.badgeKey, "quiz_champion")
      ),
    });
    if (!existing) {
      await db.insert(userAchievements).values({
        userId,
        badgeKey: "quiz_champion",
        title: "Quiz Champion",
        description: "Scored a flawless 100% on a cybersecurity quiz",
        icon: "Trophy",
      });
    }
  }

  await recalculateSecurityScore(userId);

  return {
    attemptId: attempt.id,
    score: scorePercentage,
    correctCount,
    totalCount,
    passed,
    details: questionDetails,
  };
}

export async function getUserQuizHistory(userId: string) {
  return db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
    orderBy: [desc(quizAttempts.createdAt)],
    limit: 10,
  });
}
