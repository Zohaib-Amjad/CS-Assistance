import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteUserAccount } from "@/services/user.service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to delete your account." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { password, confirmationText } = body;

    if (confirmationText !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please type 'DELETE MY ACCOUNT' to confirm account deletion.",
          },
        },
        { status: 400 }
      );
    }

    await deleteUserAccount(userId, password || "");

    return NextResponse.json({
      success: true,
      data: { message: "Account and associated data deleted successfully." },
    });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "DELETE_ERROR", message: error.message || "Failed to delete account." },
      },
      { status: 400 }
    );
  }
}
