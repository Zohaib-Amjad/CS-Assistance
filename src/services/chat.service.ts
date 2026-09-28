import { db } from "@/db";
import { chatMessages, chatConversations, activityLogs } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { getAIProvider } from "@/lib/ai";

/**
 * Get all conversations for a specific user.
 */
export async function getUserConversations(userId: string) {
  return db.query.chatConversations.findMany({
    where: eq(chatConversations.userId, userId),
    orderBy: [desc(chatConversations.updatedAt)],
  });
}

/**
 * Get all messages for a conversation belonging to a user.
 */
export async function getConversationMessages(userId: string, conversationId: string) {
  // Ensure conversation belongs to user
  const conversation = await db.query.chatConversations.findFirst({
    where: and(
      eq(chatConversations.id, conversationId),
      eq(chatConversations.userId, userId)
    ),
  });

  if (!conversation) {
    return null;
  }

  const messages = await db.query.chatMessages.findMany({
    where: eq(chatMessages.conversationId, conversationId),
    orderBy: [asc(chatMessages.createdAt)],
  });

  return { conversation, messages };
}

/**
 * Create a new conversation for a user.
 */
export async function createConversation(userId: string, title = "New Conversation") {
  const [conv] = await db
    .insert(chatConversations)
    .values({
      userId,
      title: title.slice(0, 100),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return conv;
}

/**
 * Rename a conversation title.
 */
export async function renameConversation(userId: string, conversationId: string, newTitle: string) {
  const [updated] = await db
    .update(chatConversations)
    .set({
      title: newTitle.slice(0, 100),
      updatedAt: new Date(),
    })
    .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)))
    .returning();

  return updated;
}

/**
 * Delete a specific conversation (cascades to messages).
 */
export async function deleteConversation(userId: string, conversationId: string) {
  // Delete messages first to be clean across any SQLite foreign key constraints
  await db
    .delete(chatMessages)
    .where(and(eq(chatMessages.conversationId, conversationId), eq(chatMessages.userId, userId)));

  const [deleted] = await db
    .delete(chatConversations)
    .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)))
    .returning();

  return deleted;
}

/**
 * Clear all conversations and messages for a user.
 */
export async function clearUserConversations(userId: string) {
  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
  await db.delete(chatConversations).where(eq(chatConversations.userId, userId));
  return true;
}

/**
 * Backwards compatibility helper for session-based message fetching.
 */
export async function getUserChatHistory(userId: string, sessionId = "default") {
  return db.query.chatMessages.findMany({
    where: and(eq(chatMessages.userId, userId), eq(chatMessages.sessionId, sessionId)),
    orderBy: [asc(chatMessages.createdAt)],
  });
}

/**
 * Main chat interaction handler. Persists user message, queries AI, persists assistant response.
 */
export async function sendChatMessage(
  userId: string,
  content: string,
  conversationId?: string,
  sessionId = "default"
) {
  let convId: string = "";
  let isNewConv = false;

  // 1. Find or create conversation
  if (conversationId) {
    const existing = await db.query.chatConversations.findFirst({
      where: and(
        eq(chatConversations.id, conversationId),
        eq(chatConversations.userId, userId)
      ),
    });
    if (existing) {
      convId = existing.id;
    }
  }

  if (!convId) {
    isNewConv = true;
    const cleanTitle = content
      .replace(/[#*`_~[\]]/g, "")
      .trim()
      .slice(0, 36);
    const newConv = await createConversation(
      userId,
      cleanTitle.length > 0 ? (cleanTitle.length > 33 ? `${cleanTitle}...` : cleanTitle) : "Cyber Security Inquiry"
    );
    convId = newConv.id;
  } else {
    // If conversation is titled "New Conversation", auto-update title from first message
    const conv = await db.query.chatConversations.findFirst({
      where: eq(chatConversations.id, convId),
    });
    if (conv && (conv.title === "New Conversation" || conv.title === "New Chat")) {
      const cleanTitle = content
        .replace(/[#*`_~[\]]/g, "")
        .trim()
        .slice(0, 36);
      if (cleanTitle.length > 0) {
        await renameConversation(
          userId,
          convId,
          cleanTitle.length > 33 ? `${cleanTitle}...` : cleanTitle
        );
      }
    }
  }

  // 2. Save user message to DB
  const [savedUserMsg] = await db
    .insert(chatMessages)
    .values({
      userId,
      conversationId: convId,
      sessionId,
      role: "user",
      content,
      createdAt: new Date(),
    })
    .returning();

  // 3. Fetch recent history for context (last ~10 messages)
  const history = await db.query.chatMessages.findMany({
    where: eq(chatMessages.conversationId, convId),
    orderBy: [desc(chatMessages.createdAt)],
    limit: 10,
  });


  const orderedHistory = history.reverse().map((h: { role: string; content: string }) => ({
    role: (h.role.toLowerCase() as "user" | "assistant" | "system") || "user",
    content: h.content,
  }));


  // 4. Get AI response
  const ai = getAIProvider();
  const aiResponse = await ai.answerCyberQuestion(content, orderedHistory);

  // 5. Save assistant response
  const [savedAssistantMsg] = await db
    .insert(chatMessages)
    .values({
      userId,
      conversationId: convId,
      sessionId,
      role: "assistant",
      content: aiResponse.content,
      metadataJson: JSON.stringify({
        source: aiResponse.source,
        suggestedFollowUps: aiResponse.suggestedFollowUps || [],
      }),
      createdAt: new Date(),
    })
    .returning();

  // 6. Update conversation timestamp
  await db
    .update(chatConversations)
    .set({ updatedAt: new Date() })
    .where(eq(chatConversations.id, convId));

  // 7. Log activity on new conversation or periodically
  if (isNewConv) {
    try {
      await db.insert(activityLogs).values({
        userId,
        type: "AI_CHAT",
        title: "AI Security Assistant Consulted",
        description: `Asked: "${content.slice(0, 45)}${content.length > 45 ? "..." : ""}"`,
        createdAt: new Date(),
      });
    } catch (err) {
      console.warn("Failed to insert chat activity log:", err);
    }
  }

  const updatedConv = await db.query.chatConversations.findFirst({
    where: eq(chatConversations.id, convId),
  });

  return {
    conversationId: convId,
    conversationTitle: updatedConv?.title || "Chat Session",
    userMessage: savedUserMsg,
    message: savedAssistantMsg,
    source: aiResponse.source,
    suggestedFollowUps: aiResponse.suggestedFollowUps || [],
  };
}

