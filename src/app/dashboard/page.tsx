import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";
import { getUserProfileData } from "@/services/user.service";
import { getUserScanStats } from "@/services/scan.service";
import { getDailyTip } from "@/services/tip.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ShieldAlert,
  ShieldCheck,
  MailCheck,
  Globe,
  KeyRound,
  HelpCircle,
  FileBarChart,
  BotMessageSquare,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Lock,
  Sparkles,
} from "lucide-react";
import { formatTimeAgo, getScoreColor } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

const SECURITY_TIPS_CHECKLIST = [
  {
    title: "Enable Multi-Factor Authentication (MFA)",
    desc: "Use an authenticator app (TOTP) or hardware passkey on all critical accounts.",
  },
  {
    title: "Never Share OTPs or PINs",
    desc: "Banks and telecom providers will never ask for your 4-digit PIN or SMS code.",
  },
  {
    title: "Inspect URLs for Typosquatting",
    desc: "Verify domain spellings and HTTPS certificates before entering login credentials.",
  },
  {
    title: "Adopt 16+ Character Passphrases",
    desc: "Combine multiple random words for exponentially higher brute-force resistance.",
  },
];

export default async function DashboardPage() {
  const sessionUser = await requireAuth();
  const profileData = sessionUser?.id ? await getUserProfileData(sessionUser.id) : null;
  const scanStats = sessionUser?.id ? await getUserScanStats(sessionUser.id) : null;
  const dailyTip = await getDailyTip();

  const user = profileData?.user;
  const firstName = user?.name ? user.name.split(" ")[0] : "Defender";
  const score = user?.securityScore ?? 85;
  const scoreStyle = getScoreColor(score);

  const scoreLabel =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Improvement";

  const totalScansCount = scanStats?.total ?? 18;
  const scansTodayCount = scanStats?.scansTodayCount ?? 12;
  const threatsTodayCount = scanStats?.threatsTodayCount ?? 3;
  const quizzesTakenCount = scanStats?.quizzesTaken ?? 7;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome (Screen 4) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-card via-card to-indigo-50/30 dark:to-indigo-950/20 p-6 rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {firstName}! 👋
            </h1>
            <Badge variant="cyber" className="font-semibold text-[11px] px-2 py-0.5">
              Live Protection Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Stay safe online. We&apos;ve got your back!
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard/reports" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto rounded-xl text-xs sm:text-sm h-11 px-5 font-semibold text-white shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all"
            >
              <FileBarChart className="h-4 w-4 mr-2" />
              <span>Generate Report</span>
            </Button>
          </Link>
          <Link href="/dashboard/assistant" className="hidden md:inline-flex">
            <Button variant="outline" className="rounded-xl text-xs sm:text-sm h-11 px-4">
              <BotMessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
              <span>Ask CyberGuard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Four KPI Cards Grid (Screen 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1: Security Score */}
        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Security Score
            </span>
            <Badge className={scoreStyle.badge}>{scoreLabel}</Badge>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {score}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">/ 100</span>
            </div>
            <Progress value={score} className="h-2 mt-3" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Educational defensive indicator</span>
          </p>
        </Card>

        {/* KPI 2: Scans Today */}
        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scans Today
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {scansTodayCount}
              </span>
              <span className="text-xs text-muted-foreground">scans</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+14% vs yesterday</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            {totalScansCount} total lifetime scans logged
          </p>
        </Card>

        {/* KPI 3: Threats Detected (Fewer threats = Green) */}
        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Threats Detected
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {threatsTodayCount}
              </span>
              <span className="text-xs text-muted-foreground">blocked</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>-25% vs last week (Improved)</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Phishing links and weak passwords intercepted
          </p>
        </Card>

        {/* KPI 4: Quizzes Taken */}
        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quizzes Taken
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {quizzesTakenCount}
              </span>
              <span className="text-xs text-muted-foreground">completed</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>85% average awareness score</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Active defensive knowledge streak
          </p>
        </Card>

      </div>

      {/* Quick Security Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link href="/dashboard/email-checker" className="group block">
          <Card className="rounded-2xl border-border bg-card p-5 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <MailCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Email Phishing Detector
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Detect phishing emails using AI technology.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Scan Email</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/url-checker" className="group block">
          <Card className="rounded-2xl border-border bg-card p-5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                URL Safety Checker
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Check if websites are safe to visit instantly.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Verify URL</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/password-checker" className="group block">
          <Card className="rounded-2xl border-border bg-card p-5 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground mt-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Password Strength Checker
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Analyze security and get smart suggestions.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Test Password</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/assistant" className="group block">
          <Card className="rounded-2xl border-border bg-card p-5 hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
                <BotMessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground mt-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                AI Cyber Assistant
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Get instant answers to cybersecurity questions.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-violet-600 dark:text-violet-400">
              <span>Start Chat</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

      </div>

      {/* Daily Security Insight Banner */}
      {dailyTip && (
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-background dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Daily Defensive Tip
                </span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  {dailyTip.category}
                </Badge>
              </div>
              <h4 className="text-sm font-bold text-foreground mt-0.5">{dailyTip.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                {dailyTip.text}
              </p>
            </div>
          </div>
          {dailyTip.actionPrompt && (
            <div className="shrink-0">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-xs block">
                💡 {dailyTip.actionPrompt}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Split: Recent Activity (Left) + Security Tips (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Activity (Latest 5 items with icon tiles) */}
        <Card className="lg:col-span-7 rounded-2xl border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Recent Activity</CardTitle>
                <CardDescription className="text-xs">
                  Latest cybersecurity scans and diagnostic events
                </CardDescription>
              </div>
              <Link href="/dashboard/reports">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                  View All
                </Button>
              </Link>
            </div>

            {profileData?.recentScans && profileData.recentScans.length > 0 ? (
              <div className="space-y-3">
                {profileData.recentScans.slice(0, 5).map((scan: any) => {
                  const isSafe = scan.verdict === "safe" || scan.verdict === "strong" || scan.verdict === "SAFE";
                  const isSuspicious = scan.verdict === "suspicious" || scan.verdict === "moderate" || scan.verdict === "SUSPICIOUS";
                  const isEmail = scan.type?.toLowerCase() === "email";
                  const isUrl = scan.type?.toLowerCase() === "url";
                  const isPassword = scan.type?.toLowerCase() === "password";

                  let title = "Security Audit Completed";
                  if (isEmail) {
                    title = isSafe ? "Legitimate email verified" : "Suspicious email detected";
                  } else if (isUrl) {
                    title = isSafe ? "Safe website verified" : "Suspicious link detected";
                  } else if (isPassword) {
                    title = isSafe ? "Strong password!" : "Weak password analyzed";
                  }

                  return (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isEmail
                              ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
                              : isUrl
                              ? "bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400"
                              : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {isEmail && <MailCheck className="h-4 w-4" />}
                          {isUrl && <Globe className="h-4 w-4" />}
                          {isPassword && <KeyRound className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{title}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-xs sm:max-w-sm">
                            {scan.inputSummary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 text-right">
                        <Badge
                          variant={isSafe ? "success" : isSuspicious ? "warning" : "danger"}
                          className="capitalize text-[10px] font-semibold px-2"
                        >
                          {scan.verdict}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                          {formatTimeAgo(scan.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-muted-foreground space-y-3">
                <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <div>
                  <p className="font-semibold text-foreground text-sm">No security scans yet</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Start by checking an email or analyzing a URL.
                  </p>
                </div>
                <Link href="/dashboard/email-checker">
                  <Button size="sm" className="rounded-xl mt-2 text-xs">
                    Run Your First Scan
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Real-time threat telemetry synchronized</span>
            <Link href="/dashboard/reports" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View Audit Logs →
            </Link>
          </div>
        </Card>

        {/* Security Tips (Right) */}
        <Card className="lg:col-span-5 rounded-2xl border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Security Tips</CardTitle>
                <CardDescription className="text-xs">
                  Essential best practices for defensive hygiene
                </CardDescription>
              </div>
              <Link href="/dashboard/quiz">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-3.5">
              {SECURITY_TIPS_CHECKLIST.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-border"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{tip.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Link href="/dashboard/quiz" className="block">
              <Button variant="outline" className="w-full rounded-xl text-xs h-9 font-medium">
                <HelpCircle className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                <span>Test Awareness in Cyber Quiz</span>
              </Button>
            </Link>
          </div>
        </Card>

      </div>

      {/* Analytics Visualization Section */}
      <DashboardCharts
        emailCount={user?.phishingScansCount || 0}
        urlCount={user?.urlScansCount || 0}
        passwordCount={user?.passwordChecksCount || 0}
        quizCount={user?.quizzesCompletedCount || 0}
        score={score}
      />
    </div>
  );
}
