import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens, activityLogs } from "@/db/schema";
import { eq, and, gt, isNull, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { passwordComplexityRegex } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    if (password.length < 8 || !passwordComplexityRegex.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.",
          },
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Look up valid, unexpired, unused token
    const tokenRecord = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.email, normalizedEmail),
        eq(passwordResetTokens.token, hashedToken),
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt)
      ),
    });

    if (!tokenRecord) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid or expired password reset token." },
        },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(password, 12);

    // Update user password and bump tokenVersion to invalidate other active sessions
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User account not found." } },
        { status: 404 }
      );
    }

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        tokenVersion: sql`${users.tokenVersion} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Mark reset token as used
    await db
      .update(passwordResetTokens)
      .set({
        usedAt: new Date(),
      })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    // Activity Log
    await db.insert(activityLogs).values({
      userId: user.id,
      type: "PROFILE_UPDATED",
      title: "Password Reset Completed",
      description: "Password was updated via secure single-use recovery token. Prior sessions invalidated.",
    });

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset. Please log in with your new credentials.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
