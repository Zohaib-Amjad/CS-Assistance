"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SecurityScoreProps {
  score: number; // 0 to 100
  size?: number; // width/height in px
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function SecurityScore({
  score,
  size = 140,
  strokeWidth = 12,
  showLabel = true,
  className,
}: SecurityScoreProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = "#10b981"; // Emerald
  let grade = "Excellent";
  let gradeColor = "text-emerald-600 dark:text-emerald-400";

  if (clampedScore < 50) {
    strokeColor = "#f43f5e"; // Rose
    grade = "High Risk";
    gradeColor = "text-rose-600 dark:text-rose-400";
  } else if (clampedScore < 75) {
    strokeColor = "#f59e0b"; // Amber
    grade = "Moderate";
    gradeColor = "text-amber-600 dark:text-amber-400";
  } else if (clampedScore < 90) {
    strokeColor = "#6366f1"; // Indigo
    grade = "Good";
    gradeColor = "text-indigo-600 dark:text-indigo-400";
  }

  return (
    <div className={cn("flex flex-col items-center justify-center select-none", className)}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {clampedScore}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Out of 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <span className={cn("text-xs font-bold uppercase tracking-wider", gradeColor)}>
            {grade}
          </span>
        </div>
      )}
    </div>
  );
}
