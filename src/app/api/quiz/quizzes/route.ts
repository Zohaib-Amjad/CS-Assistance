import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPublishedQuizzes, getUserQuizHistory, deleteQuizAttempt } from "@/services/quiz.service";

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

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let attemptId = searchParams.get("attemptId") || searchParams.get("id");

    if (!attemptId) {
      try {
        const body = await req.json();
        attemptId = body.attemptId || body.id;
      } catch {}
    }

    if (!attemptId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Attempt ID is required." } },
        { status: 400 }
      );
    }

    const deleted = await deleteQuizAttempt(attemptId, userId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Quiz attempt not found or already deleted." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Quiz attempt removed successfully." },
    });
  } catch (error) {
    console.error("Delete quiz attempt error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete attempt." } },
      { status: 500 }
    );
  }
}

