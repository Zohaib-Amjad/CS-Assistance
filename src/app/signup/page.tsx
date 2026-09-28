"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, User, Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/shared/Logo";
import { evaluatePasswordStrength } from "@/lib/detection/password";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const pwdAnalysis = useMemo(() => evaluatePasswordStrength(password), [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (name.trim().length < 2) {
      setErrorMsg("Full name must be at least 2 characters.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.error?.message || "Failed to create account.";
        setErrorMsg(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! Signing you in...");

      // Automatically sign in with credentials
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMsg("An error occurred during registration. Please try again.");
      toast.error("An error occurred during registration.");
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (pwdAnalysis.score) {
      case 4:
        return "bg-emerald-500";
      case 3:
        return "bg-indigo-500";
      case 2:
        return "bg-amber-500";
      default:
        return "bg-rose-500";
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="mb-6">
        <Logo size="lg" href="/" />
      </div>

      <Card className="w-full max-w-md rounded-2xl border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-slate-900/90 shadow-2xl backdrop-blur-md p-2 sm:p-4">
        <CardHeader className="space-y-1.5 text-center">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create New Account
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            Join us to get started.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Inline error */}
          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  required
                  placeholder="Enter your full name"
                  className="pl-10 rounded-xl h-11 border-slate-200 dark:border-slate-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a password"
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

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Strength:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{pwdAnalysis.label}</span>
                  </div>
                  <Progress
                    value={pwdAnalysis.percentage}
                    indicatorClassName={getStrengthColor()}
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                    <div className="flex items-center gap-1.5">
                      {pwdAnalysis.hasMinLength ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-rose-500" />
                      )}
                      <span className={pwdAnalysis.hasMinLength ? "text-slate-700 dark:text-slate-200 font-medium" : "text-slate-400"}>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pwdAnalysis.hasUppercase && pwdAnalysis.hasLowercase ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-rose-500" />
                      )}
                      <span className={pwdAnalysis.hasUppercase && pwdAnalysis.hasLowercase ? "text-slate-700 dark:text-slate-200 font-medium" : "text-slate-400"}>Upper & lower case</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pwdAnalysis.hasNumbers ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-rose-500" />
                      )}
                      <span className={pwdAnalysis.hasNumbers ? "text-slate-700 dark:text-slate-200 font-medium" : "text-slate-400"}>Numbers (0-9)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pwdAnalysis.hasSymbols ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-rose-500" />
                      )}
                      <span className={pwdAnalysis.hasSymbols ? "text-slate-700 dark:text-slate-200 font-medium" : "text-slate-400"}>Symbols (!@#$)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Re-enter your password"
                  className="pl-10 pr-10 rounded-xl h-11 border-slate-200 dark:border-slate-800"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all gap-2"
            >
              {loading ? "Creating account..." : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="ml-1 text-indigo-600 font-bold hover:underline dark:text-indigo-400">
            Log In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
