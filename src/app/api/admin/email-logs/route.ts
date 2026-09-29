import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getEmailLogsAdmin } from "@/services/admin.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authCheck = await requireAdminApi();
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: authCheck.error } },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    const result = await getEmailLogsAdmin({ search, page, limit });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Admin email logs error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch email logs." } },
      { status: 500 }
    );
  }
}
