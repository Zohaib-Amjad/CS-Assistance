"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  FileText,
  Download,
  Filter,
  Activity,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Calendar,
  Layers,
  Loader2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface ScanLog {
  id: string;
  userId: string;
  type: string;
  inputSummary: string;
  resultScore: number;
  verdict: string;
  createdAt: string | number;
}

export default function AdminReportsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState("30d");
  const [scanType, setScanType] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const [emailRes, urlRes] = await Promise.all([
        fetch("/api/admin/email-logs?limit=50"),
        fetch("/api/admin/url-logs?limit=50"),
      ]);

      const emailData = await emailRes.json();
      const urlData = await urlRes.json();

      const combined: ScanLog[] = [
        ...(emailData.data?.items?.map((i: any) => ({ ...i, type: "email" })) || []),
        ...(urlData.data?.items?.map((i: any) => ({ ...i, type: "url" })) || []),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setLogs(combined);
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    const matchType = scanType === "All" || log.type.toLowerCase() === scanType.toLowerCase();
    const verdict = (log.verdict || "").toLowerCase();
    const matchRisk =
      riskFilter === "All" ||
      (riskFilter === "Malicious" && (verdict === "malicious" || verdict === "danger")) ||
      (riskFilter === "Suspicious" && (verdict === "suspicious" || verdict === "weak")) ||
      (riskFilter === "Safe" && verdict === "safe");

    return matchType && matchRisk;
  });

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast.warning("No logs to export.");
      return;
    }

    const headers = ["Scan ID", "Module", "Payload Summary", "Risk Score", "Verdict", "Timestamp"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.type,
      `"${l.inputSummary.replace(/"/g, '""')}"`,
      l.resultScore,
      l.verdict,
      new Date(l.createdAt).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `soc-audit-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredLogs.length} audit records to CSV.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              SOC Threat Intelligence & Forensics Reports
            </h1>
            <Badge variant="secondary" className="text-xs">
              Audit Trail
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Analyze cross-organization security inspections, classification trends, and telemetry traces.
          </p>
        </div>

        <Button
          onClick={handleExport}
          size="sm"
          className="rounded-xl text-xs h-10 px-4.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          <span>Export Forensics CSV</span>
        </Button>
      </div>

      {/* Filter Controls Row */}
      <div className="p-4 rounded-3xl border border-border bg-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </span>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1">
            {["7d", "30d", "90d", "All"].map((d) => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  dateRange === d
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <span className="text-border">|</span>

          {/* Module Filter */}
          <div className="flex items-center gap-1">
            {["All", "Email", "URL"].map((m) => (
              <button
                key={m}
                onClick={() => setScanType(m)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  scanType === m
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <span className="text-border">|</span>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1">
            {["All", "Malicious", "Suspicious", "Safe"].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  riskFilter === r
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-semibold text-muted-foreground">
          Showing {filteredLogs.length} events
        </span>
      </div>

      {/* Reports Table Card */}
      <Card className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-border">
              <TableRow>
                <TableHead className="font-bold text-xs">Event ID</TableHead>
                <TableHead className="font-bold text-xs">Module</TableHead>
                <TableHead className="font-bold text-xs">Payload / Target</TableHead>
                <TableHead className="font-bold text-xs">Verdict</TableHead>
                <TableHead className="font-bold text-xs">Risk Score</TableHead>
                <TableHead className="font-bold text-xs">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">Loading forensic trace logs...</p>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {s.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {s.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium max-w-sm truncate">
                      {s.inputSummary}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ["malicious", "danger"].includes(s.verdict)
                            ? "danger"
                            : s.verdict === "safe"
                            ? "success"
                            : "warning"
                        }
                        className="text-[10px] capitalize"
                      >
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No logs found matching current filter configuration.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
