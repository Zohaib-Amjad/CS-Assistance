import React from "react";
import { requireAuth } from "@/lib/auth-helpers";
import { getUserProfileData } from "@/services/user.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserCheck,
  ShieldCheck,
  Award,
  Calendar,
  Mail,
  Shield,
  Trophy,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles
} from "lucide-react";
import { formatDate, getScoreColor } from "@/lib/utils";

const ALL_ACHIEVEMENTS = [
  { key: "first_scan", title: "Shield Recruit", description: "Completed your first cybersecurity scan", icon: ShieldCheck },
  { key: "phish_hunter", title: "Phish Hunter", description: "Detected and neutralized 10+ phishing email threats", icon: Zap },
  { key: "quiz_scholar", title: "Cyber Scholar", description: "Completed an awareness quiz challenge", icon: Award },
  { key: "perfect_quiz", title: "Cyber Mastermind", description: "Scored a flawless 100% on a security quiz", icon: Trophy },
  { key: "password_master", title: "Entropy Master", description: "Generated or audited a 90+ score resilient password", icon: Lock },
];

export default async function ProfilePage() {
  const sessionUser = await requireAuth();
  const profileData = sessionUser?.id ? await getUserProfileData(sessionUser.id) : null;

  const user = profileData?.user;
  const userBadges = profileData?.achievements || [];
  const score = user?.securityScore ?? 75;
  const scoreStyle = getScoreColor(score);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CG";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              User Profile & Security Badges
            </h1>
            <Badge variant="cyber" className="text-xs">Gamified Defense</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your credentials, track earned awareness badges, and review your cybersecurity posture history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Profile Card */}
        <Card className="lg:col-span-4 rounded-2xl border-border bg-card p-6 shadow-xs space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-24 w-24 border-2 border-indigo-200 dark:border-indigo-800 shadow-md">
              {user?.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
              <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>

            <div>
              <h3 className="text-xl font-bold text-foreground">{user?.name}</h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>

            <Badge variant="cyber" className="capitalize text-xs font-semibold px-3 py-1">
              Role: {user?.role} Officer
            </Badge>
          </div>

          <div className="space-y-3 pt-4 border-t border-border text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" /> Member Since
              </span>
              <span className="font-semibold text-foreground">{formatDate(user?.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-500" /> Defense Level
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Level {Math.floor(score / 20) + 1} Sentinel</span>
            </div>
          </div>

          {/* Security Score Breakdown Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Defensive Posture</span>
              <span className="text-lg font-extrabold text-foreground">{score}/100</span>
            </div>
            <Progress value={score} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Based on scan activity, safe password practices, and quiz achievements.
            </p>
          </div>
        </Card>

        {/* Right Column: Achievements & Activity Log */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Achievement Badges Shelf */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-5">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span>Earned Security Badges</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Accomplishments unlocked by diagnosing threats and mastering quizzes
              </CardDescription>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ALL_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = userBadges.some((b: any) => b.badgeKey === ach.key) || (score > 80 && ach.key === "first_scan");
                const Icon = ach.icon;

                return (
                  <div
                    key={ach.key}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isUnlocked
                        ? "bg-gradient-to-r from-indigo-50/70 to-purple-50/50 dark:from-indigo-950/40 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800 shadow-xs"
                        : "bg-slate-50/50 dark:bg-slate-900/20 border-border opacity-50 grayscale"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isUnlocked
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-200 dark:bg-slate-800 text-muted-foreground"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground">{ach.title}</h4>
                        {isUnlocked && <Badge className="bg-emerald-100 text-emerald-800 text-[9px] py-0 px-1">Unlocked</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Module Telemetry Summary */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
            <CardTitle className="text-base">Diagnostic History Summary</CardTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border">
                <span className="text-[11px] text-muted-foreground">Emails Scanned</span>
                <p className="text-xl font-bold text-foreground mt-1">{user?.phishingScansCount || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border">
                <span className="text-[11px] text-muted-foreground">URLs Checked</span>
                <p className="text-xl font-bold text-foreground mt-1">{user?.urlScansCount || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border">
                <span className="text-[11px] text-muted-foreground">Password Audits</span>
                <p className="text-xl font-bold text-foreground mt-1">{user?.passwordChecksCount || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border">
                <span className="text-[11px] text-muted-foreground">Quizzes Passed</span>
                <p className="text-xl font-bold text-foreground mt-1">{user?.quizzesCompletedCount || 0}</p>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}
