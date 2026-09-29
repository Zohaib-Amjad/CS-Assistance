import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getUsersAdmin, createUserAdmin } from "@/services/admin.service";

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
    const status = searchParams.get("status") || undefined;
    const role = searchParams.get("role") || undefined;
    const plan = searchParams.get("plan") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || undefined;
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || undefined;

    const result = await getUsersAdmin({
      search,
      status,
      role,
      plan,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch users." } },
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
    const { name, email, password, role, plan, status, country } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name and email are required." } },
        { status: 400 }
      );
    }

    const created = await createUserAdmin(authCheck.user.id, authCheck.user.email, {
      name,
      email,
      password,
      role,
      plan,
      status,
      country,
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    console.error("Admin create user error:", error);
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: error.message || "Failed to create user." } },
      { status: 400 }
    );
  }
}
