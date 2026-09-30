import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserScans, deleteScanRecord } from "@/services/scan.service";

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

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let scanId = searchParams.get("id");

    if (!scanId) {
      try {
        const body = await req.json();
        scanId = body.id;
      } catch {
        // body was empty or not json
      }
    }

    if (!scanId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Scan ID is required." } },
        { status: 400 }
      );
    }

    const deleted = await deleteScanRecord(scanId, userId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Scan record not found or already deleted." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Scan record deleted successfully." },
    });
  } catch (error) {
    console.error("Delete report scan error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete scan." } },
      { status: 500 }
    );
  }
}

