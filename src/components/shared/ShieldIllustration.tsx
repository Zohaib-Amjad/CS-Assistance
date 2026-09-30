"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ShieldIllustrationProps {
  className?: string;
  size?: number;
  showOrbs?: boolean;
}

export function ShieldIllustration({
  className,
  size = 380,
  showOrbs = true,
}: ShieldIllustrationProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* Dynamic background glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-indigo-500/25 to-purple-500/25 blur-3xl -z-10 animate-pulse" />

      {/* Orbit Rings */}
      {showOrbs && (
        <>
          <div
            className="absolute inset-0 rounded-full border border-indigo-500/20 dark:border-indigo-400/20 border-dashed animate-[spin_25s_linear_infinite] pointer-events-none"
            style={{ width: size * 0.95, height: size * 0.95, margin: "auto" }}
          />
          <div
            className="absolute inset-0 rounded-full border border-purple-500/20 dark:border-purple-400/20 animate-[spin_35s_linear_infinite_reverse] pointer-events-none"
            style={{ width: size * 0.8, height: size * 0.8, margin: "auto" }}
          />

          {/* Floating Orb 1 */}
          <div className="absolute -top-2 right-12 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/50 animate-bounce duration-1000" />
          {/* Floating Orb 2 */}
          <div className="absolute bottom-8 -left-2 w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg shadow-purple-500/50 animate-pulse duration-700" />
          {/* Floating Orb 3 */}
          <div className="absolute top-1/2 -right-4 w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/40" />
        </>
      )}

      {/* Main 3D Shield Hero Image or Fallback */}
      <div className="relative z-10 w-4/5 h-4/5 flex items-center justify-center animate-[float_4s_ease-in-out_infinite]">
        {!imgError ? (
          <Image
            src="/assets/shield-hero.svg"
            alt="CyberGuard AI 3D Shield Security"
            width={size * 0.8}
            height={size * 0.8}
            priority
            className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(79,70,229,0.35)]"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="shieldGradMain" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="0.5" stopColor="#4f46e5" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="shieldBevel" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="1" stopColor="#000000" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M100 15L30 45V105C30 148 60 185 100 195C140 185 170 148 170 105V45L100 15Z"
              fill="url(#shieldGradMain)"
            />
            <path
              d="M100 22L38 49V105C38 143 65 176 100 186C135 176 162 143 162 105V49L100 22Z"
              fill="url(#shieldBevel)"
              opacity="0.25"
            />
            {/* Center Lock Badge */}
            <circle cx="100" cy="115" r="32" fill="#ffffff" fillOpacity="0.15" />
            <rect x="82" y="105" width="36" height="28" rx="6" fill="#ffffff" />
            <path
              d="M89 105V93C89 86.9 93.9 82 100 82C106.1 82 111 86.9 111 93V105"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="100" cy="118" r="3.5" fill="#4f46e5" />
            <path d="M100 121.5V127" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  );
}
