import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from "lucide-react";

export type RiskLevel = "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "UNKNOWN" | "CLEAN" | "MALICIOUS";

interface RiskBadgeProps {
  level: RiskLevel | string;
  label?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function RiskBadge({
  level,
  label,
  size = "md",
  showIcon = true,
  className,
}: RiskBadgeProps) {
  const normLevel = (level || "").toUpperCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  let defaultLabel = "Unknown";
  let Icon = Info;

  if (normLevel === "SAFE" || normLevel === "CLEAN" || normLevel === "LOW") {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60";
    defaultLabel = "Safe";
    Icon = ShieldCheck;
  } else if (normLevel === "SUSPICIOUS" || normLevel === "MEDIUM" || normLevel === "MODERATE") {
    styles = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60";
    defaultLabel = "Suspicious";
    Icon = AlertTriangle;
  } else if (normLevel === "HIGH_RISK" || normLevel === "MALICIOUS" || normLevel === "HIGH" || normLevel === "CRITICAL") {
    styles = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60";
    defaultLabel = "High Risk";
    Icon = AlertOctagon;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-bold gap-1.5",
    lg: "px-3 py-1.5 text-sm font-bold gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border shadow-sm select-none",
        sizeClasses[size],
        styles,
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], "shrink-0")} />}
      <span>{label || defaultLabel}</span>
    </span>
  );
}
