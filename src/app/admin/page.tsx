import React from "react";
import Link from "next/link";
import { getAdminMetrics } from "@/services/admin.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Users,
  ShieldAlert,
  MailCheck,
  Globe,
  KeyRound,
  HelpCircle,
  Activity,
  ArrowRight,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              SOC Admin Telemetry & Health
            </h1>
            <Badge variant="secondary" className="text-xs">Central Command</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time platform metrics, user access management, and threat ingestion statistics.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="rounded-2xl border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Users</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-2">{metrics.totalUsers}</p>
          <div className="mt-3 pt-2 border-t border-border">
            <Link href="/admin/users" className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1">
              <span>Manage users</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Diagnostics</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-2">{metrics.totalScans}</p>
          <div className="mt-3 pt-2 border-t border-border">
            <Link href="/admin/email-logs" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              <span>View scan logs</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 font-semibold">Malicious Neutralized</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{metrics.maliciousDetected}</p>
          <div className="mt-3 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Threat signatures captured</span>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Quiz Database</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-2">{metrics.totalQuestions}</p>
          <div className="mt-3 pt-2 border-t border-border">
            <Link href="/admin/quizzes" className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1">
              <span>Edit quiz items</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

      </div>

      {/* Recent Scans Ingestion Table */}
      <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Real-Time Threat Ingestion Stream</CardTitle>
            <CardDescription className="text-xs">Live diagnostic events captured across users</CardDescription>
          </div>
          <Link href="/admin/email-logs">
            <Button variant="ghost" size="sm" className="rounded-xl text-xs">
              View All Logs
            </Button>
          </Link>
        </div>

        {metrics.recentScans.length > 0 ? (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Target Summary</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.recentScans.map((scan: any) => {
                  const isSafe = scan.verdict === "safe" || scan.verdict === "strong";
                  const isSuspicious = scan.verdict === "suspicious" || scan.verdict === "moderate";
                  return (
                    <TableRow key={scan.id}>
                      <TableCell className="font-semibold text-xs capitalize flex items-center gap-2">
                        {scan.type === "email" && <MailCheck className="h-4 w-4 text-indigo-500" />}
                        {scan.type === "url" && <Globe className="h-4 w-4 text-blue-500" />}
                        {scan.type === "password" && <KeyRound className="h-4 w-4 text-emerald-500" />}
                        <span>{scan.type}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                        {scan.inputSummary}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isSafe ? "success" : isSuspicious ? "warning" : "danger"}
                          className="capitalize text-[11px] font-semibold"
                        >
                          {scan.verdict}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">
                        {scan.resultScore}/100
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(scan.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-muted-foreground">
            No diagnostic telemetry logged yet.
          </div>
        )}
      </Card>
    </div>
  );
}
