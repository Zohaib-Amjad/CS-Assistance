"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MailCheck, Globe, KeyRound, HelpCircle, ArrowRight } from "lucide-react";

interface DashboardChartsProps {
  emailCount: number;
  urlCount: number;
  passwordCount: number;
  quizCount: number;
  score: number;
}

export function DashboardCharts({
  emailCount,
  urlCount,
  passwordCount,
  quizCount,
  score,
}: DashboardChartsProps) {
  const totalActivity = emailCount + urlCount + passwordCount + quizCount;

  const barData = [
    { name: "Phishing", scans: emailCount, fill: "#4F46E5", label: "Email Scans" },
    { name: "URL Safe", scans: urlCount, fill: "#2563EB", label: "URL Checks" },
    { name: "Password", scans: passwordCount, fill: "#10B981", label: "Password Audits" },
    { name: "Quizzes", scans: quizCount, fill: "#F59E0B", label: "Quiz Attempts" },
  ];

  const pieData = [
    { name: "Phishing Scans", value: Math.max(emailCount, totalActivity === 0 ? 1 : 0), color: "#4F46E5" },
    { name: "URL Scans", value: Math.max(urlCount, totalActivity === 0 ? 1 : 0), color: "#2563EB" },
    { name: "Password Audits", value: Math.max(passwordCount, totalActivity === 0 ? 1 : 0), color: "#10B981" },
    { name: "Quiz Attempts", value: Math.max(quizCount, totalActivity === 0 ? 1 : 0), color: "#F59E0B" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Activity Volume Bar Chart */}
      <Card className="lg:col-span-7 rounded-2xl border-border bg-card p-6 shadow-xs flex flex-col justify-between">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground">Diagnostic Activity Distribution</CardTitle>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {totalActivity} Total Scans
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Count of completed security evaluations across modules
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0 h-64 relative">
          {totalActivity === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/60 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No diagnostic scans logged yet for this account.
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                Run an email phishing check or password audit to start populating your telemetry.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Link
                  href="/dashboard/email-checker"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <MailCheck className="h-3.5 w-3.5" />
                  <span>Scan Email</span>
                </Link>
                <Link
                  href="/dashboard/password-checker"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground text-xs font-semibold transition-all"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Audit Password</span>
                </Link>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(79, 70, 229, 0.06)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-slate-900 text-white p-2.5 shadow-xl border border-slate-800 text-xs space-y-1">
                          <p className="font-bold text-slate-200">{data.label}</p>
                          <p className="text-indigo-400 font-semibold">{data.scans} Completed</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="scans" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Threat Posture Donut Chart */}
      <Card className="lg:col-span-5 rounded-2xl border-border bg-card p-6 shadow-xs flex flex-col justify-between">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-bold text-foreground">Module Coverage Proportion</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Relative frequency of defense inspections</CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-64 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl bg-slate-900 text-white p-2.5 shadow-xl border border-slate-800 text-xs">
                        <p className="font-bold text-slate-200">{data.name}</p>
                        <p className="text-indigo-400 font-semibold">{totalActivity === 0 ? "0 scans" : `${data.value} scans`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-foreground">{score}%</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Resilience</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

