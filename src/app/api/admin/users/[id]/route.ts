import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import {
  getUserDetailAdmin,
  updateUserAdmin,
  deleteUserAdmin,
} from "@/services/admin.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireAdminApi();
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: authCheck.error } },
        { status: authCheck.status }
      );
    }

    const detail = await getUserDetailAdmin(params.id);
    if (!detail) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: detail,
    });
  } catch (error: any) {
    console.error("Admin fetch user detail error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch user." } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireAdminApi();
    if (authCheck.error || !authCheck.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: authCheck.error } },
        { status: authCheck.status || 401 }
      );
    }

    const body = await req.json();
    const updated = await updateUserAdmin(
      authCheck.user.id,
      authCheck.user.email,
      params.id,
      body
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: error.message || "Failed to update user." } },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireAdminApi();
    if (authCheck.error || !authCheck.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: authCheck.error } },
        { status: authCheck.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") as "soft" | "hard") || "soft";

    const result = await deleteUserAdmin(
      authCheck.user.id,
      authCheck.user.email,
      params.id,
      mode
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ERROR", message: error.message || "Failed to delete user." } },
      { status: 400 }
    );
  }
}
