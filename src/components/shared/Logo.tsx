import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  subtitle?: string | boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({
  className,
  showText = true,
  subtitle,
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

  const subtitleText =
    typeof subtitle === "string"
      ? subtitle
      : subtitle === true
      ? "AI-Powered Cyber Security Assistant"
      : null;

  const logoContent = (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      <div className={cn(iconSizes[size], "relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105")}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="shieldGradPrimary" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="0.3" stopColor="#4f46e5" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="shieldInnerGlow" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#a5b4fc" stopOpacity="0.3" />
              <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="0" y="0" width="40" height="40" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Outer Shield with gradient */}
          <path
            d="M20 3L6 8.5V19C6 28.5 12.2 37.1 20 39.5C27.8 37.1 34 28.5 34 19V8.5L20 3Z"
            fill="url(#shieldGradPrimary)"
          />
          {/* Inner Highlight Border */}
          <path
            d="M20 5.5L8.5 10V19C8.5 27 13.6 34.5 20 36.8C26.4 34.5 31.5 27 31.5 19V10L20 5.5Z"
            stroke="url(#shieldInnerGlow)"
            strokeWidth="1.2"
          />
          {/* Cyber Lock & Node Symbol */}
          <path
            d="M16 18.5V15.5C16 13.29 17.79 11.5 20 11.5C22.21 11.5 24 13.29 24 15.5V18.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <rect x="14" y="18.5" width="12" height="9.5" rx="2.5" fill="white" />
          <circle cx="20" cy="23" r="1.5" fill="#4f46e5" />
          <path d="M20 24.5V26" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className={cn(textSizes[size], "font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center leading-tight")}>
            <span>Cyber</span>
            <span className="text-indigo-600 dark:text-indigo-400">Guard</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 leading-none">
              AI
            </span>
          </div>
          {subtitleText && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight leading-tight mt-0.5">
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

