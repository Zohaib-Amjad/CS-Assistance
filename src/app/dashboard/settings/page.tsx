"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Settings,
  Moon,
  Sun,
  Laptop,
  Bell,
  Lock,
  Shield,
  Save,
  CheckCircle2,
  Trash2
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [weeklyReport, setWeeklyReport] = React.useState(true);
  const [twoFactorSimulated, setTwoFactorSimulated] = React.useState(true);

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Security preferences and theme settings saved!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Account & Security Settings
          </h1>
          <Badge variant="cyber" className="text-xs">Preferences</Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Customize your appearance, notification thresholds, and security controls.
        </p>
      </div>

      <form onSubmit={saveSettings} className="space-y-6">
        
        {/* Appearance Settings */}
        <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Theme & Display Mode</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Choose your preferred color theme for the CyberGuard AI workspace
          </CardDescription>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border text-center transition-all space-y-2 ${
                theme === "light"
                  ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs"
                  : "border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground"
              }`}
            >
              <Sun className="h-5 w-5 mx-auto text-amber-500" />
              <p className="text-xs">Light Mode</p>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border text-center transition-all space-y-2 ${
                theme === "dark"
                  ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs"
                  : "border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground"
              }`}
            >
              <Moon className="h-5 w-5 mx-auto text-indigo-400" />
              <p className="text-xs">Dark Mode</p>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border text-center transition-all space-y-2 ${
                theme === "system"
                  ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs"
                  : "border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground"
              }`}
            >
              <Laptop className="h-5 w-5 mx-auto text-slate-500" />
              <p className="text-xs">System Default</p>
            </button>
          </div>
        </Card>

        {/* Security & Notification Alerts */}
        <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-5">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-500" />
            <span>Defensive Notifications & Telemetry</span>
          </CardTitle>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">High-Risk Phishing Alerts</span>
                <p className="text-muted-foreground">Receive prompt warnings when a scanned link or email exceeds 80% risk score</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">Weekly Security Hygiene Digest</span>
                <p className="text-muted-foreground">Receive weekly analytics on your diagnostic score progress and new threat tips</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyReport}
                onChange={(e) => setWeeklyReport(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">Multi-Factor Authentication (MFA) Active</span>
                <p className="text-muted-foreground">Two-factor authentication simulation enabled on this workspace account</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorSimulated}
                onChange={(e) => setTwoFactorSimulated(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" className="rounded-xl px-8 shadow-md font-semibold">
            <Save className="h-4 w-4 mr-2" />
            <span>Save Preferences</span>
          </Button>
        </div>

      </form>
    </div>
  );
}
