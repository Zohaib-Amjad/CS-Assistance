"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  LayoutDashboard,
  MailCheck,
  Globe,
  KeyRound,
  BotMessageSquare,
  HelpCircle,
  FileBarChart,
  UserCheck,
  Settings,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Tools" | "Account" | "Admin";
  icon: React.ElementType;
  href: string;
  badge?: string;
  description?: string;
  keywords?: string[];
  adminOnly?: boolean;
}

const COMMANDS: CommandItem[] = [
  {
    id: "dashboard",
    title: "Security Dashboard",
    category: "Navigation",
    icon: LayoutDashboard,
    href: "/dashboard",
    description: "Overview of your security posture, recent threats and KPIs",
    keywords: ["home", "overview", "stats", "kpi"],
  },
  {
    id: "email-checker",
    title: "Email Phishing Checker",
    category: "Tools",
    icon: MailCheck,
    href: "/dashboard/email-checker",
    badge: "AI Powered",
    description: "Analyze email headers and body text for social engineering lures",
    keywords: ["phish", "spam", "scam", "headers", "spf", "dkim", "dmarc"],
  },
  {
    id: "url-checker",
    title: "URL Safety Checker",
    category: "Tools",
    icon: Globe,
    href: "/dashboard/url-checker",
    badge: "SSRF Safe",
    description: "Inspect website links, domain age, SSL and typosquatting",
    keywords: ["link", "website", "domain", "ssl", "homograph", "ssrf"],
  },
  {
    id: "password-checker",
    title: "Password Strength Checker",
    category: "Tools",
    icon: KeyRound,
    href: "/dashboard/password-checker",
    badge: "k-Anonymity",
    description: "Audit password entropy and check breach databases without leaking plaintext",
    keywords: ["credentials", "entropy", "breach", "pwned", "generate", "passphrase"],
  },
  {
    id: "assistant",
    title: "AI Cyber Assistant",
    category: "Tools",
    icon: BotMessageSquare,
    href: "/dashboard/assistant",
    badge: "Defensive AI",
    description: "Chat with CyberGuard AI for instant security advice and guidance",
    keywords: ["chat", "ai", "bot", "help", "question", "remediation"],
  },
  {
    id: "quiz",
    title: "Cyber Awareness Quiz",
    category: "Tools",
    icon: HelpCircle,
    href: "/dashboard/quiz",
    description: "Test your cybersecurity knowledge and improve your defensive skills",
    keywords: ["test", "learn", "awareness", "exam", "questions", "education"],
  },
  {
    id: "reports",
    title: "Security Audit Reports & PDF Export",
    category: "Navigation",
    icon: FileBarChart,
    href: "/dashboard/reports",
    description: "View detailed scan logs and generate cryptographically signed audit PDF reports",
    keywords: ["export", "pdf", "audit", "logs", "history", "download"],
  },
  {
    id: "profile",
    title: "User Profile & Security Score",
    category: "Account",
    icon: UserCheck,
    href: "/dashboard/profile",
    description: "View your earned defensive badges, login streaks, and account status",
    keywords: ["user", "badges", "streak", "score", "avatar", "points"],
  },
  {
    id: "settings",
    title: "Security & Account Settings",
    category: "Account",
    icon: Settings,
    href: "/dashboard/settings",
    description: "Configure two-factor authentication (2FA), update password and preferences",
    keywords: ["2fa", "mfa", "theme", "password", "notifications", "security"],
  },
  {
    id: "admin-users",
    title: "Admin Portal: User Management",
    category: "Admin",
    icon: Sparkles,
    href: "/admin/users",
    badge: "Admin",
    adminOnly: true,
    description: "Manage registered users, roles, subscriptions, and account statuses",
    keywords: ["users", "manage", "roles", "ban", "suspend", "admin"],
  },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}

export function CommandPalette({ open, onOpenChange, isAdmin = false }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global keydown listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const filteredCommands = COMMANDS.filter((cmd) => {
    if (cmd.adminOnly && !isAdmin) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.keywords?.some((kw) => kw.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (cmd: CommandItem) => {
    onOpenChange(false);
    setQuery("");
    router.push(cmd.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden rounded-2xl border-border bg-card shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Command Search</DialogTitle>
        </DialogHeader>

        {/* Search Header */}
        <div className="flex items-center border-b border-border px-4 py-3.5 gap-3">
          <Search className="h-5 w-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, tool name, or feature to jump..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
            ESC to close
          </Badge>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;

              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all",
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200"
                      : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{cmd.title}</span>
                        {cmd.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-medium">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.description && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-sm">
                          {cmd.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-opacity",
                      isSelected ? "opacity-100 text-indigo-600 dark:text-indigo-400" : "opacity-0"
                    )}
                  />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
              <ShieldAlert className="h-6 w-6 mx-auto text-slate-400" />
              <p className="font-semibold text-foreground">No matching tools or pages found</p>
              <p>Try searching for &quot;email&quot;, &quot;password&quot;, &quot;quiz&quot;, or &quot;reports&quot;.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-border bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            CyberGuard AI Fast Jump
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
