import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { quizSubmissionSchema } from "@/lib/validation";
import { submitQuizAttempt } from "@/services/quiz.service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in to submit quiz attempts." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = quizSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid quiz submission format." } },
        { status: 400 }
      );
    }

    const { answers, timeTakenSec } = result.data;
    const evaluation = await submitQuizAttempt(userId, answers, timeTakenSec);

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process quiz submission." } },
      { status: 500 }
    );
  }
}
