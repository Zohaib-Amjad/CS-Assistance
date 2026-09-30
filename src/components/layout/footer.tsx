import React from "react";
import Link from "next/link";
import { Shield, Lock, Cpu } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 backdrop-blur-xs">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Logo size="md" href="/" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Empowering students, developers, and organizations with AI-driven defensive cybersecurity awareness, phishing detection, and real-time threat analysis.
            </p>
          </div>

          {/* Core Modules */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Security Tools</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><Link href="/dashboard/email-checker" className="hover:text-indigo-600 transition-colors">AI Phishing Detector</Link></li>
              <li><Link href="/dashboard/url-checker" className="hover:text-indigo-600 transition-colors">SSRF-Safe URL Scanner</Link></li>
              <li><Link href="/dashboard/password-checker" className="hover:text-indigo-600 transition-colors">Password Entropy Audit</Link></li>
              <li><Link href="/dashboard/assistant" className="hover:text-indigo-600 transition-colors">AI Security Assistant</Link></li>
            </ul>
          </div>

          {/* Education & Platform */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Education</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><Link href="/dashboard/quiz" className="hover:text-indigo-600 transition-colors">Cyber Awareness Quiz</Link></li>
              <li><Link href="/features" className="hover:text-indigo-600 transition-colors">Platform Architecture</Link></li>
              <li><Link href="/about" className="hover:text-indigo-600 transition-colors">Defensive Security Ethos</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-600 transition-colors">Educational Access</Link></li>
            </ul>
          </div>

          {/* Security Standards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Security Standards</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>k-Anonymity HIBP Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-indigo-500" />
                <span>Zero Password Storage on Scans</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-purple-500" />
                <span>Strict AI Guardrail Alignment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CyberGuard AI. Defensive Cybersecurity Education Platform. Final Year Project.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/login" className="hover:text-foreground">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
