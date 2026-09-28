import React from "react";
import Link from "next/link";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
          <ShieldAlert className="h-12 w-12 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white shadow-md">
          404
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
        Security Checkpoint: Page Not Found
      </h1>

      <p className="mt-3 max-w-md text-sm sm:text-base text-muted-foreground">
        The requested security route or resource doesn't exist, has been quarantined, or was relocated.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button asChild className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
          <Link href="/dashboard" className="gap-2">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl border-border">
          <Link href="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
