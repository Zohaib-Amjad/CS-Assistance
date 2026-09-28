"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Shield, Cpu, KeyRound, Globe, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [aiProvider, setAiProvider] = React.useState("mock");
  const [googleSafeBrowsingKey, setGoogleSafeBrowsingKey] = React.useState("");
  const [rateLimitRequests, setRateLimitRequests] = React.useState("30");

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Global SOC administration configurations updated!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SOC Global Configuration
          </h1>
          <Badge variant="secondary" className="text-xs">System Settings</Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Configure threat intelligence keys, AI model fallbacks, and serverless rate limiters.
        </p>
      </div>

      <form onSubmit={saveSettings} className="space-y-6">
        
        {/* AI Engine Settings */}
        <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-500" />
            <span>AI Provider & Defensive Reasoning Engine</span>
          </CardTitle>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              { id: "mock", label: "Mock AI (Built-in Demo)", desc: "Offline rule-based fallback" },
              { id: "gemini", label: "Google Gemini", desc: "gemini-1.5-flash / pro" },
              { id: "openai", label: "OpenAI GPT-4o", desc: "Defensive structured API" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setAiProvider(p.id)}
                className={`p-4 rounded-xl border text-left transition-all space-y-1 ${
                  aiProvider === p.id
                    ? "border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 shadow-xs"
                    : "border-border hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <p className="text-xs font-bold">{p.label}</p>
                <p className="text-[10px] text-muted-foreground">{p.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Threat Intelligence API Keys */}
        <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-500" />
            <span>Threat Intelligence Feeds</span>
          </CardTitle>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="gsbKey">Google Safe Browsing API Key</Label>
              <Input
                id="gsbKey"
                type="password"
                placeholder="AIzaSy... (Optional)"
                className="rounded-xl text-xs"
                value={googleSafeBrowsingKey}
                onChange={(e) => setGoogleSafeBrowsingKey(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                When left empty, the URL scanner operates in standalone heuristic analysis mode.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="rateLimit">API Rate Limit Threshold (Requests / Minute)</Label>
              <Input
                id="rateLimit"
                type="number"
                className="rounded-xl text-xs max-w-xs"
                value={rateLimitRequests}
                onChange={(e) => setRateLimitRequests(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="rounded-xl px-8 shadow-md font-semibold">
            <Save className="h-4 w-4 mr-2" />
            <span>Save SOC Configuration</span>
          </Button>
        </div>

      </form>
    </div>
  );
}
