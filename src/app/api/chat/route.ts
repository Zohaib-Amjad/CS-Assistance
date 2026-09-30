import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { chatMessageSchema } from "@/lib/validation";
import {
  sendChatMessage,
  getUserChatHistory,
  getConversationMessages,
  getUserConversations,
} from "@/services/chat.service";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ success: true, data: { messages: [], conversations: [] } });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const sessionId = searchParams.get("sessionId");

    if (conversationId) {
      const convData = await getConversationMessages(userId, conversationId);
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
    }

    if (sessionId) {
      const messages = await getUserChatHistory(userId, sessionId);
      return NextResponse.json({
        success: true,
        data: { messages },
      });
    }

    // Default: Return latest conversations and recent messages
    const conversations = await getUserConversations(userId);
    let messages: any[] = [];
    if (conversations.length > 0) {
      const latest = await getConversationMessages(userId, conversations[0].id);
      messages = latest?.messages || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        messages,
        activeConversationId: conversations[0]?.id || null,
      },
    });
  } catch (error) {
    console.error("Chat fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch chat history." } },
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
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to chat with CyberGuard AI." } },
        { status: 401 }
      );
    }

    // Per-minute rate limit: 30 requests / 60 seconds
    const rateLimitMin = await checkRateLimit(userId, "chat_message_min", { maxRequests: 30, windowSeconds: 60 });
    if (!rateLimitMin.success) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Message rate limit reached. Please wait a moment." } },
        { status: 429 }
      );
    }

    // Per-day rate limit: 250 requests / 86400 seconds
    const rateLimitDay = await checkRateLimit(userId, "chat_message_day", { maxRequests: 250, windowSeconds: 86400 });
    if (!rateLimitDay.success) {
      return NextResponse.json(
        { success: false, error: { code: "DAILY_LIMIT_REACHED", message: "Daily AI query limit reached. Please try again tomorrow." } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = chatMessageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message || "Invalid message format." } },
        { status: 400 }
      );
    }

    const { message, conversationId, sessionId } = result.data;
    const chatResult = await sendChatMessage(
      userId,
      message,
      conversationId,
      sessionId || "default"
    );

    return NextResponse.json({
      success: true,
      data: chatResult,
    });
  } catch (error) {
    console.error("Chat send error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process chat message." } },
      { status: 500 }
    );
  }
}
