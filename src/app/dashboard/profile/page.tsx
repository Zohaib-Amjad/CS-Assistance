"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Calendar,
  Mail,
  Phone,
  Globe,
  Camera,
  Edit3,
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2,
  Zap,
  BotMessageSquare,
  MailCheck,
  Flame,
  ArrowRight,
  User,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  country?: string | null;
  bio?: string | null;
  role: string;
  plan: string;
  status: string;
  securityScore: number;
  loginStreak: number;
  createdAt: string | number;
}

interface EvaluatedAchievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string | null;
  progress: {
    current: number;
    target: number;
    unit: string;
    percentage: number;
  };
}

interface ProfileData {
  user: UserProfile;
  stats: {
    quizzesTaken: number;
    scansPerformed: number;
    threatsDetected: number;
    securityScore: number;
    loginStreak: number;
  };
  achievements: EvaluatedAchievement[];
  recentAchievements: EvaluatedAchievement[];
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country: "",
    bio: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch profile data
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileData(data.data);
        setFormData({
          name: data.data.user.name || "",
          phone: data.data.user.phone || "",
          country: data.data.user.country || "Pakistan",
          bio: data.data.user.bio || "",
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size on client side
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar size must be under 2 MB.");
      return;
    }

    setUploadingAvatar(true);
    const form = new FormData();
    form.append("avatar", file);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Profile avatar updated successfully!");
        loadProfile();
      } else {
        toast.error(data.error?.message || "Failed to upload avatar.");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Error uploading avatar.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle profile edit submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Profile updated successfully!");
        setEditOpen(false);
        loadProfile();
      } else {
        toast.error(data.error?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "ShieldAlert":
        return ShieldAlert;
      case "Award":
        return Award;
      case "ShieldCheck":
        return ShieldCheck;
      case "Globe":
        return Globe;
      case "MailCheck":
        return MailCheck;
      case "Trophy":
        return Trophy;
      case "Sparkles":
        return Sparkles;
      case "BotMessageSquare":
        return BotMessageSquare;
      case "Zap":
        return Zap;
      default:
        return ShieldCheck;
    }
  };

  const getIconColorClass = (index: number) => {
    if (index === 0) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
    if (index === 1) return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50";
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
  };

  if (loading || !profileData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { user, stats, achievements, recentAchievements } = profileData;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AK";

  const memberSinceFormatted = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "May 15, 2024";

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header Badge & Title (Matching reference 10. User Profile) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-sm shadow-md shadow-indigo-500/30">
            10.
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              User Profile
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage your personal security profile, telemetry badges, and defense credentials.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setEditOpen(true)}
          variant="outline"
          size="sm"
          className="rounded-xl border-border hover:bg-muted font-semibold text-xs"
        >
          <Edit3 className="mr-1.5 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* Main Profile Grid (Screen 10 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar + Info + 3 Stat Cards + Security Score Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-6">
            {/* User Info Header: Avatar with Camera upload button + Name + Yellow "Premium User" badge */}
            <div className="flex items-start gap-5">
              {/* Avatar with Camera Icon Overlay */}
              <div className="relative group shrink-0">
                <Avatar className="h-20 w-20 sm:h-22 sm:w-22 rounded-full border-2 border-indigo-200 dark:border-indigo-800 shadow-md">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-xl font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                {/* Camera Overlay Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Upload new avatar image (Max 2MB)"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/90 text-white hover:bg-indigo-600 transition-colors shadow-md border-2 border-background"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* User Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {user.name}
                </h2>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>

                {/* Yellow "Premium User" badge */}
                <div className="pt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/80 shadow-2xs">
                    <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>{user.plan === "PREMIUM" ? "Premium User" : "Premium User"}</span>
                  </span>
                </div>

                {/* Member Since */}
                <p className="text-[11px] text-muted-foreground pt-0.5">
                  Member since {memberSinceFormatted}
                </p>
              </div>
            </div>

            {/* 3 Stat Cards in a row: Quizzes Taken | Scans Performed | Threats Detected */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border text-center">
                <p className="text-[11px] font-semibold text-muted-foreground truncate">
                  Quizzes Taken
                </p>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  {stats.quizzesTaken}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border text-center">
                <p className="text-[11px] font-semibold text-muted-foreground truncate">
                  Scans Performed
                </p>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  {stats.scansPerformed}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border text-center">
                <p className="text-[11px] font-semibold text-muted-foreground truncate">
                  Threats Detected
                </p>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                  {stats.threatsDetected}
                </p>
              </div>
            </div>

            {/* Security Score Card with Big Percentage and Green Progress Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-border space-y-2.5">
              <span className="text-xs font-bold text-muted-foreground">Security Score</span>
              <div className="text-3xl sm:text-4xl font-black text-foreground">
                {stats.securityScore}%
              </div>

              {/* Green Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.securityScore}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Achievements + "View All Achievements" Link */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span>Recent Achievements</span>
                </h3>
              </div>

              {/* 3 Stacked Achievement Cards */}
              <div className="space-y-3">
                {recentAchievements.map((ach, idx) => {
                  const IconComponent = getIconComponent(ach.icon);
                  const colorStyle = getIconColorClass(idx);

                  return (
                    <div
                      key={ach.code}
                      className="p-4 rounded-2xl border border-border bg-card hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors flex items-center gap-3.5 shadow-2xs"
                    >
                      {/* Shield / Badge Icon */}
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${colorStyle}`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Text */}
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {ach.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-snug">
                          {ach.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* "View All Achievements" Clickable Link */}
            <div className="pt-3 border-t border-border/70 text-left">
              <button
                type="button"
                onClick={() => setAchievementsOpen(true)}
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5"
              >
                <span>View All Achievements</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIALOG: VIEW ALL ACHIEVEMENTS (LOCKED ONES WITH PROGRESS) */}
      {/* ========================================================================= */}
      <Dialog open={achievementsOpen} onOpenChange={setAchievementsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              <span>CyberGuard Security Badges</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Unlock prestigious cybersecurity badges by completing scans, scoring 90%+ in quizzes, and keeping your daily streak active.
            </DialogDescription>
          </DialogHeader>

          {/* Grid of All Achievements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {achievements.map((ach) => {
              const IconComp = getIconComponent(ach.icon);

              return (
                <div
                  key={ach.code}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    ach.unlocked
                      ? "border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30"
                      : "border-border bg-slate-50/50 dark:bg-slate-900/30 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          ach.unlocked
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ach.unlocked ? (
                          <IconComp className="h-5 w-5" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground">
                          {ach.title}
                        </h4>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                          {ach.category}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={ach.unlocked ? "cyber" : "outline"}
                      className="text-[10px]"
                    >
                      {ach.unlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">{ach.description}</p>

                  {/* Progress Indicator for Locked Achievements */}
                  {!ach.unlocked && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {ach.progress.current} / {ach.progress.target} {ach.progress.unit}
                        </span>
                      </div>
                      <Progress value={ach.progress.percentage} className="h-1.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setAchievementsOpen(false)}
              className="rounded-xl w-full sm:w-auto text-xs font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: EDIT PROFILE (NAME, PHONE, COUNTRY, BIO) */}
      {/* ========================================================================= */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Edit Personal Profile</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your contact details, country, and professional cybersecurity background.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-xl text-xs h-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  className="rounded-xl text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-semibold">
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Pakistan"
                  className="rounded-xl text-xs h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-semibold">
                Bio / Security Role
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Senior Security Analyst & Researcher..."
                rows={3}
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
