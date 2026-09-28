import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getUserById } from "@/services/user.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const adminUser = await getUserById(session.user.id);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required." } },
        { status: 403 }
      );
    }

    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    const sanitizedUsers = allUsers.map((u: any) => {
      const { passwordHash, ...safe } = u;
      return safe;
    });

    return NextResponse.json({
      success: true,
      data: {
        users: sanitizedUsers,
      },
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch users list." } },
      { status: 500 }
    );
  }
}
