"use client";

import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  CheckCheck,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  MailCheck,
  Globe,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  type: "alert" | "success" | "info" | "warning";
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "AI Phishing Engine Active",
    description: "Neural heuristic analyzer is actively inspecting inbound payloads.",
    timeAgo: "10 mins ago",
    type: "info",
    read: false,
  },
  {
    id: "notif-2",
    title: "Zero Breaches Detected",
    description: "Your master password hash has zero matches in exposed breach dumps.",
    timeAgo: "1 hour ago",
    type: "success",
    read: false,
  },
  {
    id: "notif-3",
    title: "New Cyber Quiz Available",
    description: "Take the 'Social Engineering & Smishing' awareness quiz to boost your score.",
    timeAgo: "2 hours ago",
    type: "info",
    read: false,
  },
  {
    id: "notif-4",
    title: "Weekly Security Digest Ready",
    description: "Review your recent scan telemetry and export signed PDF report.",
    timeAgo: "1 day ago",
    type: "info",
    read: true,
  },
];

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  // Load / sync notifications with localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cyberguard_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch {
      // Use defaults
    }
  }, []);

  const saveNotifications = (updated: NotificationItem[]) => {
    setNotifications(updated);
    try {
      localStorage.setItem("cyberguard_notifications", JSON.stringify(updated));
    } catch {
      // Storage unavailable
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "alert":
      case "warning":
        return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      case "success":
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-slate-50/80 text-foreground hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 focus:outline-none transition-colors"
          aria-label={`View notifications, ${unreadCount} unread`}
        >
          <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <Badge variant="cyber" className="text-[10px] px-1.5 py-0 h-4">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium px-1.5 py-0.5"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-[11px] text-muted-foreground hover:text-rose-500 p-1 rounded-md"
                title="Clear all notifications"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={cn(
                  "flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer",
                  notif.read
                    ? "opacity-70 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    : "bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60"
                )}
              >
                <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{notif.timeAgo}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {notif.description}
                  </p>
                </div>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
              <ShieldCheck className="h-8 w-8 mx-auto text-emerald-500/70" />
              <p className="font-semibold text-foreground">You&apos;re all caught up!</p>
              <p className="text-[11px]">No unread security alerts or scan notices.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 text-center">
          <span className="text-[10px] text-muted-foreground">
            CyberGuard Real-time Threat Telemetry
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
