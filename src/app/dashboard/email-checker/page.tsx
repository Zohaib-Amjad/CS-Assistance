"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  MailCheck,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  History,
  Eye,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { formatTimeAgo, getScoreColor } from "@/lib/utils";
import type { EmailPhishingResult } from "@/lib/detection/phishing";
import { EnvelopeIllustration } from "@/components/shared/EnvelopeIllustration";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SAMPLE_EMAILS = [
  {
    title: "PayPal Urgent Verification (Phishing)",
    sender: "security-update@paypal-verify-account.com",
    body: `From: "PayPal Security" <service@secure-paypal-alerts.com>
Reply-To: phisher-collector@evil-mail.ru
Subject: URGENT: Verification Required

Dear Customer,
We detected unauthorized login attempts on your PayPal account.
Your account will be suspended within 24 hours.

Please verify your password, credit card, and national identity details immediately by visiting:
[https://paypal.com/signin](https://paypal-fake-verify.top/login)

Thank you,
PayPal Security Team`,
  },
  {
    title: "Pakistani Banking / BISP Lure (Phishing)",
    sender: "grant-service@bisp-funds.xyz",
    body: `From: "BISP & HBL Official" <support@hbl-bisp-bonus.xyz>
Subject: Urgent: BISP Grant Rs. 25,000 Approved

Dear Citizen,
Your emergency payment of Rs. 25,000 has been sanctioned under the Ehsaas & BISP program.
To receive the direct transfer to your Easypaisa or HBL account, click here:
https://easypaisa-bonus-claim.top/auth

Enter your CNIC number and account PIN within 12 hours or funds will be forfeited.`,
  },
  {
    title: "GitHub Security Advisory (Legitimate)",
    sender: "notifications@github.com",
    body: `From: "GitHub" <notifications@github.com>
Subject: [GitHub] Security Advisory for personal/project

Hi @developer,
A new security advisory has been published for lodash (CVE-2023-1234).
You can review the details and dependabot update recommendations in your repository security settings.

No immediate password or credential verification is required.

Best regards,
The GitHub Security Team`,
  },
];

interface PastScan {
  id: string;
  summary: string;
  verdict: string;
  score: number;
  createdAt: string;
  details?: any;
}

