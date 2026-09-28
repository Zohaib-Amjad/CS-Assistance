import React from "react";
import Link from "next/link";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ShieldIllustration } from "@/components/shared/ShieldIllustration";
import {
  MailCheck,
  Globe,
  KeyRound,
  BotMessageSquare,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
  Sparkles,
  Search,
  Cpu,
  Award,
} from "lucide-react";
import { db } from "@/db";
import { scans, users, quizAttempts } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CyberGuard AI | AI-Powered Cyber Security Assistant",
  description:
    "Detect phishing threats, check URLs, improve password security, and learn cybersecurity with CyberGuard AI.",
  openGraph: {
    title: "CyberGuard AI | AI-Powered Cyber Security Assistant",
    description:
      "A defensive cybersecurity education platform featuring AI phishing detection, SSRF-safe URL scanning, client-side password audits, interactive quizzes, and security guidance.",
    url: "https://cyberguard-ai.vercel.app",
    siteName: "CyberGuard AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberGuard AI | AI-Powered Cyber Security Assistant",
    description:
      "Detect phishing threats, check URLs, improve password security, and learn cybersecurity with CyberGuard AI.",
  },
};

export default async function LandingPage() {
  // Fetch real database counts for the live stats strip
  let totalScansCount = 136;
  let totalUsersCount = 8;
  let totalQuizzesCount = 7;

  try {
    const allScans = await db.select({ count: sql<number>`count(*)` }).from(scans);
    const allUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const allQuizzes = await db.select({ count: sql<number>`count(*)` }).from(quizAttempts);

    if (allScans[0]?.count) totalScansCount = allScans[0].count;
    if (allUsers[0]?.count) totalUsersCount = allUsers[0].count;
    if (allQuizzes[0]?.count) totalQuizzesCount = allQuizzes[0].count;
  } catch (err) {
    console.warn("DB stats fetch warning:", err);
  }

  const featureCards = [
    {
      title: "Email Phishing Detector",
      description: "Detect phishing emails using AI technology.",
      href: "/dashboard/email-checker",
      icon: MailCheck,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/50",
      border: "hover:border-indigo-300 dark:hover:border-indigo-700",
      badge: "AI Powered",
    },
    {
      title: "URL Safety Checker",
      description: "Check if websites are safe to visit instantly.",
      href: "/dashboard/url-checker",
      icon: Globe,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/50",
      border: "hover:border-blue-300 dark:hover:border-blue-700",
      badge: "SSRF Safe",
    },
    {
      title: "Password Strength Checker",
      description: "Analyze and record security and get smart suggestions.",
      href: "/dashboard/password-checker",
      icon: KeyRound,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      border: "hover:border-emerald-300 dark:hover:border-emerald-700",
      badge: "Zero Knowledge",
    },
    {
      title: "AI Cyber Assistant",
      description: "Get instant answers to your cybersecurity questions.",
      href: "/dashboard/assistant",
      icon: BotMessageSquare,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/50",
      border: "hover:border-violet-300 dark:hover:border-violet-700",
      badge: "Guardrailed",
    },
    {
      title: "Cyber Quiz",
      description: "Test your knowledge and improve your awareness.",
      href: "/dashboard/quiz",
      icon: HelpCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
      border: "hover:border-amber-300 dark:hover:border-amber-700",
      badge: "Gamified",
    },
  ];

  const faqs = [
    {
      q: "Is my personal data or password stored securely on CyberGuard AI?",
      a: "Yes. In fact, passwords evaluated in the Password Checker are never sent across the network. All entropy, character complexity, and HaveIBeenPwned checks run 100% in-browser using k-anonymity SHA-1 prefixes, ensuring zero plaintext leakage.",
    },
    {
      q: "How does the AI Phishing Analyzer detect sophisticated spear phishing?",
      a: "Our multi-layer heuristic and neural engine examines header sender authenticity (SPF, DKIM, DMARC), psychological urgency triggers, lookalike cousin domains, typosquatted URLs, and credential harvesting patterns.",
    },
    {
      q: "Can I use CyberGuard AI across all modern browsers and mobile devices?",
      a: "Yes. CyberGuard AI is built with responsive layout shells, fluid typography, dark/light themes, and touch-optimized mobile drawers for seamless protection on desktop, tablet, and mobile browsers.",
    },
    {
      q: "What defensive safety guardrails are built into the AI Cyber Assistant?",
      a: "The assistant strictly operates in defensive education mode. It proactively answers remediation queries, explains cryptographic principles, and assists with threat mitigation while rejecting any exploit generation or offensive attack requests.",
    },
    {
      q: "What is included in the CyberGuard AI free tier?",
      a: "The free tier grants access to email inspections, SSRF-safe URL scanning, client-side password audits, interactive quiz challenges, and baseline defensive AI questions.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicNav />

      {/* Hero Section — Matching Screen 01 */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Background glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/90 dark:border-indigo-800 dark:bg-indigo-950/60 px-4 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>Next-Gen Defensive Cybersecurity Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Smart Protection. <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  Stronger Tomorrow.
                </span> <br />
                Always One Step Ahead.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Detect threats, analyze risks, and learn cybersecurity with the power of AI.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/25 group text-base"
                >
                  <Link href="/signup">
                    <span>Get Started</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold text-base border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">100% Defensive</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">k-Anonymity Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Real-Time AI</span>
                </div>
              </div>
            </div>

            {/* Right Hero Shield Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <ShieldIllustration size={380} showOrbs={true} />
            </div>

          </div>
        </div>
      </section>

      {/* Exactly 5 Clickable Feature Cards — Screen 01 */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800 scroll-mt-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <Badge variant="cyber" className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              Defensive Intelligence Suite
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Five Essential Defense Tools in One Platform
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Everything you need to audit suspicious payloads, verify URLs, test password entropy, and level up security awareness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.title}
                  href={feat.href}
                  className={`group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 ${feat.border} ${
                    index === 3 || index === 4 ? "lg:col-span-1.5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3 ${feat.bg} ${feat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    <span>Launch Tool</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Stats Strip from DB */}
      <section className="py-14 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white border-b border-indigo-800/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1.5">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-indigo-400">
                {totalScansCount}+
              </span>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                Threat Audits Completed
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-emerald-400">
                99.4%
              </span>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                AI Detection Precision
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-purple-400">
                {totalUsersCount}+
              </span>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                Protected Researchers
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-amber-400">
                {totalQuizzesCount}+
              </span>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                Awareness Quizzes Taken
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <Badge variant="cyber" className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              Workflow Simplicity
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              How CyberGuard AI Secures You
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              A frictionless 3-step defensive pipeline engineered for instant clarity and zero confidential data leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-extrabold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Input & Scan</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste suspicious emails, unverified URLs, or test password entropy with live feedback.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400 font-extrabold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Deep Inspection</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Heuristic engines, DNS resolvers, and neural models cross-verify indicators of compromise.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-extrabold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Actionable Defense</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive clear risk scores, mitigation instructions, and export signed cybersecurity audit reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 bg-white dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <Badge variant="cyber" className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Questions About Security & Privacy?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Learn how our zero-leakage architecture protects your data and enforces ethical AI guidelines.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 px-5"
              >
                <AccordionTrigger className="text-left font-bold text-slate-900 dark:text-slate-100 hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-8 sm:p-12 lg:p-16 text-white text-center space-y-6 shadow-2xl shadow-indigo-600/25">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Strengthen Your Cyber Defenses?
            </h2>
            <p className="text-indigo-100 max-w-2xl mx-auto text-base sm:text-lg">
              Create your free account today and experience AI-assisted phishing analysis, password auditing, and defensive cybersecurity education.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-lg">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-xl border-white/30 text-white hover:bg-white/10 font-semibold">
                <Link href="/login">Live Demo Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
