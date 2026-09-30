"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        if (data.devResetUrl) {
          setDevResetUrl(data.devResetUrl);
        }
        toast.success("Password recovery link generated!");
      } else {
        toast.error(data.error?.message || "Failed to process request.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mb-6">
        <Logo size="lg" href="/" />
      </div>

      <Card className="w-full max-w-md rounded-2xl border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-slate-900/90 shadow-2xl backdrop-blur-md p-2 sm:p-4">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Password Recovery
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            Enter your account email to receive a secure recovery token
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                If an account exists for <strong>{email}</strong>, a recovery link has been prepared.
              </p>

              {devResetUrl && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-left space-y-2">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                    ⚡ Dev Fast Reset Link:
                  </span>
                  <Link href={devResetUrl} className="block text-xs font-mono text-indigo-600 dark:text-indigo-400 break-all underline">
                    {devResetUrl}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Account Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    className="pl-10 rounded-xl h-11 border-slate-200 dark:border-slate-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-md shadow-indigo-500/20"
              >
                {loading ? "Verifying..." : "Send Recovery Link"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-4">
          <Link href="/login" className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
