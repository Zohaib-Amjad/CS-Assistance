"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ArrowRight, Menu, User, Settings, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/shared/Logo";
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
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export function PublicNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CG";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Subtitle */}
        <div className="flex items-center">
          <Logo size="md" subtitle={true} href="/" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-300"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 font-semibold gap-2">
                <Link href={(user as any).role === "ADMIN" ? "/admin" : "/dashboard"}>
                  <LayoutDashboard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Dashboard</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <Avatar className="h-9 w-9 border border-indigo-200 dark:border-indigo-800">
                      {user.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name || "User"}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Security Workspace</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile & Badges</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-rose-600 dark:text-rose-400 cursor-pointer gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button asChild variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-800 dark:text-slate-200">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-md shadow-indigo-500/25 gap-1.5 group">
                <Link href="/signup">
                  <span>Sign Up</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 text-foreground"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <SheetHeader className="text-left">
                  <SheetTitle>
                    <Logo size="md" href="/" />
                  </SheetTitle>
                </SheetHeader>

                <nav className="space-y-2">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                        pathname === link.href
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                {user ? (
                  <>
                    <Button asChild className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold">
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                        Go to Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full rounded-xl text-rose-600 dark:text-rose-400"
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full rounded-xl">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        Log In
                      </Link>
                    </Button>
                    <Button asChild className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold">
                      <Link href="/signup" onClick={() => setMobileOpen(false)}>
                        Sign Up Free
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
