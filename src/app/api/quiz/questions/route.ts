import { NextResponse } from "next/server";
import { getQuizQuestionsSanitized } from "@/services/quiz.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const quizId = searchParams.get("quizId") || undefined;
    const category = searchParams.get("category") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    const questions = await getQuizQuestionsSanitized({ limit, quizId, category, difficulty });
    return NextResponse.json({
      success: true,
      data: { questions, totalQuestions: questions.length },
    });
  } catch (error) {
    console.error("Fetch quiz questions error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch questions." } },
      { status: 500 }
    );
  }
}
