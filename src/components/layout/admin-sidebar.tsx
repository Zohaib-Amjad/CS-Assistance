"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  FileBarChart,
  MailCheck,
  Globe,
  Settings,
  LogOut,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Quizzes", href: "/admin/quizzes", icon: HelpCircle },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "Email Checker Logs", href: "/admin/email-logs", icon: MailCheck },
  { label: "URL Checker Logs", href: "/admin/url-logs", icon: Globe },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r border-border bg-card/95 backdrop-blur-md px-4 py-5 justify-between select-none z-30",
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-foreground">CyberGuard</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase font-bold">Admin</Badge>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">SOC Administration</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to user mode and Logout */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800/60 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to User Dashboard</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
