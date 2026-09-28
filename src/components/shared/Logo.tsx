import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({
  className,
  showText = true,
  size = "md",
  href = "/",
}: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const logoContent = (
    <div className={cn("inline-flex items-center gap-2.5 font-bold tracking-tight select-none", className)}>
      <div className={cn(iconSizes[size], "relative flex items-center justify-center shrink-0")}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4f46e5" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="shieldGlow" x1="18" y1="0" x2="18" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="1" stopColor="#c084fc" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M18 2L5 7V17C5 25.5 10.6 33.3 18 35.5C25.4 33.3 31 25.5 31 17V7L18 2Z"
            fill="url(#shieldGrad)"
          />
          <path
            d="M18 4L7 8.2V17C7 24.2 11.7 31 18 33.2C24.3 31 29 24.2 29 17V8.2L18 4Z"
            stroke="url(#shieldGlow)"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
          {/* Padlock inside shield */}
          <rect x="13" y="17" width="10" height="8" rx="2" fill="white" />
          <path
            d="M15 17V14C15 12.3431 16.3431 11 18 11C19.6569 11 21 12.3431 21 14V17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="18" cy="21" r="1" fill="#4f46e5" />
        </svg>
      </div>

      {showText && (
        <span className={cn(textSizes[size], "font-extrabold text-slate-900 dark:text-white flex items-center")}>
          Cyber<span className="text-indigo-600 dark:text-indigo-400">Guard</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            AI
          </span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
