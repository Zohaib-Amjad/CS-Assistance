import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { urlScanSchema } from "@/lib/validation";
import { scanUrlSafely } from "@/lib/detection/url-scanner";
import { createScanRecord } from "@/services/scan.service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";

    const rateLimit = await checkRateLimit(userId || ip, "scan_url", { maxRequests: 20, windowSeconds: 60 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Scan rate limit reached. Please wait a minute." } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = urlScanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message || "Invalid URL." } },
        { status: 400 }
      );
    }

    const { url } = result.data;
    const analysis = await scanUrlSafely(url);

    let scanRecord = null;
    if (userId) {
      scanRecord = await createScanRecord({
        userId,
        type: "url",
        inputSummary: analysis.url,
        resultScore: analysis.score,
        verdict: analysis.verdict,
        threatIndicators: analysis.threatIndicators,
        detailsJson: analysis as any,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        scanId: scanRecord?.id,
      },
    });
  } catch (error) {
    console.error("URL scan error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to scan URL." } },
      { status: 500 }
    );
  }
}
