import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUserConversations,
  createConversation,
  clearUserConversations,
} from "@/services/chat.service";
import { conversationCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ success: true, data: { conversations: [] } });
    }

    const conversations = await getUserConversations(userId);
    return NextResponse.json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    console.error("Conversations fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch conversations." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in." } },
        { status: 401 }
      );
    }

    let title = "New Conversation";
    try {
      const body = await req.json();
      const parsed = conversationCreateSchema.safeParse(body);
      if (parsed.success && parsed.data.title) {
        title = parsed.data.title;
      }
    } catch {}

    const conv = await createConversation(userId, title);
    return NextResponse.json({
      success: true,
      data: { conversation: conv },
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create conversation." } },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in." } },
        { status: 401 }
      );
    }

    await clearUserConversations(userId);
    return NextResponse.json({
      success: true,
      data: { cleared: true },
    });
  } catch (error) {
    console.error("Clear conversations error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to clear conversations." } },
      { status: 500 }
    );
  }
}
