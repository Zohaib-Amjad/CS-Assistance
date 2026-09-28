import React from "react";
import { Shield } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 rounded-full border-4 border-indigo-200 dark:border-indigo-950 border-t-indigo-600 dark:border-t-indigo-500 animate-spin" />
        <Shield className="absolute h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-semibold tracking-wide text-foreground">
        Initializing CyberGuard Engine...
      </p>
    </div>
  );
}
