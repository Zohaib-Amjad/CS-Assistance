import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  type?: "card" | "table" | "profile" | "dashboard";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  type = "card",
  count = 3,
  className,
}: LoadingSkeletonProps) {
  if (type === "dashboard") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Banner skeleton */}
        <Skeleton className="h-44 w-full rounded-2xl" />

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>

        {/* Charts & Table */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={cn("rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60 space-y-4", className)}>
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className={cn("rounded-2xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60 space-y-6", className)}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  );
}
