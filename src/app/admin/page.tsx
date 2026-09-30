import React from "react";
import Link from "next/link";
import { getAdminMetrics } from "@/services/admin.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldAlert,
  MailCheck,
  Globe,
  KeyRound,
  HelpCircle,
  Activity,
  ArrowRight,
  Trophy,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-sm shadow-md shadow-indigo-500/30">
              SOC
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              SOC Admin Telemetry & Health
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time platform metrics, user access management, threat velocity, and educational completion analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyber" className="text-xs px-3 py-1 font-bold">
            Live Sentinel Active
          </Badge>
        </div>
      </div>

      {/* 7 Required Metric Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* 1. Total Users */}
        <Card className="rounded-3xl border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Users</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-foreground">{metrics.totalUsers}</p>
            <Link
              href="/admin/users"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 mt-2"
            >
              <span>Manage users</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* 2. Active Users */}
        <Card className="rounded-3xl border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Users</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.activeUsers}
            </p>
            <span className="text-xs text-muted-foreground mt-2 block">
              {Math.round((metrics.activeUsers / (metrics.totalUsers || 1)) * 100)}% active rate
            </span>
          </div>
        </Card>

        {/* 3. Total Scans */}
        <Card className="rounded-3xl border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Scans</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-foreground">{metrics.totalScans}</p>
            <span className="text-xs text-muted-foreground mt-2 block">
              Emails, URLs & Passwords
            </span>
          </div>
        </Card>

        {/* 4. Threats Detected */}
        <Card className="rounded-3xl border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Threats Detected</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {metrics.threatsDetected}
            </p>
            <span className="text-xs text-muted-foreground mt-2 block">
              Flagged & Neutralized
            </span>
          </div>
        </Card>

        {/* 5. Quizzes Completed */}
        <Card className="rounded-3xl border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Quizzes Completed</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HelpCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-foreground">{metrics.quizzesCompleted}</p>
            <Link
              href="/admin/quizzes"
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 mt-2"
            >
              <span>Manage curriculum</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* 6. Average Security Score */}
        <Card className="rounded-3xl border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Average Score</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Trophy className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {metrics.averageScore}%
            </p>
            <span className="text-xs text-muted-foreground mt-2 block">
              Across registered users
            </span>
          </div>
        </Card>

        {/* 7. Quiz Completion Rate */}
        <Card className="rounded-3xl border-border bg-card p-5 shadow-xs flex flex-col justify-between sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Quiz Pass Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-foreground">
              {metrics.quizCompletionRate}%
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${metrics.quizCompletionRate}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 7-Day Activity & Threat Trends Visual Chart Card */}
      <Card className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <span>7-Day Ingestion Velocity & Threat Telemetry</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Daily inspection volume versus detected security risk signatures
            </CardDescription>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 h-44 items-end">
          {metrics.trendDays.map((day, idx) => {
            const maxVal = Math.max(
              ...metrics.trendDays.map((d) => Math.max(d.scans, 5)),
              10
            );
            const scanHeight = Math.max(12, Math.round((day.scans / maxVal) * 100));
            const threatHeight = Math.max(0, Math.round((day.threats / maxVal) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  {/* Scans Bar */}
                  <div
                    className="w-4 sm:w-6 bg-indigo-500/80 hover:bg-indigo-600 rounded-t-lg transition-all duration-300 relative group cursor-pointer"
                    style={{ height: `${scanHeight}%` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.scans} scans
                    </div>
                  </div>

                  {/* Threat Bar */}
                  {day.threats > 0 && (
                    <div
                      className="w-3 sm:w-4 bg-rose-500 hover:bg-rose-600 rounded-t-md transition-all duration-300 relative group cursor-pointer"
                      style={{ height: `${threatHeight}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-rose-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {day.threats} threats
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground text-center">
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-indigo-500" />
            <span className="font-semibold text-muted-foreground">Total Scans</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-rose-500" />
            <span className="font-semibold text-muted-foreground">Threats Flagged</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
