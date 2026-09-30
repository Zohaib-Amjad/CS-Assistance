import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getConversationMessages,
  renameConversation,
  deleteConversation,
} from "@/services/chat.service";
import { conversationRenameSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in." } },
        { status: 401 }
      );
    }

    const convData = await getConversationMessages(userId, params.id);
    if (!convData) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Conversation not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: convData,
    });
  } catch (error) {
    console.error("Fetch conversation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch conversation." } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = conversationRenameSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0]?.message || "Invalid title." } },
        { status: 400 }
      );
    }

    const updated = await renameConversation(userId, params.id, parsed.data.title);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Conversation not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { conversation: updated },
    });
  } catch (error) {
    console.error("Rename conversation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to rename conversation." } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in." } },
        { status: 401 }
      );
    }

    const deleted = await deleteConversation(userId, params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Conversation not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete conversation." } },
      { status: 500 }
    );
  }
}
