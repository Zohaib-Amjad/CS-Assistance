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

        {/* Social login buttons */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 absolute">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("google")}
              className="rounded-xl h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("Microsoft")}
              className="rounded-xl h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("Apple")}
              className="rounded-xl h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <svg className="h-4 w-4 fill-current text-slate-800 dark:text-slate-100" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.71-14.24-6.19-9.76-11.13-20.91-14.81-33.45-3.69-12.53-5.54-24.27-5.54-35.22 0-14.28 3.59-25.75 10.77-34.42 7.18-8.67 16.29-13.11 27.33-13.32 4.58 0 9.87 1.25 15.86 3.76 6 2.5 10.02 3.81 12.06 3.91 1.7 0 5.92-1.37 12.65-4.12 6.74-2.74 12.71-3.95 17.91-3.62 14.15.82 25.12 5.93 32.92 15.34-11.59 7.03-17.29 16.59-17.08 28.67.21 9.42 3.86 17.27 10.95 23.54 7.08 6.28 15.54 9.94 25.38 10.99-2.54 7.82-5.71 15.54-9.52 23.16zM119.22 33.15c0-7.39 2.65-14.39 7.94-21.01 5.3-6.62 11.95-10.99 19.96-13.11-.21 1.29-.32 2.37-.32 3.24 0 7.39-2.77 14.44-8.31 21.15-5.54 6.71-12.45 10.95-20.73 12.72-.1-1-.15-1.99-.15-2.99z"/>
              </svg>
            </Button>
          </div>
        </div>

        {/* Quick Demo Autofill Pills */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
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
