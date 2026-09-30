import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { avatarStorage } from "@/services/storage.service";
import { updateUserAvatar } from "@/services/user.service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "user-demo-id";

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "No avatar image provided." } },
        { status: 400 }
      );
    }

    // 1. Check size limit
    const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: `Avatar file exceeds 2 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
          },
        },
        { status: 400 }
      );
    }

    // 2. Read array buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Save via storage abstraction (performs magic bytes & MIME checks)
    const saved = await avatarStorage.saveAvatar(buffer, file.name, file.type);

    // 4. Update user profile image in database
    const user = await updateUserAvatar(userId, saved.url);

    return NextResponse.json({
      success: true,
      data: {
        url: saved.url,
        fileName: saved.fileName,
        size: saved.size,
        user,
      },
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "UPLOAD_ERROR", message: error.message || "Failed to upload avatar." },
      },
      { status: 400 }
    );
  }
}
