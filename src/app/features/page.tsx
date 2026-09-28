import React from "react";
import Link from "next/link";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MailCheck,
  Globe,
  KeyRound,
  BotMessageSquare,
  HelpCircle,
  FileBarChart,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Features | CyberGuard AI",
  description:
    "Explore CyberGuard AI's 8 core defensive capabilities: AI phishing detection, SSRF-safe URL scanning, password auditing, quizzes, reports, and more.",
};

const FEATURES_LIST = [
  {
    title: "Phishing Email Analyzer",
    subtitle: "Social Engineering & Header Inspection",
    description:
      "Inspect plain text, headers, and attachments for psychological urgency, forged display names, lookalike cousin domains, and credential harvesting forms.",
    icon: MailCheck,
    href: "/dashboard/email-checker",
    badge: "AI Powered",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/50",
    border: "hover:border-indigo-400 dark:hover:border-indigo-600",
    highlights: ["0-100 Threat score", "Urgency phrasing detection", "Immediate mitigation tips"],
  },
  {
    title: "SSRF-Protected URL Scanner",
    subtitle: "Safe Hostname & DNS Resolution",
    description:
      "Inspect web links safely. Blocks internal RFC1918 subnets, loopbacks (127.0.0.1), and cloud metadata (169.254.169.254) to eliminate SSRF risks while checking typosquatting.",
    icon: Globe,
    href: "/dashboard/url-checker",
    badge: "SSRF Safe",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    border: "hover:border-blue-400 dark:hover:border-blue-600",
    highlights: ["Typosquatting detection", "SSL validity verification", "A/AAAA DNS analysis"],
  },
  {
    title: "Zero-Knowledge Password Auditor",
    subtitle: "Client-Side Entropy & Breach Audit",
    description:
      "Calculates Shannon entropy, dictionary penalties, and GPU brute-force crack times entirely in-browser. Connects to HaveIBeenPwned via 5-char SHA-1 k-anonymity.",
    icon: KeyRound,
    href: "/dashboard/password-checker",
    badge: "Zero Leakage",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    border: "hover:border-emerald-400 dark:hover:border-emerald-600",
    highlights: ["100% in-browser evaluation", "k-Anonymity breach lookup", "Strength recommendations"],
  },
  {
    title: "Defensive AI Cyber Assistant",
    subtitle: "Guardrailed Cybersecurity Tutor",
    description:
      "Multi-provider LLM assistant with defensive safety guardrails. Answers incident recovery questions, explains attack mechanisms, and rejects exploit creation.",
    icon: BotMessageSquare,
    href: "/dashboard/assistant",
    badge: "Guardrailed AI",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/50",
    border: "hover:border-violet-400 dark:hover:border-violet-600",
    highlights: ["Suggested follow-up prompts", "Defensive safety refusal", "Conversation persistence"],
  },
  {
    title: "Cyber Awareness Quizzes",
    subtitle: "Gamified Training & Assessments",
    description:
      "Sharpen your instincts with 60+ scenario questions across Phishing, Password Hygiene, Safe Browsing, and Social Engineering with instant explanations.",
    icon: HelpCircle,
    href: "/dashboard/quiz",
    badge: "Gamified",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "hover:border-amber-400 dark:hover:border-amber-600",
    highlights: ["Timed challenges", "Confetti celebration", "Detailed answer rationales"],
  },
  {
    title: "Audit Reports & PDF Export",
    subtitle: "Downloadable Signed Security Summaries",
    description:
      "Filter past scan telemetry by date and category. Export branded, tamper-evident PDF cybersecurity health audits via client-side jsPDF rendering.",
    icon: FileBarChart,
    href: "/dashboard/reports",
    badge: "PDF Export",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    border: "hover:border-rose-400 dark:hover:border-rose-600",
    highlights: ["Client-side PDF generation", "Interactive Recharts telemetry", "CSV & JSON export"],
  },
  {
    title: "Profile, Badges & Streaks",
    subtitle: "Achievement Progression System",
    description:
      "Track daily security check streaks, unlock achievement badges for proactive defense, and monitor overall security posture progression.",
    icon: UserCheck,
    href: "/dashboard/profile",
    badge: "Badges",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/50",
    border: "hover:border-purple-400 dark:hover:border-purple-600",
    highlights: ["10+ Unlockable badges", "Daily defense streak counter", "Security score gauge"],
  },
  {
    title: "Enterprise Admin Intelligence",
    subtitle: "Centralized User & Telemetry Management",
    description:
      "Complete visibility into registered users, aggregated threat scan logs, blocked domains management, and platform audit trails.",
    icon: ShieldAlert,
    href: "/admin",
    badge: "Admin Only",
    color: "text-slate-800 dark:text-slate-200",
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "hover:border-slate-400 dark:hover:border-slate-500",
    highlights: ["User status toggles", "Threat log filtering", "Curriculum question manager"],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicNav />

      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16 flex-1">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="cyber" className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            Platform Capabilities
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Architected for Modern Defensive Security
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            CyberGuard AI provides 8 production-grade modules for automated threat detection, educational awareness, and verifiable risk auditing.
          </p>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_LIST.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card
                key={feat.title}
                className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between ${feat.border}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feat.bg} ${feat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {feat.title}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {feat.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {feat.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Button asChild variant="outline" className="w-full rounded-xl text-xs font-bold gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Link href={feat.href}>
                      <span>Explore Tool</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-8">
          <Button asChild size="lg" className="rounded-xl px-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-500/25">
            <Link href="/signup">Try All Features Free</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
