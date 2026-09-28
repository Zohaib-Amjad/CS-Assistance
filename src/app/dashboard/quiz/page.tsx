"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from "lucide-react";

interface Question {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: number;
  explanation: string;
}

export default function QuizPage() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);
  const [submissionResult, setSubmissionResult] = React.useState<any>(null);
  const [timerSec, setTimerSec] = React.useState(0);
  const [timerRunning, setTimerRunning] = React.useState(false);

  // Load questions
  const loadQuestions = async () => {
    setLoading(true);
    setQuizSubmitted(false);
    setSubmissionResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setTimerSec(0);

    try {
      // In serverless Next.js, we can query questions directly via seed / db endpoint or load from server
      const res = await fetch("/api/quiz/questions");
      let data = await res.json();
      if (data.success && data.data.questions?.length > 0) {
        setQuestions(data.data.questions);
      } else {
        // Fallback default questions
        setQuestions([
          {
            id: "q1",
            category: "Phishing & Social Engineering",
            difficulty: "Beginner",
            question: "What is phishing in cybersecurity?",
            optionA: "A technique to optimize internet connection speeds",
            optionB: "A fraudulent attempt to steal sensitive information via disguised communications",
            optionC: "A hardware diagnostic tool for network firewalls",
            optionD: "An encryption algorithm used in modern VPNs",
            correctOption: 2,
            explanation: "Phishing is a social engineering attack where attackers impersonate trustworthy entities to deceive victims into handing over credentials or financial info.",
          },
          {
            id: "q2",
            category: "Password Security",
            difficulty: "Beginner",
            question: "Which of the following creates the most resilient password against GPU cracking?",
            optionA: "password2024!",
            optionB: "Admin_Secure1",
            optionC: "correct-horse-battery-staple-9#Z",
            optionD: "P@ssw0rd12345",
            correctOption: 3,
            explanation: "Long passphrases with 4+ random words offer exponentially higher brute-force resistance than short passwords with simple substitutions.",
          },
          {
            id: "q3",
            category: "Network Security",
            difficulty: "Intermediate",
            question: "Why is HTTPS crucial when submitting login credentials?",
            optionA: "It guarantees that the website owner is completely trustworthy",
            optionB: "It encrypts the transport layer, preventing eavesdropping and Man-in-the-Middle credential interception",
            optionC: "It automatically scans the web server for malware files",
            optionD: "It speeds up page rendering via CDN caching",
            correctOption: 2,
            explanation: "HTTPS provides cryptographic TLS encryption, preventing packet sniffers on public networks from intercepting plaintext passwords.",
          },
          {
            id: "q4",
            category: "Authentication",
            difficulty: "Beginner",
            question: "Why is Multi-Factor Authentication (MFA) vastly superior to single passwords?",
            optionA: "It eliminates the need for passwords completely",
            optionB: "It requires independent verification across knowledge, possession, or inherence",
            optionC: "It speeds up browser login times",
            optionD: "It only works on desktop PCs",
            correctOption: 2,
            explanation: "MFA blocks over 99% of automated credential stuffing attacks by requiring a second factor (like an authenticator app or security key).",
          },
          {
            id: "q5",
            category: "Operations & Hygiene",
            difficulty: "Beginner",
            question: "What is the principle of Zero Trust architecture?",
            optionA: "Never trust anyone inside or outside the perimeter; always verify and continuously validate",
            optionB: "Refusing to install software updates",
            optionC: "Trusting all users once they connect to office Wi-Fi",
            optionD: "Using no passwords anywhere",
            correctOption: 1,
            explanation: "Zero Trust assumes breach and requires strict verification, least-privilege permissions, and continuous authorization.",
          }
        ]);
      }
      setTimerRunning(true);
    } catch {
      toast.error("Failed to load quiz questions.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadQuestions();
  }, []);

  // Timer effect
  React.useEffect(() => {
    let interval: any;
    if (timerRunning && !quizSubmitted) {
      interval = setInterval(() => {
        setTimerSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, quizSubmitted]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      toast.error(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }

    setTimerRunning(false);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: selectedAnswers,
          timeTakenSec: timerSec,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionResult(data.data);
        setQuizSubmitted(true);
        if (data.data.score === 100) {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
          toast.success("Flawless! 100% Score achieved — Badge unlocked!");
        } else if (data.data.passed) {
          toast.success(`Great job! You passed with ${data.data.score}%`);
        } else {
          toast.info(`Quiz completed. Score: ${data.data.score}%. Review explanations below!`);
        }
      } else {
        // Fallback local scoring if server is offline
        let correct = 0;
        const details = questions.map((q) => {
          const selected = selectedAnswers[q.id];
          const isCorrect = selected === q.correctOption;
          if (isCorrect) correct++;
          return {
            questionId: q.id,
            question: q.question,
            selectedOption: selected,
            correctOption: q.correctOption,
            isCorrect,
            explanation: q.explanation,
          };
        });
        const score = Math.round((correct / questions.length) * 100);
        setSubmissionResult({
          score,
          correctCount: correct,
          totalCount: questions.length,
          passed: score >= 70,
          details,
        });
        setQuizSubmitted(true);
      }
    } catch {
      toast.error("Failed to submit quiz.");
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cyber Awareness Challenge
            </h1>
            <Badge variant="cyber" className="text-xs">Interactive Quiz</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Test and sharpen your threat recognition skills across phishing, passwords, and Zero Trust concepts.
          </p>
        </div>

        {/* Timer Pill */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-4 py-2 border border-border">
          <Timer className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-muted-foreground">Time:</span>
          <span className="text-xs font-bold text-foreground">{formatTimer(timerSec)}</span>
        </div>
      </div>

      {!quizSubmitted ? (
        currentQ ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Progress Bar & Counter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="rounded-2xl border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                  {currentQ.category}
                </Badge>
                <Badge variant="cyber" className="text-xs">
                  {currentQ.difficulty}
                </Badge>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                {currentQ.question}
              </h2>

              {/* Options Grid */}
              <div className="space-y-3 pt-2">
                {[
                  { num: 1, label: "A", text: currentQ.optionA },
                  { num: 2, label: "B", text: currentQ.optionB },
                  { num: 3, label: "C", text: currentQ.optionC },
                  { num: 4, label: "D", text: currentQ.optionD },
                ].map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.num;
                  return (
                    <button
                      key={opt.num}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.num)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-sm"
                          : "border-border bg-background hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50/50 text-foreground"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-muted-foreground group-hover:text-foreground"
                      }`}>
                        {opt.label}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="rounded-xl text-xs h-10 px-5"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {currentIndex < questions.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      className="rounded-xl text-xs h-10 px-6 font-semibold shadow-sm"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="rounded-xl text-xs h-10 px-6 font-bold bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 shadow-md text-white"
                    >
                      <span>Submit Challenge</span>
                      <Sparkles className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">Loading questions...</div>
        )
      ) : (
        /* Results View */
        <div className="space-y-6 max-w-4xl mx-auto">
          <Card className="rounded-2xl border-border bg-card p-6 sm:p-8 space-y-6 shadow-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25">
              <Award className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <Badge className={submissionResult?.passed ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"}>
                {submissionResult?.passed ? "Challenge Passed" : "Knowledge Check Needs Review"}
              </Badge>
              <h2 className="text-3xl font-extrabold text-foreground">
                Score: {submissionResult?.score}%
              </h2>
              <p className="text-xs text-muted-foreground">
                You answered {submissionResult?.correctCount} out of {submissionResult?.totalCount} questions correctly in {formatTimer(timerSec)}.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button onClick={loadQuestions} className="rounded-xl px-6">
                <RotateCcw className="h-4 w-4 mr-2" />
                <span>Retake Quiz</span>
              </Button>
            </div>
          </Card>

          {/* Question Breakdown and Explanations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground">Question Explanations & Learning Points:</h3>
            {submissionResult?.details?.map((item: any, idx: number) => (
              <Card key={idx} className="rounded-2xl border-border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {item.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {idx + 1}. {item.question}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.isCorrect ? "success" : "danger"} className="text-[10px]">
                    {item.isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Defensive Explanation:</p>
                  <p className="leading-relaxed">{item.explanation}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
