"use client";

import React from "react";
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
  const barData = [
    { name: "Phishing", scans: emailCount, fill: "#4F46E5" },
    { name: "URL Safe", scans: urlCount, fill: "#2563EB" },
    { name: "Password", scans: passwordCount, fill: "#16A34A" },
    { name: "Quizzes", scans: quizCount, fill: "#F59E0B" },
  ];

  const pieData = [
    { name: "Phishing Scans", value: Math.max(1, emailCount), color: "#4F46E5" },
    { name: "URL Scans", value: Math.max(1, urlCount), color: "#2563EB" },
    { name: "Password Audits", value: Math.max(1, passwordCount), color: "#16A34A" },
    { name: "Quiz Attempts", value: Math.max(1, quizCount), color: "#F59E0B" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Activity Volume Bar Chart */}
      <Card className="lg:col-span-7 rounded-2xl border-border bg-card p-6 shadow-xs">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-bold">Diagnostic Activity Distribution</CardTitle>
          <CardDescription className="text-xs">Count of completed security evaluations across modules</CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "12px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="scans" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Threat Posture Donut Chart */}
      <Card className="lg:col-span-5 rounded-2xl border-border bg-card p-6 shadow-xs">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-bold">Module Coverage Proportion</CardTitle>
          <CardDescription className="text-xs">Relative frequency of defense inspections</CardDescription>
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
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "12px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
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
