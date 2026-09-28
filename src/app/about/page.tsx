import React from "react";
import Link from "next/link";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Target, Award, Heart, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicNav />

      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-16 flex-1">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="cyber" className="px-3 py-1 font-semibold">
            About CyberGuard AI
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Democratizing Cybersecurity Education & Defensive Awareness
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            CyberGuard AI was conceived as an advanced Final Year Project to bridge the gap between complex enterprise security concepts and everyday digital awareness.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-2xl border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Our Mission</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To equip individuals and teams with practical, zero-friction diagnostic tools that build genuine cybersecurity resilience without overwhelming technical jargon.
            </p>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Defensive AI Core</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We uphold strict ethical AI guidelines: our models analyze and explain defensive controls while actively refusing offensive exploitation generation.
            </p>
          </Card>
        </div>

        {/* Project Highlights */}
        <div className="rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/40 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Final Year Project Core Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Full-Stack Modern Architecture:</strong>
                <p className="text-muted-foreground text-xs mt-0.5">Next.js App Router, SQLite/LibSQL with Drizzle ORM, and Auth.js v5.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Privacy-Preserving Auditing:</strong>
                <p className="text-muted-foreground text-xs mt-0.5">Client-side password hashing and k-anonymity breach checking with zero plaintext transmission.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">SSRF-Protected URL Verification:</strong>
                <p className="text-muted-foreground text-xs mt-0.5">Strict DNS resolution and network boundary filtering protecting against cloud metadata leakage.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Interactive Gamified Education:</strong>
                <p className="text-muted-foreground text-xs mt-0.5">Dynamic quizzes, achievement badges, and exportable PDF audit summaries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
