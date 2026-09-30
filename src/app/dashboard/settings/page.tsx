"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ShieldCheck,
  Save,
  CheckCircle2,
  Trash2,
  KeyRound,
  AlertTriangle,
  User,
  Smartphone,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Settings State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete Account State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Load initial settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/settings"),
        ]);

        const profileData = await profileRes.json();
        const settingsData = await settingsRes.json();

        if (profileData.success && profileData.data.user) {
          setName(profileData.data.user.name || "");
          setEmail(profileData.data.user.email || "");
        }

        if (settingsData.success && settingsData.data) {
          setEmailNotifications(settingsData.data.emailNotifications ?? true);
          setSecurityAlerts(settingsData.data.securityAlerts ?? true);
          setQuizReminders(settingsData.data.quizReminders ?? true);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  // Save Account & Notification settings
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      // Save profile name
      const profilePromise = fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      // Save notification settings
      const settingsPromise = fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications,
          securityAlerts,
          quizReminders,
        }),
      });

      const [pRes, sRes] = await Promise.all([profilePromise, settingsPromise]);

      if (pRes.ok && sRes.ok) {
        toast.success("Account preferences and notification settings saved!");
      } else {
        toast.error("Failed to save some preferences.");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      toast.error("An error occurred while saving settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Password updated successfully! Session tokens rotated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error?.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Change password error:", err);
      toast.error("An error occurred while changing password.");
    } finally {
      setChangingPassword(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' in capital letters.");
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmationText: deleteConfirmText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Account deleted. Signing out...");
        setDeleteOpen(false);
        setTimeout(() => {
          signOut({ callbackUrl: "/login" });
        }, 1200);
      } else {
        toast.error(data.error?.message || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error("An error occurred during account deletion.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Account & Security Settings
          </h1>
          <Badge variant="cyber" className="text-xs">
            Preferences
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your account credentials, password security, telemetry alerts, and workspace theme.
        </p>
      </div>

      {/* 1. Account Details */}
      <Card className="rounded-3xl border-border bg-card p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <User className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Account Profile</CardTitle>
            <CardDescription className="text-xs">
              Your primary identity and verified email address
            </CardDescription>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              Display Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl text-xs h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              value={email}
              disabled
              className="rounded-xl text-xs h-10 bg-muted/50 cursor-not-allowed"
            />
          </div>
        </div>
      </Card>

      {/* 2. Security & Password Change */}
      <Card className="rounded-3xl border-border bg-card p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <KeyRound className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Security & Authentication</CardTitle>
            <CardDescription className="text-xs">
              Change master password, invalidate active tokens, and configure two-factor authentication
            </CardDescription>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="curr-pass" className="text-xs font-semibold">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="curr-pass"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="rounded-xl text-xs h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-pass" className="text-xs font-semibold">
                New Password
              </Label>
              <Input
                id="new-pass"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters with symbol"
                required
                className="rounded-xl text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pass" className="text-xs font-semibold">
                Confirm New Password
              </Label>
              <Input
                id="confirm-pass"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="rounded-xl text-xs h-10"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={changingPassword}
              className="rounded-xl text-xs h-10 px-5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>

        {/* 2FA Coming Soon Card */}
        <div className="p-4.5 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs mt-0.5">
              <Smartphone className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Two-Factor Authentication (2FA / WebAuthn)
                </span>
                <Badge variant="outline" className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-300">
                  Coming soon
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Hardware security key (FIDO2) and TOTP authenticator app support are in development.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Defensive Notifications */}
      <Card className="rounded-3xl border-border bg-card p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Bell className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Notifications & Alerts</CardTitle>
            <CardDescription className="text-xs">
              Configure real-time threat notifications, email briefings, and quiz streak alerts
            </CardDescription>
          </div>
        </div>

        <div className="space-y-3 text-xs pt-1">
          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer hover:border-indigo-300 transition-colors">
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground">Critical Security Alerts</span>
              <p className="text-muted-foreground">
                Receive high-priority alerts when a scanned link or email exceeds 80% risk score
              </p>
            </div>
            <input
              type="checkbox"
              checked={securityAlerts}
              onChange={(e) => setSecurityAlerts(e.target.checked)}
              className="h-4.5 w-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-border"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer hover:border-indigo-300 transition-colors">
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground">Email Notifications & Digest</span>
              <p className="text-muted-foreground">
                Receive weekly executive summaries of your defensive health and new threat tips
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4.5 w-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-border"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer hover:border-indigo-300 transition-colors">
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground">Quiz & Streak Reminders</span>
              <p className="text-muted-foreground">
                Receive reminder prompts to maintain your daily login streak and take awareness quizzes
              </p>
            </div>
            <input
              type="checkbox"
              checked={quizReminders}
              onChange={(e) => setQuizReminders(e.target.checked)}
              className="h-4.5 w-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-border"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSavePreferences}
            disabled={savingSettings}
            className="rounded-xl text-xs h-10 px-5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            <span>{savingSettings ? "Saving..." : "Save Preferences"}</span>
          </Button>
        </div>
      </Card>

      {/* 4. Appearance & Theme */}
      <Card className="rounded-3xl border-border bg-card p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sun className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Theme & Appearance</CardTitle>
            <CardDescription className="text-xs">
              Select your visual mode for the CyberGuard AI interface
            </CardDescription>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-4 rounded-2xl border text-center transition-all space-y-2 ${
              theme === "light"
                ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs"
                : "border-border hover:bg-slate-50 dark:hover:bg-slate-800/60 text-muted-foreground"
            }`}
          >
            <Sun className="h-5 w-5 mx-auto text-amber-500" />
            <p className="text-xs">Light</p>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-2xl border text-center transition-all space-y-2 ${
              theme === "dark"
                ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs"
                : "border-border hover:bg-slate-50 dark:hover:bg-slate-800/60 text-muted-foreground"
            }`}
          >
            <Moon className="h-5 w-5 mx-auto text-indigo-400" />
            <p className="text-xs">Dark</p>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`p-4 rounded-2xl border text-center transition-all space-y-2 ${
              theme === "system"
                ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs"
                : "border-border hover:bg-slate-50 dark:hover:bg-slate-800/60 text-muted-foreground"
            }`}
          >
            <Laptop className="h-5 w-5 mx-auto text-slate-500" />
            <p className="text-xs">System</p>
          </button>
        </div>
      </Card>

      {/* 5. Danger Zone / Delete Account */}
      <Card className="rounded-3xl border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/10 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Trash2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-rose-700 dark:text-rose-400">
              Danger Zone
            </CardTitle>
            <CardDescription className="text-xs">
              Permanently remove your account and purge all diagnostic scans, quiz attempts, and activity history
            </CardDescription>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Once deleted, your account and all associated telemetry, saved reports, and earned badges cannot be recovered. Data is removed according to our retention and cascading purge policies.
        </p>

        <div className="pt-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="rounded-xl text-xs h-10 px-5 font-bold"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            <span>Delete Account</span>
          </Button>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* DIALOG: CONFIRM ACCOUNT DELETION */}
      {/* ========================================================================= */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 space-y-5 border-rose-200 dark:border-rose-900/60">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Account Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This action is irreversible. All your security scans, quiz attempts, conversations, and badges will be permanently erased.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeleteAccount} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="del-pass" className="text-xs font-semibold">
                Confirm Master Password
              </Label>
              <Input
                id="del-pass"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="rounded-xl text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="del-text" className="text-xs font-semibold">
                Type <span className="font-mono text-rose-600 font-bold">DELETE MY ACCOUNT</span>
              </Label>
              <Input
                id="del-text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                required
                className="rounded-xl text-xs h-10 font-mono"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={deleting || deleteConfirmText !== "DELETE MY ACCOUNT"}
                className="rounded-xl text-xs font-bold"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
