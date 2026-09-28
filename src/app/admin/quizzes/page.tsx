import React from "react";
import { db } from "@/db";
import { quizQuestions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function AdminQuizzesPage() {
  const questions = await db.query.quizQuestions.findMany({
    orderBy: [desc(quizQuestions.createdAt)],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Quiz Curriculum Management
            </h1>
            <Badge variant="secondary" className="text-xs">{questions.length} Active Items</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Curate cybersecurity challenge questions, explanation rationale, and difficulty grading.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Published Challenge Items</CardTitle>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Question Text</TableHead>
                <TableHead>Correct Key</TableHead>
                <TableHead>Explanation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q: any) => (
                <TableRow key={q.id}>
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
                  <TableCell className="text-xs font-semibold max-w-xs text-foreground">
                    {q.question}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Option {["A", "B", "C", "D"][q.correctOption - 1] || q.correctOption}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                    {q.explanation}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
