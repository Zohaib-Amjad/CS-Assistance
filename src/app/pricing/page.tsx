import React from "react";
import Link from "next/link";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicNav />

      <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-16 flex-1">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="cyber" className="px-3 py-1 font-semibold">
            Transparent Access
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Simple, Transparent Plans for Every Learner
          </h1>
          <p className="text-muted-foreground text-lg">
            Free forever for students, security learners, and open-source practitioners.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Free Tier */}
          <Card className="rounded-2xl border-border bg-card flex flex-col justify-between">
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2">Community</Badge>
              <CardTitle className="text-2xl">Student & Learner</CardTitle>
              <CardDescription>Essential security tools for individual awareness.</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-extrabold text-foreground">$0</span>
                <span className="text-xs text-muted-foreground ml-1">/ forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Unlimited Phishing Email Scans</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> SSRF-Safe URL Inspections</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Client-Side Password Entropy Audits</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 10 AI Assistant Queries/Day</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cyber Awareness Quizzes & Badges</div>
            </CardContent>
            <CardFooter>
              <Link href="/signup" className="w-full">
                <Button variant="outline" className="w-full rounded-xl">Get Started Free</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Tier (Featured) */}
          <Card className="rounded-2xl border-indigo-400 dark:border-indigo-600 bg-card relative shadow-xl shadow-indigo-500/10 flex flex-col justify-between scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-indigo-600 text-white font-bold px-3 py-1 shadow-sm">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <Badge variant="cyber" className="w-fit mb-2">Professional</Badge>
              <CardTitle className="text-2xl">Security Pro</CardTitle>
              <CardDescription>Advanced threat intelligence and PDF report exports.</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-extrabold text-foreground">$9</span>
                <span className="text-xs text-muted-foreground ml-1">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Everything in Student Tier</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Unlimited AI Assistant Sessions</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Downloadable Signed PDF Audit Reports</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Google Safe Browsing Integration</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Priority SOC Response</div>
            </CardContent>
            <CardFooter>
              <Link href="/signup" className="w-full">
                <Button className="w-full rounded-xl shadow-md shadow-indigo-500/25">Upgrade to Pro</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Enterprise Tier */}
          <Card className="rounded-2xl border-border bg-card flex flex-col justify-between">
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2">Academic / Org</Badge>
              <CardTitle className="text-2xl">Team & Campus</CardTitle>
              <CardDescription>Dedicated workspace telemetry and custom quiz manager.</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-extrabold text-foreground">$29</span>
                <span className="text-xs text-muted-foreground ml-1">/ seat / mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Everything in Security Pro</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Admin Console & User Role Management</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Custom Quiz Creation & Leaderboards</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Full Audit Log Export</div>
            </CardContent>
            <CardFooter>
              <Link href="/contact" className="w-full">
                <Button variant="outline" className="w-full rounded-xl">Contact Campus Sales</Button>
              </Link>
            </CardFooter>
          </Card>

        </div>
      </div>

      <Footer />
    </div>
  );
}
