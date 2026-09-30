import { z } from "zod";

export const passwordComplexityRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(
        passwordComplexityRegex,
        "Password must contain uppercase, lowercase, number, and special character."
      ),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: "Passwords don't match.",
      path: ["confirmPassword"],
    }
  );

export const emailScanSchema = z.object({
  emailContent: z
    .string()
    .min(10, "Please provide at least 10 characters of email text."),
  senderHeader: z.string().optional(),
});

export const urlScanSchema = z.object({
  url: z.string().min(3, "Please enter a valid URL or domain."),
});

export const passwordLogSchema = z.object({
  summary: z.string(),
  score: z.number().min(0).max(100),
  verdict: z.enum(["weak", "moderate", "strong", "WEAK", "MODERATE", "STRONG", "safe", "SAFE"]),
  threatIndicators: z.array(z.string()).optional(),
  details: z.record(z.any()),
});

export const quizSubmissionSchema = z.object({
  quizId: z.string().optional(),
  answers: z.record(z.union([z.string(), z.number()])),
  timeTakenSec: z.number().min(0).default(0),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Valid email required."),
  subject: z.string().min(3, "Subject is required."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message cannot exceed 2,000 characters."),
  conversationId: z.string().optional(),
  sessionId: z.string().optional(),
  stream: z.boolean().optional(),
});

export const conversationCreateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export const conversationRenameSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").max(100, "Title is too long."),
});

