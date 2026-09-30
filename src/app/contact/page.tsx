"use client";

import React from "react";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MessageSquare, Send, CheckCircle2, Shield } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Message sent! Our security team will get back to you shortly.");
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data.error?.message || "Failed to submit message.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicNav />

      <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12 flex-1">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="cyber" className="px-3 py-1 font-semibold">
            Get In Touch
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Contact the CyberGuard AI Team
          </h1>
          <p className="text-muted-foreground text-base">
            Have questions regarding vulnerability research, academic integration, or platform features? We'd love to hear from you.
          </p>
        </div>

        <Card className="rounded-2xl border-border bg-card p-6 sm:p-8 shadow-md">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Message Dispatched</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Thank you for contacting CyberGuard AI. Your ticket has been logged and assigned to our security research desk.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-xl mt-4">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  required
                  placeholder="Academic FYP Inquiry / Feature Feedback"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className="flex w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
                  placeholder="Describe your inquiry or feedback in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8 rounded-xl shadow-md">
                {loading ? "Sending Message..." : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </span>
                )}
              </Button>
            </form>
          )}
        </Card>
      </div>

      <Footer />
    </div>
  );
}
