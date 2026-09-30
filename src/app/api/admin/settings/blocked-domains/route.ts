import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import {
  getBlockedDomainsAdmin,
  addBlockedDomainAdmin,
  deleteBlockedDomainAdmin,
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

    const domains = await getBlockedDomainsAdmin();
    return NextResponse.json({ success: true, data: domains });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authCheck = await requireAdminApi();
    if (authCheck.error || !authCheck.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: authCheck.error } },
        { status: authCheck.status || 401 }
      );
    }

    const body = await req.json();
    const { domain, reason } = body;

    if (!domain || !reason) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Domain and reason are required." } },
        { status: 400 }
      );
    }

    const created = await addBlockedDomainAdmin(
      authCheck.user.id,
      authCheck.user.email,
      domain,
      reason
    );

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authCheck = await requireAdminApi();
    if (authCheck.error || !authCheck.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: authCheck.error } },
        { status: authCheck.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Blocked domain ID is required." } },
        { status: 400 }
      );
    }

    await deleteBlockedDomainAdmin(authCheck.user.id, authCheck.user.email, id);

    return NextResponse.json({ success: true, data: { message: "Domain unblocked successfully." } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
