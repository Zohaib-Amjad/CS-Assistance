import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getAdminMetrics } from "@/services/admin.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authCheck = await requireAdminApi();
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: authCheck.error } },
        { status: authCheck.status }
      );
    }

    const metrics = await getAdminMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    console.error("Admin metrics error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch metrics." } },
      { status: 500 }
    );
  }
}
