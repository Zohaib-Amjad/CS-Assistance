"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MailCheck,
  Globe,
  KeyRound,
  BotMessageSquare,
  HelpCircle,
  FileBarChart,
  UserCheck,
  Settings,
  LogOut,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/Logo";

const USER_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Email Checker", href: "/dashboard/email-checker", icon: MailCheck },
  { label: "URL Checker", href: "/dashboard/url-checker", icon: Globe },
  { label: "Password Checker", href: "/dashboard/password-checker", icon: KeyRound },
  { label: "AI Assistant", href: "/dashboard/assistant", icon: BotMessageSquare, badge: "AI" },
  { label: "Cyber Quiz", href: "/dashboard/quiz", icon: HelpCircle },
  { label: "Reports", href: "/dashboard/reports", icon: FileBarChart },
  { label: "Profile", href: "/dashboard/profile", icon: UserCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ className, user }: { className?: string; user?: any }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r border-border bg-card/95 backdrop-blur-md px-4 py-5 justify-between select-none z-30",
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="px-2">
          <Logo size="md" subtitle="Security Workspace" href="/dashboard" />
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {USER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="cyber" className="px-1.5 py-0 text-[10px] font-bold tracking-wide">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: User info & Logout */}
      <div className="space-y-3 pt-4 border-t border-border">
        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 px-3 py-2 text-xs font-semibold text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 transition-colors hover:bg-violet-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Switch to Admin Portal</span>
          </Link>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
