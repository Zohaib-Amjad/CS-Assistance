import { describe, it, expect } from "vitest";
import {
  getQuizQuestionsSanitized,
  submitQuizAttempt,
  getPublishedQuizzes,
  getUserQuizHistory,
} from "@/services/quiz.service";

describe("Cyber Quiz Engine & Anti-Cheat Protection", () => {
  it("should sanitize questions and NEVER leak correctIndex, correctOption, or explanation before submit", async () => {
    const questions = await getQuizQuestionsSanitized({ limit: 5 });

    expect(questions.length).toBeGreaterThan(0);

    for (const q of questions) {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("options");
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(2);

      // CRITICAL ANTI-CHEAT CHECKS:
      expect((q as any).correctIndex).toBeUndefined();
      expect((q as any).correctOption).toBeUndefined();
      expect((q as any).explanation).toBeUndefined();
    }
  });

  it("should return published quizzes with positive question counts", async () => {
    const published = await getPublishedQuizzes();
    expect(published.length).toBeGreaterThan(0);

    for (const p of published) {
      expect(p.isPublished).toBe(true);
      expect(p.title).toBeTruthy();
      expect(p.questionCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("should evaluate a submitted quiz, score server-side, and return full defensive explanations", async () => {
    // 1. Fetch sanitized questions
    const questions = await getQuizQuestionsSanitized({ limit: 3 });
    expect(questions.length).toBe(3);

    // 2. Submit answers (test with option texts)
    const answers: Record<string, string> = {};
    for (const q of questions) {
      answers[q.id] = q.options[0]; // pick first option
    }

    const result = await submitQuizAttempt("user-demo-id", answers, 42);

    expect(result).toHaveProperty("attemptId");
    expect(result.totalCount).toBe(3);
    expect(typeof result.correctCount).toBe("number");
    expect(typeof result.percentage).toBe("number");
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
    expect(result.durationSeconds).toBe(42);
    expect(result.details.length).toBe(3);

    // After submit, details MUST contain correctOptionText and explanation
    for (const detail of result.details) {
      expect(detail).toHaveProperty("question");
      expect(detail).toHaveProperty("selectedOption");
      expect(detail).toHaveProperty("correctOptionText");
      expect(detail).toHaveProperty("isCorrect");
      expect(detail).toHaveProperty("explanation");
      expect(detail.explanation.length).toBeGreaterThan(5);
    }

    // Must return security tips
    expect(Array.isArray(result.securityTips)).toBe(true);
  });

  it("should fetch user quiz history and calculate best score accurately", async () => {
    const history = await getUserQuizHistory("user-demo-id");
    expect(Array.isArray(history.attempts)).toBe(true);
    expect(typeof history.bestScore).toBe("number");
    expect(typeof history.totalCompleted).toBe("number");
    expect(typeof history.passedCount).toBe("number");
  });
});
