import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import {
  getBlockedDomainsAdmin,
  getAIProviderStatusAdmin,
} from "@/services/admin.service";

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

    const [blocked, aiStatus] = await Promise.all([
      getBlockedDomainsAdmin(),
      getAIProviderStatusAdmin(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        blockedDomains: blocked,
        aiStatus,
        maintenanceMode: false,
        bannerMessage: "SOC Telemetry online. Threat signature engine active.",
      },
    });
  } catch (error: any) {
    console.error("Admin settings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch admin settings." } },
      { status: 500 }
    );
  }
}
