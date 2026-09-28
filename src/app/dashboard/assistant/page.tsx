"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  AlertCircle,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number | string | Date;
  metadataJson?: string;
  suggestedFollowUps?: string[];
}

interface Conversation {
  id: string;
  title: string;
  createdAt: number | string | Date;
  updatedAt: number | string | Date;
}

const DEFAULT_SUGGESTIONS = [
  "What is phishing?",
  "How can I stay safe?",
  "Why is Multi-Factor Authentication important?",
  "What is Zero Trust security?",
  "How do I secure my home Wi-Fi?",
];

function formatTimeOnly(dateInput: number | string | Date | undefined): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function AssistantPage() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [streamingContent, setStreamingContent] = React.useState("");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
  const [editingConvId, setEditingConvId] = React.useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = React.useState("");
  const [lastFailedPrompt, setLastFailedPrompt] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  React.useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, streamingContent, loading, scrollToBottom]);

  // Initial load of conversations and messages
  React.useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch("/api/chat");
        const data = await res.json();
        if (data.success) {
          const convs = data.data.conversations || [];
          setConversations(convs);

          if (convs.length > 0) {
            setActiveConvId(convs[0].id);
            setMessages(data.data.messages || []);
          } else {
            // Display welcoming initial message
            setMessages([
              {
                id: "welcome",
                role: "assistant",
                content: `### Welcome to CyberGuard AI Assistant! 🛡️\n\nI am your dedicated defensive cybersecurity education assistant. Ask any question to understand threats, practice safe online habits, or learn security architecture.\n\n• **Phishing Defense & Link Verification**\n• **Password Entropy & Passphrase Security**\n• **Two-Factor Authentication (2FA/MFA)**\n• **Network & Wi-Fi Protection**\n\n*What would you like to explore today?*`,
                createdAt: new Date(),
                suggestedFollowUps: ["What is phishing?", "How can I stay safe?"],
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load initial chat:", err);
      }
    }

    loadInitialData();
  }, []);

  // Fetch messages when active conversation changes
  const switchConversation = async (convId: string) => {
    if (convId === activeConvId || loading) return;
    setActiveConvId(convId);
    setErrorMsg(null);
    setStreamingContent("");

    try {
      const res = await fetch(`/api/chat?conversationId=${convId}`);
      const data = await res.json();
      if (data.success && data.data?.messages) {
        setMessages(data.data.messages);
      }
    } catch {
      toast.error("Failed to load conversation messages.");
    }
  };

  // Create new conversation
  const handleNewChat = async () => {
    if (loading) return;
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
      });
      const data = await res.json();
      if (data.success && data.data?.conversation) {
        const newConv = data.data.conversation;
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(newConv.id);
        setMessages([
          {
            id: "welcome-" + newConv.id,
            role: "assistant",
            content: `### New Session Started 🛡️\n\nAsk any question about cybersecurity! You can test questions like **"What is phishing?"** or **"How can I stay safe?"**`,
            createdAt: new Date(),
            suggestedFollowUps: ["What is phishing?", "How can I stay safe?"],
          },
        ]);
        setErrorMsg(null);
        if (textareaRef.current) textareaRef.current.focus();
      }
    } catch {
      toast.error("Failed to create new conversation.");
    }
  };

  // Rename conversation
  const handleSaveRename = async (convId: string) => {
    if (!editTitleInput.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitleInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: editTitleInput.trim() } : c))
        );
        toast.success("Conversation renamed.");
      }
    } catch {
      toast.error("Failed to rename conversation.");
    } finally {
      setEditingConvId(null);
      setEditTitleInput("");
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConvId === convId) {
          const remaining = conversations.filter((c) => c.id !== convId);
          if (remaining.length > 0) {
            switchConversation(remaining[0].id);
          } else {
            setActiveConvId(null);
            setMessages([]);
          }
        }
        toast.success("Conversation deleted.");
      }
    } catch {
      toast.error("Failed to delete conversation.");
    }
  };

  // Clear all conversations
  const handleClearAll = async () => {
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setConversations([]);
        setActiveConvId(null);
        setMessages([
          {
            id: "welcome-cleared",
            role: "assistant",
            content: `All chat sessions cleared. Start a new question anytime!`,
            createdAt: new Date(),
            suggestedFollowUps: ["What is phishing?", "How can I stay safe?"],
          },
        ]);
        toast.success("All conversations cleared.");
      }
    } catch {
      toast.error("Failed to clear conversations.");
    }
  };

  // Send message handler with Streaming support
  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    if (textToSend.length > 2000) {
      toast.error("Message exceeds maximum length of 2,000 characters.");
      return;
    }

    const tempUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToSend,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput("");
    setLoading(true);
    setErrorMsg(null);
    setLastFailedPrompt(null);
    setStreamingContent("");

    try {
      // Try streaming endpoint /api/ai
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          conversationId: activeConvId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Error processing your request.");
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let finalMeta: any = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split("\n");

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line);
              if (event.type === "meta") {
                finalMeta = event;
                if (event.conversationId && event.conversationId !== activeConvId) {
                  setActiveConvId(event.conversationId);
                  // Update conversation list title
                  setConversations((prev) => {
                    const exists = prev.find((c) => c.id === event.conversationId);
                    if (exists) {
                      return prev.map((c) =>
                        c.id === event.conversationId
                          ? { ...c, title: event.conversationTitle || c.title, updatedAt: new Date() }
                          : c
                      );
                    } else {
                      return [
                        {
                          id: event.conversationId,
                          title: event.conversationTitle || "New Conversation",
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        },
                        ...prev,
                      ];
                    }
                  });
                }
              } else if (event.type === "chunk") {
                accumulated += event.text;
                setStreamingContent(accumulated);
              }
            } catch {
              // Non-JSON line fallback
            }
          }
        }

        // Finalize message
        const finalAssistantMsg: ChatMessage = {
          id: finalMeta?.messageId || crypto.randomUUID(),
          role: "assistant",
          content: accumulated || "I'm ready to answer your cybersecurity questions.",
          createdAt: finalMeta?.createdAt || new Date(),
          suggestedFollowUps: finalMeta?.suggestedFollowUps || [],
        };

        setMessages((prev) => [...prev, finalAssistantMsg]);
        setStreamingContent("");
      } else {
        // Fallback for direct JSON
        const data = await response.json();
        const finalAssistantMsg: ChatMessage = {
          id: data.data?.message?.id || crypto.randomUUID(),
          role: "assistant",
          content: data.data?.message?.content || "Guidance received.",
          createdAt: data.data?.message?.createdAt || new Date(),
          suggestedFollowUps: data.data?.suggestedFollowUps || [],
        };
        setMessages((prev) => [...prev, finalAssistantMsg]);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const message = err.message || "Failed to reach CyberGuard AI. Please try again.";
      setErrorMsg(message);
      setLastFailedPrompt(textToSend);
      toast.error(message);
    } finally {
      setLoading(false);
      setStreamingContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col gap-4 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title={isDrawerOpen ? "Hide Chat History" : "Show Chat History"}
          >
            {isDrawerOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                AI Cyber Assistant
              </h1>
              <Badge variant="cyber" className="text-[11px] font-semibold py-0.5 px-2">
                Defensive AI
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ask any question about cyber security.
            </p>
          </div>
        </div>

        <Button
          onClick={handleNewChat}
          className="gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm h-9 px-3.5 text-xs sm:text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
      </div>

      {/* Main Workspace: Drawer + Chat Body */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Conversation Drawer */}
        {isDrawerOpen && (
          <Card className="w-64 sm:w-72 shrink-0 flex flex-col rounded-2xl border-border bg-card p-3 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-500" /> Conversations
              </span>

              {conversations.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      title="Clear All Conversations"
                      className="text-[11px] text-muted-foreground hover:text-rose-600 transition-colors"
                    >
                      Clear
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all conversations?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your conversation history and messages with CyberGuard AI.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="bg-rose-600 hover:bg-rose-700">
                        Yes, Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-1 pr-1">
              {conversations.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <p>No saved conversations yet.</p>
                  <p className="mt-1 text-[11px]">Send a message to start!</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  const isEditing = conv.id === editingConvId;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => !isEditing && switchConversation(conv.id)}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/60 font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                          : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitleInput}
                            onChange={(e) => setEditTitleInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(conv.id);
                              if (e.key === "Escape") setEditingConvId(null);
                            }}
                            autoFocus
                            className="w-full rounded-md border border-indigo-300 bg-background px-1.5 py-0.5 text-xs focus:outline-hidden"
                          />
                          <button
                            onClick={() => handleSaveRename(conv.id)}
                            className="text-emerald-600 hover:text-emerald-700 p-0.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingConvId(null)}
                            className="text-muted-foreground hover:text-foreground p-0.5"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="truncate pr-2">
                            <p className="truncate text-xs font-medium">{conv.title}</p>
                            <span className="text-[10px] text-muted-foreground opacity-75">
                              {formatTimeOnly(conv.updatedAt)}
                            </span>
                          </div>

                          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                            <button
                              title="Rename Conversation"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingConvId(conv.id);
                                setEditTitleInput(conv.title);
                              }}
                              className="p-1 text-muted-foreground hover:text-indigo-600 rounded-md hover:bg-background/80"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              title="Delete Conversation"
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              className="p-1 text-muted-foreground hover:text-rose-600 rounded-md hover:bg-background/80"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-border text-[11px] text-muted-foreground text-center">
              <span>{conversations.length} total session{conversations.length === 1 ? "" : "s"}</span>
            </div>
          </Card>
        )}

        {/* Right Chat Card */}
        <Card className="flex-1 flex flex-col rounded-2xl border-border bg-card shadow-xs overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const followUps = msg.suggestedFollowUps || [];

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                      isUser
                        ? "bg-slate-200 dark:bg-slate-800 text-foreground"
                        : "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white"
                    }`}
                  >
                    {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`space-y-2 rounded-2xl px-4 py-3 text-xs sm:text-sm ${
                      isUser
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-50 dark:bg-slate-900/80 border border-border text-foreground shadow-xs"
                    }`}
                  >
                    {/* Rendered content */}
                    {isUser ? (
                      <div className="whitespace-pre-wrap leading-relaxed font-normal">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none space-y-2 leading-relaxed text-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h3: ({ node, ...props }) => (
                              <h3 className="text-sm sm:text-base font-bold text-foreground mt-2 mb-1" {...props} />
                            ),
                            h4: ({ node, ...props }) => (
                              <h4 className="text-xs sm:text-sm font-semibold text-foreground mt-2 mb-1" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm my-1.5" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol className="list-decimal pl-4 space-y-1 text-xs sm:text-sm my-1.5" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-foreground/90 my-0.5" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="my-1 text-foreground/90" {...props} />
                            ),
                            code: ({ node, className, children, ...props }) => {
                              return (
                                <code
                                  className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono text-indigo-700 dark:text-indigo-300"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Suggested follow-up chips under assistant bubble */}
                    {!isUser && followUps.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-border/70 space-y-1.5">
                        <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Lightbulb className="h-3 w-3 text-amber-500" /> Suggested questions:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {followUps.map((p, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(p)}
                              disabled={loading}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors text-left font-medium"
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-[10px] ${
                        isUser ? "text-indigo-200" : "text-muted-foreground"
                      } text-right mt-1`}
                    >
                      {formatTimeOnly(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Streaming Message Display */}
            {loading && streamingContent && (
              <div className="flex gap-3 max-w-3xl mr-auto">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-border px-4 py-3 text-xs sm:text-sm shadow-xs">
                  <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none space-y-2 text-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {loading && !streamingContent && (
              <div className="flex gap-3 max-w-md mr-auto items-center">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-border px-4 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
                  <span className="font-medium text-foreground">Thinking...</span>
                  <span className="flex gap-1 items-center ml-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                  </span>
                </div>
              </div>
            )}

            {/* Error Recovery State */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
                {lastFailedPrompt && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSend(lastFailedPrompt)}
                    className="h-7 text-xs border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900 gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Try again
                  </Button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts Bar */}
          <div className="px-4 py-2 border-t border-border bg-slate-50/70 dark:bg-slate-900/50 overflow-x-auto flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Quick Questions:
            </span>
            {DEFAULT_SUGGESTIONS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 text-xs text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 bg-card px-2.5 py-1 rounded-lg border border-border hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 border-t border-border bg-card shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  rows={1}
                  disabled={loading}
                  maxLength={2000}
                  className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] max-h-32"
                />
                {input.length > 1500 && (
                  <span className="absolute right-3 bottom-2 text-[10px] text-muted-foreground">
                    {input.length}/2000
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md transition-all flex items-center justify-center"
                title="Send Message (Enter)"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground px-1">
              <span>Press <kbd className="px-1 py-0.5 bg-muted rounded border text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-muted rounded border text-[9px]">Shift+Enter</kbd> for newline</span>
              <span>Defensive Cybersecurity Guidance Only</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
