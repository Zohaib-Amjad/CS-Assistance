import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkAchievements } from "@/services/achievement.service";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || "user-demo-id";

    const results = await checkAchievements(userId);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Fetch achievements error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch achievements." } },
      { status: 500 }
    );
  }
}
