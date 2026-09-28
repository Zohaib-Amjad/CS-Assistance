import React from "react";
import { db } from "@/db";
import { scans } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

export default async function AdminReportsPage() {
  const allScans = await db.query.scans.findMany({
    orderBy: [desc(scans.createdAt)],
    limit: 100,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SOC Platform Audit Reports & Forensics
          </h1>
          <Badge variant="secondary" className="text-xs">Audit Trail</Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Complete cross-user threat audit logs, classification telemetry, and system-wide forensic traces.
        </p>
      </div>

      <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
        <CardTitle className="text-base">Global Scan Log History (Last 100 Events)</CardTitle>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Target Payload Summary</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allScans.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {s.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-xs font-bold capitalize">
                    {s.type}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                    {s.inputSummary}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.verdict === "malicious" ? "danger" : s.verdict === "safe" ? "success" : "warning"} className="text-[10px] capitalize">
                      {s.verdict}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-foreground">
                    {s.resultScore}/100
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(s.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
