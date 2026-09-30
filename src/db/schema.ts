import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ==========================================
// 1. USERS & ACCOUNTS
// ==========================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  image: text("image"),
  phone: text("phone"),
  country: text("country").default("Pakistan"),
  bio: text("bio"),
  role: text("role", { enum: ["USER", "ADMIN", "user", "admin"] }).default("USER").notNull(),
  plan: text("plan", { enum: ["FREE", "PREMIUM", "free", "premium"] }).default("FREE").notNull(),
  status: text("status", { enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "active", "inactive", "suspended"] }).default("ACTIVE").notNull(),
  twoFaEnabled: integer("two_fa_enabled", { mode: "boolean" }).default(false).notNull(),
  securityScore: integer("security_score").default(75).notNull(),
  tokenVersion: integer("token_version").default(1).notNull(),
  lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
  loginStreak: integer("login_streak").default(1).notNull(),
  lastStreakDate: text("last_streak_date"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    userIdIdx: index("accounts_user_id_idx").on(table.userId),
    providerAccountIdx: uniqueIndex("provider_account_idx").on(
      table.provider,
      table.providerAccountId
    ),
  })
);

export const passwordResetTokens = sqliteTable(
  "password_reset_tokens",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
  },
  (table) => ({
    emailIdx: index("password_reset_email_idx").on(table.email),
  })
);

export const loginAttempts = sqliteTable(
  "login_attempts",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    success: integer("success", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    emailCreatedAtIdx: index("login_attempts_email_created_idx").on(
      table.email,
      table.createdAt
    ),
  })
);

export const rateLimits = sqliteTable("rate_limits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  points: integer("points").notNull().default(1),
  expireAt: integer("expire_at", { mode: "timestamp_ms" }).notNull(),
});

// ==========================================
// 2. SECURITY SCANS
// ==========================================

