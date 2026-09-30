import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfileData, updateUserProfile } from "@/services/user.service";
import { profileUpdateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || "user-demo-id";

    const profileData = await getUserProfileData(userId);
    if (!profileData) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile." } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "user-demo-id";

    const body = await req.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid profile data format.",
            details: result.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const updated = await updateUserProfile(userId, result.data);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update profile." },
      },
      { status: 500 }
    );
  }
}
