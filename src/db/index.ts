import * as schema from "./schema";
import path from "path";

const databaseUrl = process.env.TURSO_DATABASE_URL || "file:./cyberguard.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

function initDirectSqliteTables(sqlite: any) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      image TEXT,
      phone TEXT,
      country TEXT DEFAULT 'Pakistan',
      bio TEXT,
      role TEXT DEFAULT 'USER' NOT NULL,
      plan TEXT DEFAULT 'FREE' NOT NULL,
      status TEXT DEFAULT 'ACTIVE' NOT NULL,
      two_fa_enabled INTEGER DEFAULT 0 NOT NULL,
      security_score INTEGER DEFAULT 75 NOT NULL,
      token_version INTEGER DEFAULT 1 NOT NULL,
      last_login_at INTEGER,
      login_streak INTEGER DEFAULT 1 NOT NULL,
      last_streak_date TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      used_at INTEGER
    );`,
    `CREATE TABLE IF NOT EXISTS login_attempts (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      success INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS rate_limits (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      points INTEGER DEFAULT 1 NOT NULL,
      expire_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS email_scans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sender TEXT NOT NULL,
      subject TEXT NOT NULL,
      content_preview TEXT NOT NULL,
      content_hash TEXT,
      verdict TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      confidence INTEGER DEFAULT 95 NOT NULL,
      findings TEXT,
      recommendations TEXT,
      ai_used INTEGER DEFAULT 1 NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS url_scans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      hostname TEXT NOT NULL,
      verdict TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      ssl_valid INTEGER DEFAULT 1 NOT NULL,
      domain_valid INTEGER DEFAULT 1 NOT NULL,
      checks TEXT,
      intel_configured INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS password_checks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      strength_score INTEGER NOT NULL,
      strength_label TEXT NOT NULL,
      length INTEGER NOT NULL,
      has_upper INTEGER NOT NULL,
      has_lower INTEGER NOT NULL,
      has_number INTEGER NOT NULL,
      has_symbol INTEGER NOT NULL,
      breached INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      input_summary TEXT NOT NULL,
      result_score INTEGER NOT NULL,
      verdict TEXT NOT NULL,
      details_json TEXT NOT NULL,
      threat_indicators TEXT,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS chat_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT REFERENCES chat_conversations(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT DEFAULT 'default',
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      guardrail_flagged INTEGER DEFAULT 0 NOT NULL,
      metadata_json TEXT,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT DEFAULT 'BEGINNER' NOT NULL,
      category TEXT NOT NULL,
      is_published INTEGER DEFAULT 1 NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
      category TEXT DEFAULT 'General',
      difficulty TEXT DEFAULT 'Beginner',
      question TEXT NOT NULL,
      options TEXT,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_index INTEGER DEFAULT 0 NOT NULL,
      correct_option INTEGER DEFAULT 1,
      explanation TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      total INTEGER DEFAULT 10 NOT NULL,
      total_questions INTEGER DEFAULT 10,
      percentage INTEGER DEFAULT 100 NOT NULL,
      duration_seconds INTEGER DEFAULT 60 NOT NULL,
      time_taken_sec INTEGER DEFAULT 60,
      passed INTEGER DEFAULT 1 NOT NULL,
      answers TEXT,
      answers_json TEXT,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      points INTEGER DEFAULT 50 NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
      badge_key TEXT,
      title TEXT,
      description TEXT,
      icon TEXT,
      unlocked_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata TEXT,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'INFO' NOT NULL,
      is_read INTEGER DEFAULT 0 NOT NULL,
      link TEXT,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS security_tips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'General' NOT NULL,
      tip TEXT NOT NULL,
      text TEXT,
      action TEXT,
      action_prompt TEXT,
      is_featured INTEGER DEFAULT 0 NOT NULL,
      is_daily INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS blocked_domains (
      id TEXT PRIMARY KEY,
      domain TEXT NOT NULL UNIQUE,
      reason TEXT NOT NULL,
      added_by TEXT DEFAULT 'System' NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'UNREAD' NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      resource TEXT,
      details TEXT,
      details_json TEXT,
      ip_address TEXT,
      created_at INTEGER NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_email_scans_user_created ON email_scans(user_id, created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_url_scans_user_created ON url_scans(user_id, created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_password_checks_user_created ON password_checks(user_id, created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_created ON quiz_attempts(user_id, created_at);`
  ];

  for (const stmt of statements) {
    try {
      sqlite.exec(stmt);
    } catch {
      // Ignored if already created
    }
  }
}

function initDb() {
  if (databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("https://") || (authToken && authToken.length > 0)) {
    const { createClient } = require("@libsql/client/web");
    const { drizzle } = require("drizzle-orm/libsql");
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    });
    return drizzle(client, { schema });
  } else {
    // Local SQLite database via better-sqlite3 with absolute path resolution
    const Database = require("better-sqlite3");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const rawPath = databaseUrl.replace("file:", "").replace(/^\.\//, "");
    const dbFilePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
    const sqlite = new Database(dbFilePath);
    sqlite.pragma("journal_mode = WAL");
    initDirectSqliteTables(sqlite);
    return drizzle(sqlite, { schema });
  }
}

export const db = initDb();

