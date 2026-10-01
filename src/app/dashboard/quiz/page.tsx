"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  Lightbulb,
  BookOpen,
  Trophy,
  Check,
  ChevronRight,
  Layers,
  BarChart3,
  Calendar,
} from "lucide-react";

interface SanitizedQuestion {
  id: string;
  quizId: string | null;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
}

interface QuizMeta {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  questionCount: number;
}

interface PastAttempt {
  id: string;
  quizId: string | null;
  score: number;
  total: number;
  percentage: number;
  durationSeconds: number;
  timeTakenSec: number;
  passed: boolean;
  createdAt: string | number;
}

interface SubmissionDetail {
  questionId: string;
  question: string;
  selectedOption: string | number;
  correctOptionText: string;
  isCorrect: boolean;
  explanation: string;
}

interface EvaluationResult {
  attemptId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  totalQuestions: number;
  percentage: number;
  durationSeconds: number;
  timeTakenSec: number;
  passed: boolean;
  details: SubmissionDetail[];
  securityTips: Array<{
    id: string;
    title: string;
    category: string;
    tip: string;
    actionPrompt?: string | null;
  }>;
}

type QuizState = "start" | "in_progress" | "completed";

export default function QuizPage() {
  const [quizState, setQuizState] = useState<QuizState>("start");
  const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);
  const [pastAttempts, setPastAttempts] = useState<PastAttempt[]>([]);
  const [bestScore, setBestScore] = useState<number>(0);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  // In-progress quiz state
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeQuizTitle, setActiveQuizTitle] = useState<string>("Cyber Awareness Challenge");
  const [questions, setQuestions] = useState<SanitizedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timerSec, setTimerSec] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [loadingMeta, setLoadingMeta] = useState<boolean>(true);

  // Result state
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Fetch quizzes metadata & history on load
  const loadQuizzesAndHistory = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const res = await fetch("/api/quiz/quizzes");
      const data = await res.json();
      if (res.ok && data.success) {
        setQuizzes(data.data.quizzes || []);
        setPastAttempts(data.data.history || []);
        setBestScore(data.data.bestScore || 0);
        setTotalCompleted(data.data.totalCompleted || 0);
      }
    } catch (err) {
      console.error("Failed to load quiz metadata:", err);
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzesAndHistory();
  }, [loadQuizzesAndHistory]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && quizState === "in_progress") {
      interval = setInterval(() => {
        setTimerSec((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, quizState]);

  // Exit quiz and return cleanly to the main challenges screen
  const handleExitToDashboard = useCallback(() => {
    setQuizState("start");
    setTimerRunning(false);
    setEvaluation(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
  }, []);

  // Intercept browser back button when quiz is in-progress/results to return to quiz dashboard
  useEffect(() => {
    const handlePopState = () => {
      if (quizState === "in_progress" || quizState === "results") {
        handleExitToDashboard();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [quizState, handleExitToDashboard]);

  // Start a new quiz session
  const handleStartQuiz = async (quizId?: string, title?: string) => {
    setLoadingQuestions(true);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setTimerSec(0);
    setEvaluation(null);

    const targetQuizId = quizId || quizzes[0]?.id || "quiz-phishing";
    const targetQuiz = quizzes.find((q) => q.id === targetQuizId);
    const quizTitle = title || targetQuiz?.title || "Cyber Defense Challenge";

    setActiveQuizId(targetQuizId);
    setActiveQuizTitle(quizTitle);

    if (typeof window !== "undefined") {
      window.history.pushState({ quizView: "in_progress" }, "");
    }

    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: targetQuizId,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
          title: quizTitle,
          limit: 10,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data.questions?.length > 0) {
        setQuestions(data.data.questions);
        setQuizState("in_progress");
        setTimerRunning(true);
      } else {
        toast.error("Could not load quiz questions. Please try again.");
      }
    } catch (error) {
      console.error("Start quiz error:", error);
      toast.error("Failed to start quiz.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Option selection
  const handleSelectOption = (questionId: string, optionText: string) => {
    if (quizState !== "in_progress") return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  // Next / Previous navigation
  const handleNext = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !selectedAnswers[currentQ.id]) {
      toast.warning("Please select an answer to proceed.");
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !selectedAnswers[currentQ.id]) {
      toast.warning("Please select an answer before finishing.");
      return;
    }

    setSubmitting(true);
    setTimerRunning(false);

    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuizId,
          answers: selectedAnswers,
          timeTakenSec: timerSec,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEvaluation(data.data);
        setQuizState("completed");

        if (data.data.percentage === 100) {
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 },
          });
          toast.success("Flawless! 100% Score — Quiz Champion badge awarded!");
        } else if (data.data.passed) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
          toast.success(`Congratulations! You passed with ${data.data.percentage}%!`);
        } else {
          toast.info(`Quiz completed: ${data.data.percentage}%. Check out the review points!`);
        }

        // Refresh past attempts and best score
        loadQuizzesAndHistory();
      } else {
        toast.error(data.error?.message || "Failed to grade quiz.");
        setTimerRunning(true);
      }
    } catch (error) {
      console.error("Submit quiz error:", error);
      toast.error("Failed to submit quiz.");
      setTimerRunning(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard navigation & hotkeys: 1-4 to select option, Enter to proceed/submit
  useEffect(() => {
    if (quizState !== "in_progress" || questions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      const opts = currentQ.options || [];

      // Keys 1–4 or A–D
      if (["1", "a", "A"].includes(e.key) && opts[0]) {
        handleSelectOption(currentQ.id, opts[0]);
      } else if (["2", "b", "B"].includes(e.key) && opts[1]) {
        handleSelectOption(currentQ.id, opts[1]);
      } else if (["3", "c", "C"].includes(e.key) && opts[2]) {
        handleSelectOption(currentQ.id, opts[2]);
      } else if (["4", "d", "D"].includes(e.key) && opts[3]) {
        handleSelectOption(currentQ.id, opts[3]);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedAnswers[currentQ.id]) {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            handleSubmitQuiz();
          }
        }
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quizState, questions, currentIndex, selectedAnswers]);

  // Format stopwatch timer seconds -> MM:SS
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchCat = selectedCategory === "All" || q.category === selectedCategory;
    const matchDiff =
      selectedDifficulty === "All" ||
      q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchCat && matchDiff;
  });

  const uniqueCategories = ["All", ...Array.from(new Set(quizzes.map((q) => q.category)))];
  const uniqueDifficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  // =========================================================================
  // VIEW: IN-PROGRESS STATE (MATCHING DESIGN REFERENCE SCREEN 9)
  // =========================================================================
  if (quizState === "in_progress") {
    const currentQ = questions[currentIndex];
    const isAnswerSelected = !!(currentQ && selectedAnswers[currentQ.id]);
    const progressPercent =
      questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
    const isLastQuestion = currentIndex === questions.length - 1;

    return (
      <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
        {/* Main Quiz Card */}
        <Card className="rounded-3xl border border-border bg-card/95 backdrop-blur-md p-6 sm:p-9 shadow-lg space-y-6">
          {/* Header Row: Back Button + Number Badge "9." + "Cyber Quiz" and Category/Difficulty */}
          <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitToDashboard}
                className="h-8 px-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 font-semibold"
                title="Return to Quiz Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Exit Quiz</span>
              </Button>
              <div className="h-4 w-px bg-border/80 hidden sm:block" />
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-sm shadow-md shadow-indigo-500/30">
                9.
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Cyber Quiz
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {activeQuizTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentQ && (
                <>
                  <Badge variant="outline" className="text-xs px-2.5 py-1">
                    {currentQ.category}
                  </Badge>
                  <Badge variant="cyber" className="text-xs px-2.5 py-1">
                    {currentQ.difficulty}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Subheader: Question X of Y + Timer */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Question {currentIndex + 1} of {questions.length}
            </span>

            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-border/80">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-mono text-xs sm:text-sm">{formatTimer(timerSec)}</span>
            </div>
          </div>

          {/* Indigo Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question Text */}
          {currentQ ? (
            <div className="space-y-6 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                {currentQ.question}
              </h2>

              {/* Radio Rows: Options A–D */}
              <div className="space-y-3">
                {(currentQ.options || []).map((optionText, idx) => {
                  const letterLabel = ["A", "B", "C", "D"][idx] || String(idx + 1);
                  const isSelected = selectedAnswers[currentQ.id] === optionText;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optionText)}
                      className={`w-full p-4 sm:p-4.5 rounded-2xl border text-left transition-all duration-150 flex items-center gap-4 group ${
                        isSelected
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100 shadow-sm"
                          : "border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-indigo-700 text-foreground"
                      }`}
                    >
                      {/* Radio Circle Indicator */}
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          isSelected
                            ? "border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-500"
                            : "border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-indigo-400"
                        }`}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>

                      {/* Option Text with A., B., C., D. prefix */}
                      <div className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                        <span className="font-bold mr-2 text-slate-700 dark:text-slate-300">
                          {letterLabel}.
                        </span>
                        {optionText}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Previous & Next Question / Finish Quiz */}
              <div className="flex items-center justify-between pt-6 border-t border-border/80">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="rounded-xl text-xs h-11 px-5 border-border hover:bg-muted font-semibold"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center gap-3">
                  {!isLastQuestion ? (
                    <Button
                      onClick={handleNext}
                      disabled={!isAnswerSelected}
                      className="rounded-xl text-xs sm:text-sm h-11 px-6 font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={!isAnswerSelected || submitting}
                      className="rounded-xl text-xs sm:text-sm h-11 px-7 font-bold bg-gradient-to-r from-emerald-600 via-indigo-600 to-violet-600 hover:from-emerald-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                    >
                      {submitting ? (
                        <span>Grading...</span>
                      ) : (
                        <>
                          <span>Finish Quiz</span>
                          <Sparkles className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Keyboard Shortcut Helper */}
              <div className="pt-2 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-2">
                <span>Hotkeys:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                  1
                </kbd>
                –
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                  4
                </kbd>
                <span>select answer</span>
                <span>•</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                  Enter
                </kbd>
                <span>proceed</span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">Loading question...</div>
          )}
        </Card>
      </div>
    );
  }

  // =========================================================================
  // VIEW: COMPLETED RESULT STATE
  // =========================================================================
  if (quizState === "completed" && evaluation) {
    return (
      <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8">
        {/* Results Hero Card */}
        <Card className="rounded-3xl border border-border bg-card/95 backdrop-blur-md p-6 sm:p-10 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 ring-8 ring-indigo-500/10">
            {evaluation.passed ? (
              <Trophy className="h-12 w-12 text-amber-300" />
            ) : (
              <BookOpen className="h-12 w-12 text-indigo-200" />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Badge
                className={
                  evaluation.passed
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-xs px-3 py-1 font-bold"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 text-xs px-3 py-1 font-bold"
                }
              >
                {evaluation.passed ? "Quiz Passed" : "Knowledge Review Recommended"}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Quiz Completed
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              You scored{" "}
              <span className="font-bold text-foreground">
                {evaluation.correctCount} / {evaluation.totalCount}
              </span>{" "}
              ({evaluation.percentage}%) in{" "}
              <span className="font-bold text-foreground">
                {formatTimer(evaluation.timeTakenSec)}
              </span>
              . Review your question breakdown and defensive best practices below.
            </p>
          </div>

          {/* Score Stat Pill Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border text-center">
              <p className="text-[11px] font-semibold text-muted-foreground">Accuracy</p>
              <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {evaluation.percentage}%
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border text-center">
              <p className="text-[11px] font-semibold text-muted-foreground">Score</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {evaluation.correctCount}/{evaluation.totalCount}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border text-center">
              <p className="text-[11px] font-semibold text-muted-foreground">Time</p>
              <p className="text-xl sm:text-2xl font-black text-foreground">
                {formatTimer(evaluation.timeTakenSec)}
              </p>
            </div>
          </div>

          {/* Action CTAs: Retake or New Quiz */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border/60">
            <Button
              onClick={() => handleStartQuiz(activeQuizId || undefined, activeQuizTitle)}
              className="rounded-xl px-6 h-11 text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <span>Retake Quiz</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setQuizState("start");
                loadQuizzesAndHistory();
              }}
              className="rounded-xl px-6 h-11 text-xs sm:text-sm font-semibold border-border"
            >
              <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Choose New Quiz</span>
            </Button>
          </div>
        </Card>

        {/* Security Tips Section */}
        {evaluation.securityTips && evaluation.securityTips.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Targeted Defensive Security Tips
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {evaluation.securityTips.map((tip) => (
                <Card
                  key={tip.id}
                  className="rounded-2xl border-border bg-card p-4 space-y-2 shadow-xs hover:border-indigo-300 transition-colors"
                >
                  <Badge variant="outline" className="text-[10px]">
                    {tip.category}
                  </Badge>
                  <p className="text-xs font-bold text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.tip}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Per-Question Detailed Review */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <span>Per-Question Review & Explanations</span>
            </h2>
            <Badge variant="outline" className="text-xs">
              {evaluation.correctCount} of {evaluation.totalCount} Correct
            </Badge>
          </div>

          <div className="space-y-3">
            {evaluation.details.map((item, idx) => (
              <Card
                key={idx}
                className={`rounded-2xl border p-5 sm:p-6 space-y-4 transition-all shadow-xs ${
                  item.isCorrect
                    ? "border-emerald-500/30 bg-card hover:border-emerald-500/50"
                    : "border-rose-500/30 bg-card hover:border-rose-500/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {item.isCorrect ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mt-0.5">
                        <XCircle className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Question {idx + 1}
                      </p>
                      <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                        {item.question}
                      </h3>
                    </div>
                  </div>

                  <Badge variant={item.isCorrect ? "success" : "danger"} className="text-xs">
                    {item.isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border">
                    <span className="font-semibold text-muted-foreground block mb-0.5">
                      Your Answer:
                    </span>
                    <span
                      className={`font-medium ${
                        item.isCorrect
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400 font-semibold"
                      }`}
                    >
                      {item.selectedOption || "(No answer selected)"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border">
                    <span className="font-semibold text-muted-foreground block mb-0.5">
                      Correct Answer:
                    </span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {item.correctOptionText}
                    </span>
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs space-y-1">
                  <p className="font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Defensive Security Rationale:</span>
                  </p>
                  <p className="text-indigo-900/90 dark:text-indigo-200/90 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: START STATE (CHOOSE PUBLISHED QUIZ, CATEGORY/DIFFICULTY, PAST ATTEMPTS, BEST SCORE)
  // =========================================================================
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Cyber Quiz & Knowledge Hub
            </h1>
            <Badge variant="cyber" className="text-xs">
              Interactive Engine
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Test and sharpen your threat detection skills across phishing, passwords, URL verification, and Zero Trust hygiene.
          </p>
        </div>

        <Button
          onClick={() => handleStartQuiz(quizzes[0]?.id)}
          disabled={loadingQuestions || quizzes.length === 0}
          className="rounded-xl text-xs sm:text-sm h-11 px-6 font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          <span>Start General Quiz</span>
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Best Score</p>
            <p className="text-2xl font-black text-foreground">
              {bestScore > 0 ? `${bestScore}%` : "—"}
            </p>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Quizzes Completed</p>
            <p className="text-2xl font-black text-foreground">{totalCompleted}</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Defense Status</p>
            <p className="text-2xl font-black text-foreground">
              {bestScore >= 80 ? "Shield Active" : bestScore > 0 ? "In Training" : "Unranked"}
            </p>
          </div>
        </Card>
      </div>

      {/* Published Quizzes Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Choose a Cybersecurity Challenge</h2>
            <p className="text-xs text-muted-foreground">
              Select a specialized domain or filter by difficulty to begin testing.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto max-w-full">
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60">
              {uniqueDifficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                    selectedDifficulty === diff
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="rounded-2xl border-border bg-card p-6 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-xs">
                    {quiz.category}
                  </Badge>
                  <Badge variant="cyber" className="text-xs">
                    {quiz.difficulty}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-foreground">{quiz.title}</h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {quiz.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/70">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                  {quiz.questionCount || 10} Questions
                </span>

                <Button
                  onClick={() => handleStartQuiz(quiz.id, quiz.title)}
                  disabled={loadingQuestions}
                  className="rounded-xl text-xs h-9 px-4 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  <span>Start Quiz</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Quiz Attempts Section */}
      <div className="space-y-4 pt-4 border-t border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Your Past Attempts</h2>
            <p className="text-xs text-muted-foreground">
              Review your historical performance and test scores.
            </p>
          </div>
        </div>

        {pastAttempts.length > 0 ? (
          <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-xs">
            <div className="divide-y divide-border">
              {pastAttempts.map((attempt) => {
                const dateStr = attempt.createdAt
                  ? new Date(attempt.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent";

                const quizItem = quizzes.find((q) => q.id === attempt.quizId);
                const quizLabel = quizItem?.title || "Cyber Awareness Quiz";

                return (
                  <div
                    key={attempt.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{quizLabel}</span>
                        <Badge
                          variant={attempt.passed ? "success" : "danger"}
                          className="text-[10px]"
                        >
                          {attempt.passed ? "Passed" : "Needs Review"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimer(attempt.durationSeconds || attempt.timeTakenSec || 0)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-lg font-black text-foreground">
                          {attempt.percentage ?? attempt.score}%
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          Score: {attempt.score}/{attempt.total || 10}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <EmptyState
            title="Take your first quiz."
            description="Test your cybersecurity instincts against real-world threat scenarios and earn defender badges."
            actionLabel="Start Quiz"
            icon={Award}
            onAction={() => handleStartQuiz(quizzes[0]?.id)}
          />
        )}
      </div>
    </div>
  );
}
