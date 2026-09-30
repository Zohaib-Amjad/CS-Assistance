import React from "react";
import { getEmailScanLogs } from "@/services/admin.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { MailCheck, ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminEmailLogsPage() {
  const logs = await getEmailScanLogs();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Phishing Email Checker Logs
          </h1>
          <Badge variant="secondary" className="text-xs">{logs.length} Logged</Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Review anonymized email payloads, identified social engineering vectors, and heuristic trigger scores.
        </p>
      </div>

      <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Excerpt</TableHead>
                <TableHead>Threat Verdict</TableHead>
                <TableHead>Calculated Risk</TableHead>
                <TableHead>Flagged Indicators</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((scan: any) => {
                let indicators: string[] = [];
                if (scan.threatIndicators) {
                  try {
                    indicators = JSON.parse(scan.threatIndicators);
                  } catch {}
                }

                return (
                  <TableRow key={scan.id}>
                    <TableCell className="text-xs text-foreground font-medium max-w-xs truncate">
                      {scan.inputSummary}
                    </TableCell>
                    <TableCell>
                      <Badge variant={scan.verdict === "malicious" ? "danger" : scan.verdict === "safe" ? "success" : "warning"} className="text-[10px] capitalize">
                        {scan.verdict}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      {scan.resultScore}/100
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                      {indicators.length > 0 ? indicators.join(", ") : "Standard baseline"}
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
      </Card>
    </div>
  );
}