export default function EmailCheckerPage() {
  const [emailContent, setEmailContent] = useState("");
  const [senderHeader, setSenderHeader] = useState("");
  const [subjectHeader, setSubjectHeader] = useState("");
  const [showAdvancedHeaders, setShowAdvancedHeaders] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailPhishingResult | null>(null);
  const [history, setHistory] = useState<PastScan[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PastScan | null>(null);

  // Fetch recent email scan history on load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/reports/scans?type=email&limit=10");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setHistory(data.data);
        }
      }
    } catch {
      // Ignore background fetch error
    }
  };

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailContent.trim()) {
      toast.error("Please paste email content to analyze.");
      return;
    }

    setLoading(true);
    try {
      // Build composed email string if headers provided
      let fullPayload = emailContent;
      if (senderHeader && !emailContent.includes("From:")) {
        fullPayload = `From: ${senderHeader}\n` + (subjectHeader ? `Subject: ${subjectHeader}\n\n` : "\n") + fullPayload;
      }

      const res = await fetch("/api/scan/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContent: fullPayload, senderHeader }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error?.message || "Analysis failed.");
      } else {
        setResult(data.data.analysis);
        toast.success("Phishing analysis complete!");
        fetchHistory();
      }
    } catch {
      toast.error("An error occurred during scanning.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_EMAILS[0]) => {
    setSenderHeader(sample.sender);
    setEmailContent(sample.body);
    setResult(null);
    toast.info(`Loaded: ${sample.title}`);
  };

  const copyReport = () => {
    if (!result) return;
    const reportText = `[CyberGuard AI Phishing Audit Report]
Verdict: ${result.verdict.toUpperCase()} (Level: ${result.level})
Risk Score: ${result.riskScore}/100
Confidence: ${Math.round(result.confidence * 100)}%

Findings:
${result.findings.map((f) => `- [${f.severity.toUpperCase()}] ${f.type}: ${f.evidence}`).join("\n")}

Recommendations:
${result.recommendations.map((r) => `- ${r}`).join("\n")}

Summary:
${result.summary}`;

    navigator.clipboard.writeText(reportText);
    toast.success("Audit report copied to clipboard.");
  };

  const resetScanner = () => {
    setEmailContent("");
    setSenderHeader("");
    setSubjectHeader("");
    setResult(null);
  };

  const isMalicious = result?.verdict === "malicious" || result?.level === "Phishing Detected" || result?.level === "High Risk";
  const isSuspicious = result?.verdict === "suspicious" || result?.level === "Suspicious";
  const isSafe = result?.verdict === "safe" || result?.level === "Safe";

  return (
    <div className="space-y-6">
      {/* Hero Card with Illustration (Screen 5) */}
      <Card className="rounded-2xl border-border bg-gradient-to-r from-card via-card to-indigo-50/40 dark:to-indigo-950/20 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="cyber" className="text-xs px-2 py-0.5">
                AI & Heuristics Engine
              </Badge>
              <Badge variant="outline" className="text-xs">
                Escaped Text Sandbox
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Email Phishing Detector
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Paste the email content below and our AI will analyze it for phishing threats, social engineering manipulation, look-alike domains, and deceptive links.
            </p>
          </div>

          <div className="hidden md:flex shrink-0">
            <EnvelopeIllustration size={130} />
          </div>
        </div>
      </Card>

      {/* Main Analysis Form & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Email Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
            <form onSubmit={handleScan} className="space-y-4">
              
              {/* Optional Collapsible Headers */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedHeaders(!showAdvancedHeaders)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-2"
                >
                  <span>{showAdvancedHeaders ? "Hide Email Headers" : "Add Specific Sender / Subject Headers"}</span>
                  {showAdvancedHeaders ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showAdvancedHeaders && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border animate-in fade-in-50 mb-3">
                    <div className="space-y-1">
                      <Label htmlFor="senderInput" className="text-[11px] font-semibold">
                        From / Reply-To Header
                      </Label>
                      <Input
                        id="senderInput"
                        placeholder="e.g. PayPal Support <support@paypal-alert.com>"
                        className="rounded-xl text-xs h-9"
                        value={senderHeader}
                        onChange={(e) => setSenderHeader(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="subjectInput" className="text-[11px] font-semibold">
                        Subject Line
                      </Label>
                      <Input
                        id="subjectInput"
                        placeholder="e.g. URGENT: Account Suspended"
                        className="rounded-xl text-xs h-9"
                        value={subjectHeader}
                        onChange={(e) => setSubjectHeader(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Main Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailBody" className="text-xs font-semibold">
                    Email Content or Headers
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {emailContent.length.toLocaleString()} / 20,000 chars
                  </span>
                </div>
                <textarea
                  id="emailBody"
                  required
                  rows={9}
                  maxLength={20000}
                  className="flex w-full rounded-xl border border-input bg-background px-3.5 py-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono leading-relaxed"
                  placeholder="Paste email content here... (including From, Subject, links, and body text)"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetScanner}
                  className="rounded-xl text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span>Clear</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl px-6 h-10 font-semibold shadow-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Analyzing email...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>Analyze Email</span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Quick Preloaded Attack Samples */}
          <Card className="rounded-2xl border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <FileText className="h-4 w-4 text-indigo-500" />
              <span>Preloaded Threat Scenarios:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_EMAILS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(sample)}
                  className="p-3 rounded-xl border border-border bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-700 text-left transition-all group"
                >
                  <p className="text-xs font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {sample.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">
                    {sample.sender}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Analysis Result (Screen 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Analysis Result</h2>
            {result && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetScanner}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline h-7 px-2"
              >
                Check another
              </Button>
            )}
          </div>

          {result ? (
            <Card
              className={`rounded-2xl p-6 space-y-5 shadow-sm animate-in fade-in-50 duration-300 border ${
                isMalicious
                  ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                  : isSuspicious
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60"
                  : "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
              }`}
            >
              {/* Top Verdict Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/70">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isMalicious
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                        : isSuspicious
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                    }`}
                  >
                    {isMalicious ? (
                      <ShieldAlert className="h-6 w-6" />
                    ) : isSuspicious ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : (
                      <ShieldCheck className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {isMalicious ? "Phishing Detected" : isSuspicious ? "Suspicious Email" : "Legitimate / Safe"}
                      </h3>
                      <Badge
                        variant={isMalicious ? "danger" : isSuspicious ? "warning" : "success"}
                        className="text-[10px] font-semibold uppercase px-2"
                      >
                        {result.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isMalicious
                        ? "This email contains several suspicious elements that may indicate a phishing attempt."
                        : isSuspicious
                        ? "Potential phishing indicators detected. Exercise caution before acting."
                        : "This email follows standard communication patterns with no critical red flags."}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-extrabold text-foreground">{result.riskScore}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Risk Index</p>
                </div>
              </div>

              {/* Key Indicators Bullets (Screen 5 Requirement) */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">
                  {isMalicious ? "Potential phishing indicators detected:" : "Diagnostic observations:"}
                </p>
                <div className="space-y-1.5">
                  {result.findings.length > 0 ? (
                    result.findings.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs p-2.5 rounded-xl bg-card/80 border border-border"
                      >
                        <AlertCircle
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            f.severity === "critical"
                              ? "text-rose-500"
                              : f.severity === "high"
                              ? "text-amber-500"
                              : "text-indigo-500"
                          }`}
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground">{f.type}</span>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {f.evidence} — <span className="italic">{f.explanation}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl bg-card border border-border">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>No social engineering or deceptive URLs detected.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted Links Section */}
              {result.extractedLinks && result.extractedLinks.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/70">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Extracted Destination Links ({result.extractedLinks.length})
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {result.extractedLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-card border border-border text-[11px] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 truncate font-mono">
                          <span className="text-foreground">{link.text || link.href}</span>
                          {link.isMismatched && (
                            <p className="text-[10px] text-rose-500 font-sans">
                              ⚠️ True Destination: {link.href}
                            </p>
                          )}
                        </div>
                        {link.isLookalike && (
                          <Badge variant="danger" className="text-[9px] py-0 px-1 shrink-0">
                            Lookalike
                          </Badge>
                        )}
                        {link.isShortener && (
                          <Badge variant="warning" className="text-[9px] py-0 px-1 shrink-0">
                            Shortener
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Gauge Breakdown */}
              <div className="space-y-2.5 pt-2 border-t border-border/70">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">Analysis Confidence</span>
                  <span className="font-bold text-foreground">{Math.round(result.confidence * 100)}%</span>
                </div>
                <Progress value={result.confidence * 100} className="h-2" />
              </div>

              {/* Recommendations Checklist */}
              <div className="space-y-2 pt-2 border-t border-border/70">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Recommended Defensive Actions
                </h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Copy Report / Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-border/70">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReport}
                  className="rounded-xl text-xs"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  <span>Copy Report</span>
                </Button>
                <Button
                  size="sm"
                  onClick={resetScanner}
                  className="rounded-xl text-xs shadow-xs"
                >
                  <span>Check Another Email</span>
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="rounded-2xl border-border bg-card p-12 text-center text-muted-foreground space-y-4 shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <MailCheck className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Awaiting Email Content</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Paste an email body on the left or select a preloaded attack sample to execute deep phishing analysis.
                </p>
              </div>
            </Card>
          )}
        </div>

      </div>

      {/* Recent Email Scans History Table */}
      {history.length > 0 && (
        <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-foreground">Recent Email Scans</h3>
            </div>
            <span className="text-xs text-muted-foreground">Last {history.length} scans</span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">Summary / Subject</th>
                  <th className="p-3">Verdict</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Scanned</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((scan) => {
                  const isScSafe = scan.verdict?.toLowerCase() === "safe";
                  const isScSusp = scan.verdict?.toLowerCase() === "suspicious";

                  return (
                    <tr key={scan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="p-3 font-medium text-foreground max-w-xs truncate">
                        {scan.summary}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={isScSafe ? "success" : isScSusp ? "warning" : "danger"}
                          className="capitalize text-[10px]"
                        >
                          {scan.verdict}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold">{scan.score}/100</td>
                      <td className="p-3 text-muted-foreground">{formatTimeAgo(scan.createdAt)}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedHistoryItem(scan)}
                          className="h-7 text-xs px-2 text-indigo-600 dark:text-indigo-400"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span>View</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* History Detail Modal */}
      <Dialog open={!!selectedHistoryItem} onOpenChange={(open) => !open && setSelectedHistoryItem(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Past Email Scan Details</DialogTitle>
          </DialogHeader>
          {selectedHistoryItem && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
                <div>
                  <span className="text-muted-foreground">Verdict:</span>
                  <p className="font-bold text-sm capitalize">{selectedHistoryItem.verdict}</p>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">Risk Score:</span>
                  <p className="font-bold text-sm">{selectedHistoryItem.score}/100</p>
                </div>
              </div>

              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Content Summary</Label>
                <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border mt-1 font-mono text-[11px]">
                  {selectedHistoryItem.summary}
                </p>
              </div>

              <div className="text-[11px] text-muted-foreground">
                Scanned on {new Date(selectedHistoryItem.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
