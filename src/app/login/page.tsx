"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (res?.error) {
        if (res.error.includes("10 minutes") || res.error.includes("Too many")) {
          setErrorMsg("Too many failed login attempts. Please wait 10 minutes.");
          toast.error("Account locked for 10 minutes due to consecutive failed attempts.");
        } else if (res.error.includes("suspended") || res.error.includes("deactivated")) {
          setErrorMsg("Your account has been deactivated or suspended.");
          toast.error("Account inactive or suspended. Contact support.");
        } else {
          setErrorMsg("Invalid email or password. Please try again.");
          toast.error("Authentication failed. Please check your credentials.");
        }
      } else {
        toast.success("Welcome back to CyberGuard AI!");
        if (email.toLowerCase().includes("admin")) {
          router.push("/admin");
        } else {
          router.push(callbackUrl);
        }
        router.refresh();
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const autofill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMsg("");
    toast.info(`Filled credentials for ${fillEmail}`);
  };

  const handleOAuth = (provider: string) => {
    if (provider === "google") {
      signIn("google", { callbackUrl });
    } else {
      toast.info(`${provider} OAuth authentication is disabled in this environment.`);
    }
  };

  return (
    <Card className="w-full max-w-md rounded-2xl border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-slate-900/90 shadow-2xl backdrop-blur-md p-2 sm:p-4">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome Back! 👋
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
          Login to access your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Inline error */}
        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                className="pl-10 rounded-xl h-11 border-slate-200 dark:border-slate-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="pl-10 pr-10 rounded-xl h-11 border-slate-200 dark:border-slate-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(c) => setRememberMe(!!c)}
            />
            <label
              htmlFor="remember"
              className="text-xs font-medium leading-none text-slate-600 dark:text-slate-400 cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>

          {/* Gradient Log In button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all gap-2"
          >
            {loading ? "Logging in..." : (
              <>
                <span>Log In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Quick Demo Autofill Pills */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 mt-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>1-Click Demo Accounts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => autofill("admin@cyberguard.ai", "admin123")}
              className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 text-xs font-semibold hover:bg-violet-100 transition-colors border border-violet-200 dark:border-violet-800"
            >
              Admin Demo (admin@cyberguard.ai)
            </button>
            <button
              type="button"
              onClick={() => autofill("user@cyberguard.ai", "user123")}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              User Demo (user@cyberguard.ai)
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400">
        Don't have an account?{" "}
        <Link href="/signup" className="ml-1 text-indigo-600 font-bold hover:underline dark:text-indigo-400">
          Sign Up
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="mb-6">
        <Logo size="lg" href="/" />
      </div>

      <Suspense fallback={<div className="text-xs text-slate-400">Loading secure portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
