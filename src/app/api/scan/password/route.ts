import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { passwordLogSchema } from "@/lib/validation";
import { createScanRecord } from "@/services/scan.service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Login required to log password score audit." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = passwordLogSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid audit data." } },
        { status: 400 }
      );
    }

    const { summary, score, verdict, threatIndicators, details } = result.data;

    // Notice: Never store the actual password string! Only aggregate metadata
    const scanRecord = await createScanRecord({
      userId,
      type: "password",
      inputSummary: summary,
      resultScore: score,
      verdict: verdict as any,
      threatIndicators: threatIndicators || [],
      detailsJson: details,
    });

    return NextResponse.json({
      success: true,
      data: {
        scanId: scanRecord.id,
      },
    });
  } catch (error) {
    console.error("Password audit log error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to log password audit." } },
      { status: 500 }
    );
  }
}
