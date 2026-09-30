import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetailAdmin } from "@/services/admin.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  Calendar,
  Award,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const detail = await getUserDetailAdmin(params.id);
  if (!detail) {
    notFound();
  }

  const { user, stats, recentScans, quizAttempts, achievements, auditLogs } = detail;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isActive = (user.status || "").toUpperCase() === "ACTIVE";

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/users">
          <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            <span>Back to Users</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={user.role === "ADMIN" ? "secondary" : "outline"} className="text-xs font-bold">
            {user.role}
          </Badge>
          <Badge variant="cyber" className="text-xs font-bold">
            {user.plan}
          </Badge>
        </div>
      </div>

      {/* User Hero Profile Card */}
      <Card className="rounded-3xl border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-md">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
              <AvatarFallback className="text-xl font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-foreground">{user.name}</h1>
                {isActive ? (
                  <Badge variant="success" className="text-[10px]">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="danger" className="text-[10px]">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-indigo-500" />
                <span>{user.email}</span>
              </p>
              {user.country && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{user.country}</span>
                </p>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border text-center min-w-[180px]">
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              Security Score
            </span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {user.securityScore ?? 75}%
            </span>
            <Progress value={user.securityScore ?? 75} className="h-2 mt-2" />
          </div>
        </div>
      </Card>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground font-semibold">Total Scans</p>
          <p className="text-2xl font-black text-foreground mt-1">{stats.totalScans}</p>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground font-semibold">Threats Flagged</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.threatsDetected}</p>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground font-semibold">Quizzes Taken</p>
          <p className="text-2xl font-black text-foreground mt-1">{stats.quizzesTaken}</p>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground font-semibold">Badges Earned</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{stats.achievementsCount}</p>
        </Card>
      </div>

      {/* Recent Privacy-Safe Scans */}
      <Card className="rounded-3xl border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-indigo-500" />
            <span>Recent Security Diagnostics (Sanitized)</span>
          </CardTitle>
          <span className="text-xs text-muted-foreground">Sensitive raw payloads are strictly hidden</span>
        </div>

        {recentScans.length > 0 ? (
          <div className="divide-y divide-border/60">
            {recentScans.map((s: any) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                      {s.type}
                    </Badge>
                    <span className="font-semibold text-foreground truncate max-w-sm">
                      {s.inputSummary}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(s.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">Score: {s.resultScore}</span>
                  <Badge
                    variant={["malicious", "danger", "weak"].includes(s.verdict) ? "danger" : "success"}
                    className="text-[10px] capitalize"
                  >
                    {s.verdict}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-6 text-center">
            No recent scans recorded for this account.
          </p>
        )}
      </Card>
    </div>
  );
}
