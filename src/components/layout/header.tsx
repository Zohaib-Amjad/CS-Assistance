"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  ShieldAlert,
  LayoutDashboard,
  MailCheck,
  Globe,
  KeyRound,
  BotMessageSquare,
  HelpCircle,
  FileBarChart,
  UserCheck,
  Shield,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "./command-palette";
import { NotificationDropdown } from "./notification-dropdown";

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

interface HeaderProps {
  title?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
    securityScore?: number;
    plan?: string;
  };
}

export function Header({ title, user }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CG";

  const planCaption =
    user?.role === "ADMIN" || user?.role === "admin"
      ? "Administrator"
      : user?.plan?.toUpperCase() === "PREMIUM"
      ? "Premium User"
      : "Free User";

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/85 px-4 sm:px-6 backdrop-blur-md">
        {/* Left side: Mobile Hamburger + Search Field */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
          {/* Mobile Drawer */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-slate-100/80 text-foreground hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 focus:outline-none"
                aria-label="Open mobile navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col justify-between">
              <div className="p-5 space-y-6">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-foreground">
                      CyberGuard <span className="text-indigo-600">AI</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Nav Links */}
                <nav className="space-y-1">
                  {USER_NAV_ITEMS.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          isActive
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold"
                            : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800/60"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              isActive
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-muted-foreground"
                            )}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="cyber" className="px-1.5 py-0 text-[10px]">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="p-5 border-t border-border space-y-2">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Search Field & Fast Command Trigger */}
          <div className="relative w-full hidden sm:block">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="group flex h-10 w-full items-center justify-between rounded-xl border border-border bg-slate-50/70 dark:bg-slate-900/50 px-3.5 text-xs text-muted-foreground hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-background transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="truncate">Search tools, emails, URLs, logs...</span>
              </div>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        </div>

        {/* Right side: Security Score, Bell, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Security Score Pill */}
          {user?.securityScore !== undefined && (
            <Link
              href="/dashboard/profile"
              className="hidden md:flex items-center gap-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-foreground border border-border hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              title="View your CyberGuard Security Score breakdown"
            >
              <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                Score:{" "}
                <strong className="text-indigo-600 dark:text-indigo-400">
                  {user.securityScore}/100
                </strong>
              </span>
            </Link>
          )}

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-xl border border-border p-1 sm:px-2.5 sm:py-1.5 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 focus:outline-none transition-colors">
                <Avatar className="h-8 w-8 border border-indigo-200 dark:border-indigo-800">
                  {user?.image ? (
                    <AvatarImage src={user.image} alt={user.name || "User"} />
                  ) : null}
                  <AvatarFallback className="text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground leading-tight">
                    {user?.name || "CyberGuard User"}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 leading-tight">
                    {planCaption}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.name || "CyberGuard User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@cyberguard.ai"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Profile & Badges</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              {(user?.role === "ADMIN" || user?.role === "admin") && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/users"
                    className="flex items-center gap-2 cursor-pointer text-violet-600 dark:text-violet-400 font-medium"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Admin Portal</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-rose-600 dark:text-rose-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        isAdmin={user?.role === "ADMIN" || user?.role === "admin"}
      />
    </>
  );
}
