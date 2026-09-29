import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || "user-demo-id";

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        emailNotifications: true,
        securityAlerts: true,
        quizReminders: true,
        twoFactorEnabled: user.twoFaEnabled,
        theme: "system",
      },
    });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch settings." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "user-demo-id";

    const body = await req.json();
    const { emailNotifications, securityAlerts, quizReminders, twoFactorEnabled } = body;

    if (twoFactorEnabled !== undefined) {
      await db
        .update(users)
        .set({
          twoFaEnabled: !!twoFactorEnabled,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Log activity
    await db.insert(activityLogs).values({
      userId,
      type: "PROFILE_UPDATED",
      title: "Settings Saved",
      description: "Notification preferences and security options updated",
      metadata: body,
    });

    return NextResponse.json({
      success: true,
      data: {
        emailNotifications: !!emailNotifications,
        securityAlerts: !!securityAlerts,
        quizReminders: !!quizReminders,
        twoFactorEnabled: !!twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to save settings." } },
      { status: 500 }
    );
  }
}
