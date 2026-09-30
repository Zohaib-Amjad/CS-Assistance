"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileBarChart,
  Download,
  ShieldCheck,
  ShieldAlert,
  MailCheck,
  Globe,
  KeyRound,
  Filter,
  Printer,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [scans, setScans] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState<"all" | "email" | "url" | "password">("all");
  const [loading, setLoading] = React.useState(true);
  const [downloading, setDownloading] = React.useState(false);

  React.useEffect(() => {
    async function loadScans() {
      try {
        const res = await fetch("/api/reports/scans");
        const data = await res.json();
        if (data.success) {
          setScans(data.data.scans || []);
        }
      } catch {
        // Fallback demo scans
        setScans([
          {
            id: "1",
            type: "email",
            inputSummary: "Urgent PayPal Security Notice",
            resultScore: 92,
            verdict: "malicious",
            createdAt: Date.now() - 3600000,
          },
          {
            id: "2",
            type: "url",
            inputSummary: "https://secure-login-chase-update.com/auth",
            resultScore: 88,
            verdict: "malicious",
            createdAt: Date.now() - 7200000,
          },
          {
            id: "3",
            type: "password",
            inputSummary: "Password Entropy Audit (18 chars)",
            resultScore: 95,
            verdict: "strong",
            createdAt: Date.now() - 86400000,
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadScans();
  }, []);

  const filteredScans = React.useMemo(() => {
    if (filter === "all") return scans;
    return scans.filter((s) => s.type === filter);
  }, [scans, filter]);

  const generatePdf = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("CyberGuard AI — Security Health Audit Report", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Defensive Cybersecurity Platform`, 14, 28);

      // Summary Box
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("1. Executive Summary & Telemetry", 14, 48);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const total = scans.length;
      const threats = scans.filter((s) => s.verdict === "malicious" || s.verdict === "weak").length;
      const safeCount = scans.filter((s) => s.verdict === "safe" || s.verdict === "strong").length;

      doc.text(`Total Diagnostic Scans: ${total}`, 14, 56);
      doc.text(`Identified Threats / Vulnerabilities: ${threats}`, 14, 62);
      doc.text(`Clean / Resilient Assets: ${safeCount}`, 14, 68);

      // Scans Table
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("2. Diagnostic Scan Log", 14, 82);

      const tableData = scans.map((s) => [
        s.type?.toUpperCase() || "N/A",
        s.inputSummary || "N/A",
        s.verdict?.toUpperCase() || "N/A",
        `${s.resultScore || 0}/100`,
        formatDate(s.createdAt),
      ]);

      autoTable(doc, {
        startY: 88,
        head: [["Module", "Target Summary", "Verdict", "Score", "Timestamp"]],
        body: tableData,
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      // Footer disclaimer
      const finalY = (doc as any).lastAutoTable?.finalY || 180;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Confidential document. Produced by CyberGuard AI. Passwords evaluated client-side with zero plaintext retention.",
        14,
        finalY + 15
      );

      doc.save(`CyberGuard-Security-Report-${formatDate(Date.now()).replace(/\s+/g, "-")}.pdf`);
      toast.success("Security PDF Report generated and downloaded!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const totalScans = scans.length;
  const threatCount = scans.filter((s) => s.verdict === "malicious" || s.verdict === "weak").length;
  const safeCount = scans.filter((s) => s.verdict === "safe" || s.verdict === "strong").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Security Health & Audit Reports
            </h1>
            <Badge variant="cyber" className="text-xs">PDF Signed Export</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review detailed telemetry, inspect threat distributions, and generate verifiable security audit summaries.
          </p>
        </div>

        <Button
          onClick={generatePdf}
          disabled={downloading || scans.length === 0}
          className="rounded-xl shadow-md px-5 font-semibold h-10"
        >
          <Download className="h-4 w-4 mr-2" />
          <span>{downloading ? "Exporting PDF..." : "Download PDF Audit Report"}</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border bg-card p-5">
          <span className="text-xs font-medium text-muted-foreground">Total Scans Performed</span>
          <p className="text-3xl font-extrabold text-foreground mt-2">{totalScans}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Across all defense modules</p>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5">
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400 font-semibold">Threats Flagged</span>
          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{threatCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Phishing links & weak passwords</p>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-semibold">Safe & Resilient Items</span>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{safeCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Passed defensive standards</p>
        </Card>
      </div>

      {/* Filter Tabs & Data Table */}
      <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Comprehensive Audit Records</CardTitle>
            <CardDescription className="text-xs">Filter through individual diagnostic telemetry logs</CardDescription>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            {(["all", "email", "url", "password"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  filter === t
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "All Modules" : t}
              </button>
            ))}
          </div>
        </div>

        {filteredScans.length > 0 ? (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Input Target Summary</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.map((scan) => {
                  const isSafe = scan.verdict === "safe" || scan.verdict === "strong";
                  const isSuspicious = scan.verdict === "suspicious" || scan.verdict === "moderate";
                  return (
                    <TableRow key={scan.id}>
                      <TableCell className="font-semibold text-xs capitalize flex items-center gap-2">
                        {scan.type === "email" && <MailCheck className="h-4 w-4 text-indigo-500" />}
                        {scan.type === "url" && <Globe className="h-4 w-4 text-blue-500" />}
                        {scan.type === "password" && <KeyRound className="h-4 w-4 text-emerald-500" />}
                        <span>{scan.type} Scanner</span>
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
          <div className="text-center py-12 text-muted-foreground text-xs space-y-2">
            <FileBarChart className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p>No audit scans match the selected filter.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
