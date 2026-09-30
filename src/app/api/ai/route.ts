import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { chatMessageSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendChatMessage } from "@/services/chat.service";
import { getAIProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

    // Rate limits
    const rateLimitMin = await checkRateLimit(userId, "chat_message_min", { maxRequests: 30, windowSeconds: 60 });
    if (!rateLimitMin.success) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Rate limit reached. Please slow down." } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = chatMessageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message || "Invalid input." } },
        { status: 400 }
      );
    }

    const { message, conversationId, sessionId } = result.data;

    // Send and persist chat message
    const chatResult = await sendChatMessage(
      userId,
      message,
      conversationId,
      sessionId || "default"
    );

    const fullContent = chatResult.message.content;
    const words = fullContent.split(" ");
    const encoder = new TextEncoder();

    // Create a ReadableStream that delivers tokens smoothly
    const stream = new ReadableStream({
      async start(controller) {
        // First send metadata as JSON line
        const metaEvent = JSON.stringify({
          type: "meta",
          conversationId: chatResult.conversationId,
          conversationTitle: chatResult.conversationTitle,
          messageId: chatResult.message.id,
          createdAt: chatResult.message.createdAt,
          suggestedFollowUps: chatResult.suggestedFollowUps,
        }) + "\n";
        controller.enqueue(encoder.encode(metaEvent));

        // Stream text chunks
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i < words.length - 1 ? " " : "");
          const textEvent = JSON.stringify({
            type: "chunk",
            text: chunk,
          }) + "\n";
          controller.enqueue(encoder.encode(textEvent));
          // Micro-pause for realistic streaming cadence
          await new Promise((r) => setTimeout(r, 12));
        }

        // Final done event
        controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Streaming error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate AI response." } },
      { status: 500 }
    );
  }
}
