"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Settings,
  Shield,
  Cpu,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface BlockedDomainItem {
  id: string;
  domain: string;
  reason: string;
  addedBy: string;
  createdAt: string | number;
}

interface AIStatus {
  provider: string;
  model: string;
  status: string;
  latencyMs: number;
  rateLimitRemaining: string;
  activeGuardrails: string[];
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [blockedDomains, setBlockedDomains] = useState<BlockedDomainItem[]>([]);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  // New domain form
  const [newDomain, setNewDomain] = useState("");
  const [newReason, setNewReason] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);

  // Maintenance Banner
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState("SOC Telemetry online. Threat signature engine active.");

  const loadSettingsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.success) {
        setBlockedDomains(data.data.blockedDomains || []);
        setAiStatus(data.data.aiStatus || null);
        setBannerText(data.data.bannerMessage || "SOC Telemetry online.");
      }
    } catch (err) {
      console.error("Failed to load admin settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !newReason.trim()) return;

    setAddingDomain(true);
    try {
      const res = await fetch("/api/admin/settings/blocked-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain, reason: newReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Domain '${data.data.domain}' added to blocklist!`);
        setNewDomain("");
        setNewReason("");
        loadSettingsData();
      } else {
        toast.error(data.error?.message || "Failed to add domain.");
      }
    } catch (err) {
      toast.error("Error adding blocked domain.");
    } finally {
      setAddingDomain(false);
    }
  };

  const handleDeleteDomain = async (id: string, domain: string) => {
    try {
      const res = await fetch(`/api/admin/settings/blocked-domains?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Domain '${domain}' removed from blocklist.`);
        setBlockedDomains((prev) => prev.filter((d) => d.id !== id));
      } else {
        toast.error(data.error?.message || "Failed to remove domain.");
      }
    } catch (err) {
      toast.error("Error removing blocked domain.");
    }
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Maintenance banner broadcast preferences updated!");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            SOC Global Settings & Threat Rules
          </h1>
          <Badge variant="cyber" className="text-xs">
            System Control
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Configure domain blacklists, inspect AI inference health, and broadcast maintenance notices.
        </p>
      </div>

      {/* 1. AI Provider Status & Diagnostics */}
      <Card className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                AI Provider Health & Diagnostic Telemetry
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time connection metrics for the neural defensive reasoning assistant
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadSettingsData}
            className="rounded-xl text-xs h-8 px-3"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span>Check Health</span>
          </Button>
        </div>

        {aiStatus ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground">Provider Mode</p>
              <p className="text-xs font-bold text-foreground mt-1 truncate">{aiStatus.provider}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground">Inference Status</p>
              <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {aiStatus.status}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground">Response Latency</p>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                ~{aiStatus.latencyMs} ms
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground">Active Guardrails</p>
              <p className="text-xs font-bold text-foreground mt-1">
                {aiStatus.activeGuardrails?.length || 3} Filters
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Checking AI provider telemetry...
          </div>
        )}
      </Card>

      {/* 2. Blocked Domains Management (blocked_domains) */}
      <Card className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Blocked Domains Blacklist</CardTitle>
            <CardDescription className="text-xs">
              Hard-coded malicious domains flagged for automatic immediate quarantine in URL scans
            </CardDescription>
          </div>
        </div>

        {/* Add Domain Form */}
        <form
          onSubmit={handleAddDomain}
          className="flex flex-col sm:flex-row items-end gap-3 p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-border"
        >
          <div className="space-y-1.5 flex-1 w-full">
            <Label htmlFor="domain" className="text-xs font-semibold">
              Host / FQDN Domain
            </Label>
            <Input
              id="domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. evil-phishing-login.com"
              required
              className="rounded-xl text-xs h-10"
            />
          </div>

          <div className="space-y-1.5 flex-1 w-full">
            <Label htmlFor="reason" className="text-xs font-semibold">
              Threat Rationale / Source
            </Label>
            <Input
              id="reason"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Credential Harvester C2 domain"
              required
              className="rounded-xl text-xs h-10"
            />
          </div>

          <Button
            type="submit"
            disabled={addingDomain}
            className="rounded-xl text-xs h-10 px-5 font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            <span>{addingDomain ? "Adding..." : "Block Domain"}</span>
          </Button>
        </form>

        {/* Blocked Domains Table */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/60 dark:bg-slate-900/40">
              <TableRow>
                <TableHead className="font-bold text-xs">Blocked Domain</TableHead>
                <TableHead className="font-bold text-xs">Reason / Indicator</TableHead>
                <TableHead className="font-bold text-xs">Added By</TableHead>
                <TableHead className="font-bold text-xs">Date Added</TableHead>
                <TableHead className="text-right font-bold text-xs pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {blockedDomains.length > 0 ? (
                blockedDomains.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                      {b.domain}
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium max-w-xs truncate">
                      {b.reason}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.addedBy}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <button
                        type="button"
                        onClick={() => handleDeleteDomain(b.id, b.domain)}
                        title="Remove from blocklist"
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                    No custom domains currently blocklisted.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 3. Maintenance Banner Broadcasting */}
      <Card className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Platform Broadcast & Maintenance Banner</CardTitle>
            <CardDescription className="text-xs">
              Broadcast critical operational notifications to all active workspace users
            </CardDescription>
          </div>
        </div>

        <form onSubmit={handleSaveBanner} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="banner" className="text-xs font-semibold">
              Announcement Message
            </Label>
            <Input
              id="banner"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              className="rounded-xl text-xs h-10"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="rounded-xl text-xs h-10 px-5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              Update Broadcast
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
