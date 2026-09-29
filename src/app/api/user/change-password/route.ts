import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { changeUserPassword } from "@/services/user.service";
import { passwordComplexityRegex } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "user-demo-id";

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Current password is required." } },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "New password must be at least 8 characters long." } },
        { status: 400 }
      );
    }

    if (!passwordComplexityRegex.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.",
          },
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "New passwords do not match." } },
        { status: 400 }
      );
    }

    const result = await changeUserPassword(userId, currentPassword, newPassword);

    return NextResponse.json({
      success: true,
      data: {
        message: "Password changed successfully. Active sessions updated.",
        tokenVersion: result.tokenVersion,
      },
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "PASSWORD_ERROR", message: error.message || "Failed to update password." },
      },
      { status: 400 }
    );
  }
}
