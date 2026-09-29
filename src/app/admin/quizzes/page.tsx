"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  FileJson,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Loader2,
} from "lucide-react";

interface QuizQuestionItem {
  id: string;
  quizId?: string | null;
  category: string;
  difficulty: string;
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  options?: string[];
  correctOption: number;
  correctIndex?: number;
  explanation: string;
}

export default function AdminQuizzesPage() {
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    category: "Email Security",
    difficulty: "Beginner",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: 1,
    explanation: "",
  });

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz/questions?limit=100");
      const data = await res.json();
      if (res.ok && data.success) {
        // Questions are fetched
        setQuestions(data.data.questions || []);
      }
    } catch (err) {
      console.error("Failed to load quiz questions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: QuizQuestionItem = {
      id: crypto.randomUUID(),
      category: form.category,
      difficulty: form.difficulty,
      question: form.question,
      optionA: form.optionA,
      optionB: form.optionB,
      optionC: form.optionC,
      optionD: form.optionD,
      options: [form.optionA, form.optionB, form.optionC, form.optionD],
      correctOption: Number(form.correctOption),
      explanation: form.explanation,
    };

    setQuestions((prev) => [newQ, ...prev]);
    toast.success("Question created and published to active curriculum!");
    setAddOpen(false);
    setForm({
      category: "Email Security",
      difficulty: "Beginner",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: 1,
      explanation: "",
    });
  };

  const handleImportJSON = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        toast.error("JSON payload must be an array of question objects.");
        return;
      }

      const formatted: QuizQuestionItem[] = parsed.map((item, idx) => ({
        id: item.id || crypto.randomUUID(),
        category: item.category || "General",
        difficulty: item.difficulty || "Beginner",
        question: item.question || `Imported Question ${idx + 1}`,
        optionA: item.options?.[0] || item.optionA || "Option A",
        optionB: item.options?.[1] || item.optionB || "Option B",
        optionC: item.options?.[2] || item.optionC || "Option C",
        optionD: item.options?.[3] || item.optionD || "Option D",
        options: item.options || [item.optionA, item.optionB, item.optionC, item.optionD],
        correctOption: item.correctOption || item.correctIndex + 1 || 1,
        explanation: item.explanation || "Standard cybersecurity defense protocol.",
      }));

      setQuestions((prev) => [...formatted, ...prev]);
      toast.success(`Successfully imported ${formatted.length} challenge questions!`);
      setImportOpen(false);
      setJsonInput("");
    } catch (err: any) {
      toast.error(`Invalid JSON syntax: ${err.message}`);
    }
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.success("Question removed from curriculum.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Quiz Curriculum & Item Management
            </h1>
            <Badge variant="cyber" className="text-xs">
              {questions.length} Active Items
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Curate cybersecurity challenge questions, explanation rationale, and difficulty grading.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            size="sm"
            className="rounded-xl text-xs h-10 px-3.5 border-border hover:bg-muted font-semibold"
          >
            <FileJson className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
            <span>Import JSON</span>
          </Button>

          <Button
            onClick={() => setAddOpen(true)}
            size="sm"
            className="rounded-xl text-xs h-10 px-4.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span>Add Question</span>
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-border">
              <TableRow>
                <TableHead className="font-bold text-xs">Category</TableHead>
                <TableHead className="font-bold text-xs">Difficulty</TableHead>
                <TableHead className="font-bold text-xs">Question</TableHead>
                <TableHead className="font-bold text-xs">Options (A–D)</TableHead>
                <TableHead className="text-right font-bold text-xs pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">Loading curriculum...</p>
                  </TableCell>
                </TableRow>
              ) : questions.length > 0 ? (
                questions.map((q) => (
                  <TableRow key={q.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                        {q.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="cyber" className="text-[10px]">
                        {q.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground max-w-sm">
                      {q.question}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {q.options?.join(" • ") || "4 options configured"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    No questions found in curriculum.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* DIALOG: ADD QUESTION */}
      {/* ========================================================================= */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              <span>Add Challenge Question</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define question details, randomized options, and educational explanation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddQuestion} className="space-y-3.5 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-9.5 rounded-xl border border-border bg-card text-xs px-2.5"
                >
                  <option value="Email Security">Email Security</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Web Security">Web Security</option>
                  <option value="Social Engineering">Social Engineering</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Difficulty</Label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full h-9.5 rounded-xl border border-border bg-card text-xs px-2.5"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Question Text</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="What is the primary indicator of phishing?"
                required
                className="rounded-xl text-xs h-9.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Option A</Label>
                <Input
                  value={form.optionA}
                  onChange={(e) => setForm({ ...form, optionA: e.target.value })}
                  required
                  className="rounded-xl text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Option B</Label>
                <Input
                  value={form.optionB}
                  onChange={(e) => setForm({ ...form, optionB: e.target.value })}
                  required
                  className="rounded-xl text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Option C</Label>
                <Input
                  value={form.optionC}
                  onChange={(e) => setForm({ ...form, optionC: e.target.value })}
                  required
                  className="rounded-xl text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Option D</Label>
                <Input
                  value={form.optionD}
                  onChange={(e) => setForm({ ...form, optionD: e.target.value })}
                  required
                  className="rounded-xl text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Correct Option</Label>
              <select
                value={form.correctOption}
                onChange={(e) => setForm({ ...form, correctOption: Number(e.target.value) })}
                className="w-full h-9.5 rounded-xl border border-border bg-card text-xs px-2.5"
              >
                <option value={1}>Option A</option>
                <option value={2}>Option B</option>
                <option value={3}>Option C</option>
                <option value={4}>Option D</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Defensive Rationale & Explanation</Label>
              <Textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder="Explain why this option is correct for defensive security..."
                rows={2}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Save & Publish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: JSON IMPORT */}
      {/* ========================================================================= */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <FileJson className="h-5 w-5 text-indigo-600" />
              <span>Bulk JSON Import</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste a JSON array containing challenge questions with options and explanations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImportJSON} className="space-y-4 pt-1">
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "category": "Email Security",\n    "difficulty": "Beginner",\n    "question": "What is phishing?",\n    "options": ["A", "B", "C", "D"],\n    "correctIndex": 1,\n    "explanation": "..."\n  }\n]`}
              rows={8}
              required
              className="font-mono text-xs rounded-xl"
            />

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setImportOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Import Questions
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
