"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Check,
  X,
  Lock,
  Clock,
  Zap,
  Save,
  Copy,
  CheckCircle2,
  SlidersHorizontal,
  Circle,
} from "lucide-react";
import {
  evaluatePasswordStrength,
  checkPwnedPasswordClient,
  generateSecurePassword,
  generatePassphrase,
} from "@/lib/detection/password";
import { GreenShieldIllustration } from "@/components/shared/GreenShieldIllustration";

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [breachChecking, setBreachChecking] = useState(false);
  const [breachResult, setBreachResult] = useState<{ checked: boolean; breached: boolean; count: number }>({
    checked: false,
    breached: false,
    count: 0,
  });
  const [savingAudit, setSavingAudit] = useState(false);

  // Generator Options
  const [genMode, setGenMode] = useState<"chars" | "passphrase">("chars");
  const [genLength, setGenLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [passphraseWords, setPassphraseWords] = useState(4);

  // 100% Client-side evaluation (0ms latency, zero network leakage)
  const analysis = useMemo(() => evaluatePasswordStrength(password), [password]);

  // HIBP k-Anonymity breach check
  const checkBreach = async () => {
    if (!password) {
      toast.error("Please enter a password first.");
      return;
    }

    setBreachChecking(true);
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha1Hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      const res = await checkPwnedPasswordClient(sha1Hash);
      setBreachResult({
        checked: true,
        breached: res.breached,
        count: res.count,
      });

      if (res.breached) {
        toast.error(`Warning: This password was found in ${res.count.toLocaleString()} known data breaches!`);
      } else {
        toast.success("Safe! Zero occurrences found in known breach registries.");
      }
    } catch {
      toast.error("Failed to query breach database.");
    } finally {
      setBreachChecking(false);
    }
  };

  const handleGenerate = () => {
    if (genMode === "passphrase") {
      const p = generatePassphrase(passphraseWords);
      setPassword(p);
      setBreachResult({ checked: false, breached: false, count: 0 });
      toast.info(`Generated ${passphraseWords}-word multi-token passphrase.`);
    } else {
      const p = generateSecurePassword({
        length: genLength,
        useUpper,
        useLower,
        useNumbers,
        useSymbols,
      });
      setPassword(p);
      setBreachResult({ checked: false, breached: false, count: 0 });
      toast.info(`Generated ${genLength}-character resilient password.`);
    }
  };

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard.");
  };

  const saveAuditScore = async () => {
    if (!password) return;
    setSavingAudit(true);

    try {
      const verdict = analysis.score >= 70 ? "strong" : analysis.score >= 40 ? "moderate" : "weak";
      const res = await fetch("/api/scan/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: `Password Audit (Length: ${password.length} chars, Entropy: ${analysis.entropyBits} bits)`,
          score: analysis.score,
          verdict,
          threatIndicators: breachResult.breached
            ? [`Present in ${breachResult.count.toLocaleString()} breached databases`, `Entropy: ${analysis.entropyBits} bits`]
            : [`Entropy: ${analysis.entropyBits} bits`, `Crack time: ${analysis.crackTimeDisplay}`],
          details: {
            score: analysis.score,
            label: analysis.label,
            entropyBits: analysis.entropyBits,
            crackTimeDisplay: analysis.crackTimeDisplay,
            breached: breachResult.breached,
            breachCount: breachResult.count,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Password hygiene score updated in your security score!");
      } else {
        toast.error("Failed to log score.");
      }
    } catch {
      toast.error("An error occurred while saving audit score.");
    } finally {
      setSavingAudit(false);
    }
  };

  const isStrong = Boolean(password) && (analysis.score >= 75 || analysis.label === "Strong" || analysis.label === "Very Strong");
  const hasStarted = Boolean(password && password.length > 0);

  // Segmented meter active blocks (1 to 5)
  const getSegmentCount = () => {
    if (!password) return 0;
    switch (analysis.label) {
      case "Very Weak":
        return 1;
      case "Weak":
        return 2;
      case "Fair":
        return 3;
      case "Strong":
        return 4;
      case "Very Strong":
        return 5;
    }
  };

  const activeSegments = getSegmentCount();

  return (
    <div className="space-y-6">
      {/* Header Banner (Screen 7) */}
      <Card className="rounded-2xl border-border bg-gradient-to-r from-card via-card to-emerald-50/30 dark:to-emerald-950/20 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="cyber" className="text-xs px-2 py-0.5">
                100% Client-Side
              </Badge>
              <Badge variant="outline" className="text-xs">
                Zero Plaintext Transmission
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Password Strength Checker
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Enter a password to check its strength. Analyze Shannon entropy, brute-force cracking resistance, and check against breach registries using privacy-preserving k-anonymity.
            </p>
          </div>

          {isStrong && (
            <div className="hidden md:flex shrink-0 animate-in zoom-in-50 duration-300">
              <GreenShieldIllustration size={110} />
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Password Input, Segmented Meter, Breach Check */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-5">
            
            {/* Input Field */}
            <div className="space-y-1.5">
              <Label htmlFor="passInput" className="text-xs font-semibold">
                Password or Passphrase
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passInput"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter or paste a password to analyze..."
                  className="pl-10 pr-24 rounded-xl text-sm font-mono h-11"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setBreachResult({ checked: false, breached: false, count: 0 });
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {password && (
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title="Copy"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Segmented Color Meter (Screen 7 Specification) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Password Strength</span>
                <span className={`font-bold ${
                  activeSegments >= 4 ? "text-emerald-600 dark:text-emerald-400" :
                  activeSegments === 3 ? "text-amber-500" :
                  activeSegments === 2 ? "text-orange-500" :
                  password ? "text-rose-500" : "text-muted-foreground"
                }`}>
                  {password ? analysis.label : "Enter password"}
                </span>
              </div>

              {/* 5 Segmented Color Blocks */}
              <div className="grid grid-cols-5 gap-1.5 h-2.5">
                <div
                  className={`rounded-full transition-colors ${
                    activeSegments >= 1 ? "bg-rose-500" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
                <div
                  className={`rounded-full transition-colors ${
                    activeSegments >= 2 ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
                <div
                  className={`rounded-full transition-colors ${
                    activeSegments >= 3 ? "bg-amber-400" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
                <div
                  className={`rounded-full transition-colors ${
                    activeSegments >= 4 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
                <div
                  className={`rounded-full transition-colors ${
                    activeSegments >= 5 ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              </div>
            </div>

            {/* Actions: Breach Check & Log Score */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={checkBreach}
                disabled={!password || breachChecking}
                variant="outline"
                className="rounded-xl text-xs h-10 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                {breachChecking ? "Checking HIBP..." : "Check Data Breaches (k-Anonymity)"}
              </Button>

              <Button
                type="button"
                onClick={saveAuditScore}
                disabled={!password || savingAudit}
                className="rounded-xl text-xs h-10 shadow-sm"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {savingAudit ? "Logging..." : "Log Security Score"}
              </Button>
            </div>
          </Card>

          {/* Secure Password Generator Tool */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                <CardTitle className="text-sm font-bold">Secure Password Generator</CardTitle>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setGenMode("chars")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    genMode === "chars" ? "bg-white dark:bg-slate-900 text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  Characters
                </button>
                <button
                  type="button"
                  onClick={() => setGenMode("passphrase")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    genMode === "passphrase" ? "bg-white dark:bg-slate-900 text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  Passphrase
                </button>
              </div>
            </div>

            {genMode === "chars" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Length</span>
                    <span className="font-bold text-foreground font-mono">{genLength} characters</span>
                  </div>
                  <Slider
                    value={[genLength]}
                    min={8}
                    max={64}
                    step={1}
                    onValueChange={(val) => setGenLength(val[0])}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-900/40 cursor-pointer">
                    <Switch checked={useUpper} onCheckedChange={setUseUpper} />
                    <span className="font-medium">Uppercase</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-900/40 cursor-pointer">
                    <Switch checked={useLower} onCheckedChange={setUseLower} />
                    <span className="font-medium">Lowercase</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-900/40 cursor-pointer">
                    <Switch checked={useNumbers} onCheckedChange={setUseNumbers} />
                    <span className="font-medium">Numbers</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-900/40 cursor-pointer">
                    <Switch checked={useSymbols} onCheckedChange={setUseSymbols} />
                    <span className="font-medium">Symbols</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Word Count</span>
                  <span className="font-bold text-foreground font-mono">{passphraseWords} words</span>
                </div>
                <Slider
                  value={[passphraseWords]}
                  min={3}
                  max={8}
                  step={1}
                  onValueChange={(val) => setPassphraseWords(val[0])}
                />
              </div>
            )}

            <Button
              type="button"
              onClick={handleGenerate}
              className="w-full rounded-xl text-xs h-10 font-semibold shadow-xs"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Generate New Secure {genMode === "passphrase" ? "Passphrase" : "Password"}</span>
            </Button>
          </Card>

          {/* Privacy Guarantee Note (Screen 7 Requirement) */}
          <div className="rounded-2xl border border-border bg-slate-50/70 dark:bg-slate-900/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Lock className="h-4 w-4 text-emerald-500" />
              <span>Privacy Guarantee</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your password is analyzed locally and never stored. When checking breach registries, only the first 5 hexadecimal characters of the SHA-1 hash are queried using the k-Anonymity model.
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Suggestions & Composition (Screen 7) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-2xl border-border bg-card p-6 space-y-5 shadow-xs">
            
            {/* Crack Time Indicator */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border space-y-1">
              <span className="text-xs text-muted-foreground">Estimated GPU Cracking Time:</span>
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Clock className="h-5 w-5 text-indigo-500" />
                <span>{password ? analysis.crackTimeDisplay : "Enter password"}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Entropy: <strong className="text-foreground">{analysis.entropyBits} bits</strong>
              </p>
            </div>

            {/* Breach Status Card */}
            {breachResult.checked && (
              <div
                className={`p-4 rounded-xl border space-y-1 ${
                  breachResult.breached
                    ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {breachResult.breached ? <ShieldAlert className="h-4 w-4 text-rose-600" /> : <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                  <span>{breachResult.breached ? "Exposed in Data Breaches!" : "Zero Breaches Found"}</span>
                </div>
                <p className="text-xs mt-0.5">
                  {breachResult.breached
                    ? `Observed ${breachResult.count.toLocaleString()} times in documented compromised credential databases.`
                    : "This exact password hash does not appear in public data breach archives."}
                </p>
              </div>
            )}

            {/* Suggestions Checklist (Screen 7 Exact Requirements) */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Suggestions & Security Checklist
              </h4>

              <div className="space-y-2 text-xs">
                {/* Dynamic first item when strong */}
                {isStrong && (
                  <div className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-semibold">Great job! Your password is strong.</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                  <span className="text-foreground">Use a mix of letters, numbers, and symbols</span>
                  {!hasStarted ? (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />
                  ) : analysis.hasUppercase && analysis.hasLowercase && analysis.hasNumbers && analysis.hasSymbols ? (
                    <Check className="h-4 w-4 text-emerald-500 font-bold" />
                  ) : (
                    <X className="h-4 w-4 text-rose-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                  <span className="text-foreground">Avoid using personal information</span>
                  {!hasStarted ? (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />
                  ) : analysis.hasNoDates && analysis.hasNoCommonWords ? (
                    <Check className="h-4 w-4 text-emerald-500 font-bold" />
                  ) : (
                    <X className="h-4 w-4 text-rose-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                  <span className="text-foreground">Use a longer passphrase (12+ characters)</span>
                  {!hasStarted ? (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />
                  ) : password.length >= 12 ? (
                    <Check className="h-4 w-4 text-emerald-500 font-bold" />
                  ) : (
                    <X className="h-4 w-4 text-rose-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                  <span className="text-foreground">No sequential or repeated patterns</span>
                  {!hasStarted ? (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />
                  ) : analysis.hasNoRepeats && analysis.hasNoSequences ? (
                    <Check className="h-4 w-4 text-emerald-500 font-bold" />
                  ) : (
                    <X className="h-4 w-4 text-rose-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions list from engine */}
            {analysis.suggestions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Smart Recommendations
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {analysis.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