export const emailScans = sqliteTable(
  "email_scans",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sender: text("sender").notNull(),
    subject: text("subject").notNull(),
    contentPreview: text("content_preview").notNull(),
    contentHash: text("content_hash"),
    verdict: text("verdict", {
      enum: ["SAFE", "SUSPICIOUS", "MALICIOUS", "safe", "suspicious", "malicious"],
    }).notNull(),
    riskScore: integer("risk_score").notNull(),
    confidence: integer("confidence").default(95).notNull(),
    findings: text("findings", { mode: "json" }),
    recommendations: text("recommendations", { mode: "json" }),
    aiUsed: integer("ai_used", { mode: "boolean" }).default(true).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("email_scans_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

export const urlScans = sqliteTable(
  "url_scans",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    hostname: text("hostname").notNull(),
    verdict: text("verdict", {
      enum: ["SAFE", "SUSPICIOUS", "MALICIOUS", "UNKNOWN", "safe", "suspicious", "malicious", "unknown"],
    }).notNull(),
    riskScore: integer("risk_score").notNull(),
    sslValid: integer("ssl_valid", { mode: "boolean" }).default(true).notNull(),
    domainValid: integer("domain_valid", { mode: "boolean" }).default(true).notNull(),
    checks: text("checks", { mode: "json" }),
    intelConfigured: integer("intel_configured", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("url_scans_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

export const passwordChecks = sqliteTable(
  "password_checks",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    strengthScore: integer("strength_score").notNull(),
    strengthLabel: text("strength_label").notNull(),
    length: integer("length").notNull(),
    hasUpper: integer("has_upper", { mode: "boolean" }).notNull(),
    hasLower: integer("has_lower", { mode: "boolean" }).notNull(),
    hasNumber: integer("has_number", { mode: "boolean" }).notNull(),
    hasSymbol: integer("has_symbol", { mode: "boolean" }).notNull(),
    breached: integer("breached", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("password_checks_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

// Unified scan view / helper table for aggregated queries
export const scans = sqliteTable(
  "scans",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["email", "url", "password", "EMAIL", "URL", "PASSWORD"] }).notNull(),
    inputSummary: text("input_summary").notNull(),
    resultScore: integer("result_score").notNull(),
    verdict: text("verdict").notNull(),
    detailsJson: text("details_json").notNull(),
    threatIndicators: text("threat_indicators"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("scans_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

// ==========================================
// 3. CHAT ASSISTANT
// ==========================================

export const chatConversations = sqliteTable(
  "chat_conversations",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("chat_conversations_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

export const chatMessages = sqliteTable(
  "chat_messages",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id").references(() => chatConversations.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id").default("default"),
    role: text("role", { enum: ["USER", "ASSISTANT", "SYSTEM", "user", "assistant", "system"] }).notNull(),
    content: text("content").notNull(),
    guardrailFlagged: integer("guardrail_flagged", { mode: "boolean" }).default(false).notNull(),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    convCreatedIdx: index("chat_messages_conv_created_idx").on(
      table.conversationId,
      table.createdAt
    ),
  })
);

// ==========================================
// 4. QUIZZES & EDUCATION
// ==========================================

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty", { enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "Beginner", "Intermediate", "Advanced"] })
    .default("BEGINNER")
    .notNull(),
  category: text("category").notNull(),
  isPublished: integer("is_published", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const quizQuestions = sqliteTable(
  "quiz_questions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    quizId: text("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }),
    category: text("category").default("General"),
    difficulty: text("difficulty").default("Beginner"),
    question: text("question").notNull(),
    options: text("options", { mode: "json" }), // array of string options
    optionA: text("option_a"),
    optionB: text("option_b"),
    optionC: text("option_c"),
    optionD: text("option_d"),
    correctIndex: integer("correct_index").default(0).notNull(),
    correctOption: integer("correct_option").default(1),
    explanation: text("explanation").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    quizIdIdx: index("quiz_questions_quiz_id_idx").on(table.quizId),
  })
);

export const quizAttempts = sqliteTable(
  "quiz_attempts",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    quizId: text("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    total: integer("total").default(10).notNull(),
    totalQuestions: integer("total_questions").default(10),
    percentage: integer("percentage").default(100).notNull(),
    durationSeconds: integer("duration_seconds").default(60).notNull(),
    timeTakenSec: integer("time_taken_sec").default(60),
    passed: integer("passed", { mode: "boolean" }).default(true).notNull(),
    answers: text("answers", { mode: "json" }),
    answersJson: text("answers_json"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("quiz_attempts_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

// ==========================================
// 5. ACHIEVEMENTS & GAMIFICATION
// ==========================================

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  points: integer("points").default(50).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const userAchievements = sqliteTable(
  "user_achievements",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id").references(() => achievements.id, {
      onDelete: "cascade",
    }),
    badgeKey: text("badge_key"),
    title: text("title"),
    description: text("description"),
    icon: text("icon"),
    unlockedAt: integer("unlocked_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    userAchievementIdx: uniqueIndex("user_achievement_unique_idx").on(
      table.userId,
      table.achievementId
    ),
    userCreatedIdx: index("user_achievements_user_created_idx").on(
      table.userId,
      table.unlockedAt
    ),
  })
);

// ==========================================
// 6. ACTIVITY LOGS & NOTIFICATIONS
// ==========================================

export const activityLogs = sqliteTable(
  "activity_logs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "LOGIN",
        "LOGOUT",
        "EMAIL_SCAN",
        "URL_SCAN",
        "PASSWORD_CHECK",
        "AI_CHAT",
        "QUIZ_STARTED",
        "QUIZ_COMPLETED",
        "REPORT_GENERATED",
        "PROFILE_UPDATED",
      ],
    }).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    metadata: text("metadata", { mode: "json" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("activity_logs_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type", { enum: ["INFO", "WARNING", "SUCCESS", "DANGER"] })
      .default("INFO")
      .notNull(),
    isRead: integer("is_read", { mode: "boolean" }).default(false).notNull(),
    link: text("link"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("notifications_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

// ==========================================
// 7. SECURITY TIPS, BLOCKED DOMAINS & CONTACT
// ==========================================

export const securityTips = sqliteTable("security_tips", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  category: text("category").notNull().default("General"),
  tip: text("tip").notNull(),
  text: text("text"), // alias for backward compatibility
  action: text("action"),
  actionPrompt: text("action_prompt"),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false).notNull(),
  isDaily: integer("is_daily", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const blockedDomains = sqliteTable("blocked_domains", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  domain: text("domain").notNull().unique(),
  reason: text("reason").notNull(),
  addedBy: text("added_by").default("System").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["UNREAD", "READ", "REPLIED", "unread", "read", "replied"] })
    .default("UNREAD")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    adminId: text("admin_id"),
    userId: text("user_id"),
    userEmail: text("user_email"),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    resource: text("resource"),
    details: text("details", { mode: "json" }),
    detailsJson: text("details_json"),
    ipAddress: text("ip_address"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    adminCreatedIdx: index("audit_logs_admin_created_idx").on(
      table.adminId,
      table.createdAt
    ),
  })
);
