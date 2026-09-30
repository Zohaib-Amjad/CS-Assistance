import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getQuizQuestionsSanitized, recordQuizStart } from "@/services/quiz.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId") || undefined;
    const category = searchParams.get("category") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const session = await auth();
    if (session?.user?.id) {
      await recordQuizStart(session.user.id, category || "Cyber Awareness Quiz", quizId);
    }

    const questions = await getQuizQuestionsSanitized({
      quizId,
      category,
      difficulty,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        questions,
        totalQuestions: questions.length,
      },
    });
  } catch (error) {
    console.error("Fetch quiz start error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to initialize quiz." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { quizId, category, difficulty, limit = 10, title } = body;

    const session = await auth();
    if (session?.user?.id) {
      await recordQuizStart(session.user.id, title || category || "Cyber Awareness Quiz", quizId);
    }

    const questions = await getQuizQuestionsSanitized({
      quizId,
      category,
      difficulty,
      limit: typeof limit === "number" ? limit : 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        questions,
        totalQuestions: questions.length,
      },
    });
  } catch (error) {
    console.error("Quiz start error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to start quiz session." } },
      { status: 500 }
    );
  }
}
