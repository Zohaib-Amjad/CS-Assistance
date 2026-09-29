import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { quizSubmissionSchema } from "@/lib/validation";
import { submitQuizAttempt } from "@/services/quiz.service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      // Fallback for demo or guest mode if needed, but in authenticated app we require auth or demo user
      userId = "user-demo-id";
    }

    const body = await req.json();
    const result = quizSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid quiz submission format.",
            details: result.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const { answers, timeTakenSec, quizId } = result.data;
    const evaluation = await submitQuizAttempt(userId, answers, timeTakenSec, quizId);

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
