import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  iconBgColor = "bg-indigo-500/10 dark:bg-indigo-500/20",
  iconColor = "text-indigo-600 dark:text-indigo-400",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/60",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold",
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {isPositive ? <TrendingUp className="mr-0.5 h-3 w-3" /> : <TrendingDown className="mr-0.5 h-3 w-3" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
