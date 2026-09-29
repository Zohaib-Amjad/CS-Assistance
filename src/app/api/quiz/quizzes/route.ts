import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPublishedQuizzes, getUserQuizHistory } from "@/services/quiz.service";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const publishedQuizzes = await getPublishedQuizzes();

    let userHistory: any = {
      attempts: [],
      bestScore: 0,
      totalCompleted: 0,
      passedCount: 0,
    };

    if (userId) {
      userHistory = await getUserQuizHistory(userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        quizzes: publishedQuizzes,
        history: userHistory.attempts,
        bestScore: userHistory.bestScore,
        totalCompleted: userHistory.totalCompleted,
        passedCount: userHistory.passedCount,
      },
    });
  } catch (error) {
    console.error("Fetch published quizzes error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch quizzes." } },
      { status: 500 }
    );
  }
}
