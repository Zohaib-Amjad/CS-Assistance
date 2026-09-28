import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { users, scans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowLeft, Shield, Mail, Calendar, Activity, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, params.id),
  });

  if (!user) {
    notFound();
  }

  const userScans = await db.query.scans.findMany({
    where: eq(scans.userId, user.id),
    orderBy: [desc(scans.createdAt)],
    limit: 20,
  });

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Users List</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* User Details Box */}
        <Card className="lg:col-span-4 rounded-2xl border-border bg-card p-6 shadow-xs space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-20 w-20 border-2 border-indigo-200 dark:border-indigo-800">
              {user.image ? <AvatarImage src={user.image} /> : null}
              <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={user.role === "admin" ? "secondary" : "outline"} className="capitalize font-bold text-xs">
              Role: {user.role}
            </Badge>
          </div>

          <div className="space-y-3 pt-4 border-t border-border text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-[11px]">{user.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined Platform:</span>
              <span className="font-semibold">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Posture Score:</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{user.securityScore}/100</span>
            </div>
          </div>
        </Card>

        {/* User Specific Scans Log */}
        <Card className="lg:col-span-8 rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
          <CardTitle className="text-base">User Diagnostic Activity History</CardTitle>
          {userScans.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Target Summary</TableHead>
                    <TableHead>Verdict</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userScans.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-semibold text-xs capitalize">{s.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{s.inputSummary}</TableCell>
                      <TableCell>
                        <Badge variant={s.verdict === "malicious" ? "danger" : s.verdict === "safe" ? "success" : "warning"} className="text-[10px] capitalize">
                          {s.verdict}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-bold">{s.resultScore}/100</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-8 text-center">No scans recorded for this user yet.</p>
          )}
        </Card>

      </div>
    </div>
  );
}
