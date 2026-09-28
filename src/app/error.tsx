"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client/server error securely
    console.error("CyberGuard Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
        <AlertOctagon className="h-10 w-10" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900 dark:text-white">
        Something went wrong
      </h1>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while processing this operation. Our defensive guardrails have safely intercepted it.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs font-mono text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
          {error.message}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button asChild variant="outline" className="rounded-xl border-border">
          <Link href="/dashboard" className="gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
