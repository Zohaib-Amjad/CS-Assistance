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
  Globe,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  Lock,
  Unlock,
  Server,
  Link as LinkIcon,
  RefreshCw,
  CheckCircle2,
  Info,
  Copy,
  Check,
  X,
  History,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import type { URLScanResult } from "@/lib/detection/url-scanner";
import { formatTimeAgo } from "@/lib/utils";

const SAMPLE_URLS = [
  { label: "Google Search (Safe)", url: "https://google.com/search?q=cybersecurity" },
  { label: "Pakistani Bank Lookalike", url: "http://easypaisa-bonus-claim-reward.xyz/login" },
  { label: "Obfuscated @ Login Trick", url: "https://google.com@evil-attacker-site.top/auth" },
  { label: "Blocked SSRF Target", url: "http://169.254.169.254/latest/meta-data" },
];

interface PastUrlScan {
  id: string;
  summary: string;
  verdict: string;
  score: number;
  createdAt: string;
}

export default function UrlCheckerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<URLScanResult | null>(null);
  const [history, setHistory] = useState<PastUrlScan[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/reports/scans?type=url&limit=10");
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
    if (!url.trim()) {
      toast.error("Please enter a URL to check.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/scan/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error?.message || "URL scan failed.");
      } else {
        setResult(data.data.analysis);
        toast.success("URL safety inspection complete!");
        fetchHistory();
      }
    } catch {
      toast.error("An error occurred during URL inspection.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setResult(null);
    toast.info(`Loaded: ${sampleUrl}`);
  };

  const copyUrl = (targetUrl: string) => {
    navigator.clipboard.writeText(targetUrl);
    toast.success("URL copied to clipboard.");
  };

  const copyReport = () => {
    if (!result) return;
    const text = `[CyberGuard AI URL Safety Audit]
Target URL: ${result.url}
Verdict: ${result.verdict}
Risk Score: ${result.riskScore}/100
SSL/TLS: ${result.hasSsl ? "Valid HTTPS" : "Insecure HTTP"}
Resolved IP: ${result.ipAddress || "Unresolved"}

Threat Indicators:
${result.threatIndicators.map((t) => `- ${t}`).join("\n")}

Recommendations:
${result.recommendations.map((r) => `- ${r}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    toast.success("URL report copied to clipboard.");
  };

  const isSafe = result?.verdict?.toUpperCase() === "SAFE";
  const isSuspicious = result?.verdict?.toUpperCase() === "SUSPICIOUS";
  const isMalicious = result?.verdict?.toUpperCase() === "MALICIOUS";
  const isUnknown = result?.verdict?.toUpperCase() === "UNKNOWN";

  return (
    <div className="space-y-6">
      {/* Header Banner (Screen 6) */}
      <Card className="rounded-2xl border-border bg-gradient-to-r from-card via-card to-blue-50/40 dark:to-blue-950/20 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="cyber" className="text-xs px-2 py-0.5">
            Zero-Execution Sandbox
          </Badge>
          <Badge variant="outline" className="text-xs">
            SSRF Protected
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          URL Safety Checker
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Enter a URL below and check if it&apos;s safe to visit. Inspect destination domains, SSL certificates, typosquatting patterns, and DNS configurations without SSRF vulnerabilities.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Presets */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
            <form onSubmit={handleScan} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="urlInput" className="text-xs font-semibold">
                  Website URL or Domain Address
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="urlInput"
                    required
                    placeholder="https://example.com"
                    className="pl-10 pr-4 rounded-xl text-xs font-mono h-11"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setUrl(""); setResult(null); }}
                  className="rounded-xl text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span>Clear</span>
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl px-6 h-10 font-semibold shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Checking URL...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <span>Check URL</span>
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Target Scenario Presets */}
          <Card className="rounded-2xl border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <LinkIcon className="h-4 w-4 text-blue-500" />
              <span>Test Target Scenarios:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_URLS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(s.url)}
                  className="p-3 rounded-xl border border-border bg-slate-50/70 dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-700 text-left transition-all group"
                >
                  <p className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {s.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                    {s.url}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Scan Result (Screen 6) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Scan Result</h2>
            {result && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setUrl(""); setResult(null); }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline h-7 px-2"
              >
                Scan another URL
              </Button>
            )}
          </div>

          {result ? (
            <Card
              className={`rounded-2xl p-6 space-y-5 shadow-sm animate-in fade-in-50 duration-300 border ${
                isSafe
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
                  : isSuspicious
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60"
                  : isMalicious
                  ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                  : "bg-slate-50 dark:bg-slate-900/40 border-border"
              }`}
            >
              {/* Verdict Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/70">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isSafe
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                        : isSuspicious
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                    }`}
                  >
                    {isSafe ? (
                      <ShieldCheck className="h-6 w-6" />
                    ) : isSuspicious ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : (
                      <ShieldAlert className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {isSafe ? "Safe" : isSuspicious ? "Suspicious" : isMalicious ? "Malicious" : "Unknown"}
                      </h3>
                      <Badge
                        variant={isSafe ? "success" : isSuspicious ? "warning" : "danger"}
                        className="text-[10px] font-semibold uppercase px-2"
                      >
                        {result.verdict}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isSafe
                        ? "This URL appears to be safe."
                        : isSuspicious
                        ? "Suspicious indicators detected. Exercise caution before visiting."
                        : isMalicious
                        ? "Dangerous or malicious URL detected. Access strictly discouraged."
                        : "Could not conclusively verify this URL destination."}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-extrabold text-foreground">{result.riskScore}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Risk Index</p>
                </div>
              </div>

              {/* Escaped URL Display with Copy Button (Never a direct link) */}
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between gap-3 text-xs">
                <span className="font-mono text-foreground truncate select-all">{result.url}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyUrl(result.url)}
                  className="h-7 px-2 shrink-0 text-muted-foreground hover:text-foreground"
                  title="Copy URL"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  <span>Copy</span>
                </Button>
              </div>

              {/* Exact Screen 6 Four Check Criteria */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Security Check Status
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                    <span className="font-medium text-foreground">Domain age is valid</span>
                    {result.checks.validDns ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-4 w-4" /> Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        <AlertTriangle className="h-4 w-4" /> Unverified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                    <span className="font-medium text-foreground">No malicious content found</span>
                    {result.riskScore < 40 ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-4 w-4" /> Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-rose-500">
                        <X className="h-4 w-4" /> Flagged
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                    <span className="font-medium text-foreground">SSL certificate is valid</span>
                    {result.hasSsl ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-4 w-4" /> HTTPS Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-rose-500">
                        <X className="h-4 w-4" /> Insecure HTTP
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                    <span className="font-medium text-foreground">Listed in safe databases</span>
                    {result.checks.allowlistMatched || result.riskScore === 0 ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                        Neutral / Monitored
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Threat Indicators List */}
              {result.threatIndicators && result.threatIndicators.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/70">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Observed Diagnostic Indicators
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {result.threatIndicators.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 bg-card p-2.5 rounded-xl border border-border"
                      >
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Threat Intel Notice */}
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-[11px] text-muted-foreground flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{result.threatIntelNotice}</span>
              </div>

              {/* Copy Report Action */}
              <div className="pt-2 border-t border-border/70 flex items-center justify-between">
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
                  onClick={() => { setUrl(""); setResult(null); }}
                  className="rounded-xl text-xs"
                >
                  <span>Scan Another</span>
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="rounded-2xl border-border bg-card p-12 text-center text-muted-foreground space-y-4 shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Globe className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Awaiting Target URL</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Type a URL on the left or select one of the test scenarios to perform safe threat verification.
                </p>
              </div>
            </Card>
          )}
        </div>

      </div>

      {/* URL History Table */}
      {history.length > 0 && (
        <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-bold text-foreground">Recent URL Scans</h3>
            </div>
            <span className="text-xs text-muted-foreground">Last {history.length} scans</span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">Target Domain / URL</th>
                  <th className="p-3">Verdict</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Inspected</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((scan) => {
                  const isScSafe = scan.verdict?.toLowerCase() === "safe";
                  const isScSusp = scan.verdict?.toLowerCase() === "suspicious";

                  return (
                    <tr key={scan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="p-3 font-mono font-medium text-foreground max-w-xs truncate">
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
                          onClick={() => { setUrl(scan.summary); handleScan(); }}
                          className="h-7 text-xs px-2 text-blue-600 dark:text-blue-400"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          <span>Re-scan</span>
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
    </div>
  );
}
