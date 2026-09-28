import { NextResponse } from "next/server";
import { getQuizQuestions } from "@/services/quiz.service";

export async function GET() {
  try {
    const questions = await getQuizQuestions(10);
    return NextResponse.json({
      success: true,
      data: { questions },
    });
  } catch (error) {
    console.error("Fetch quiz questions error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch questions." } },
      { status: 500 }
    );
  }
}
