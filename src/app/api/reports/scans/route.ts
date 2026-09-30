import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserScans } from "@/services/scan.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ success: true, data: { scans: [] } });
    }

    const scans = await getUserScans(userId, 50);
    return NextResponse.json({
      success: true,
      data: { scans },
    });
  } catch (error) {
    console.error("Fetch report scans error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch scans." } },
      { status: 500 }
    );
  }
}
