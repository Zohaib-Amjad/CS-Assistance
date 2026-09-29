# 🗄️ CyberGuard AI — Database Architecture & ERD Specification

CyberGuard AI uses **Drizzle ORM** with a portable schema supporting **local SQLite** (`better-sqlite3` / `cyberguard.db`) and **Turso libSQL** (`@libsql/client`) for serverless cloud deployments.

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ EMAIL_SCANS : "performs"
    USERS ||--o{ URL_SCANS : "submits"
    USERS ||--o{ PASSWORD_CHECKS : "evaluates"
    USERS ||--o{ SCANS : "records"
    USERS ||--o{ QUIZ_ATTEMPTS : "takes"
    USERS ||--o{ USER_ACHIEVEMENTS : "earns"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ CHAT_CONVERSATIONS : "starts"
    USERS ||--o{ AUDIT_LOGS : "triggers_admin"

    QUIZZES ||--|{ QUIZ_QUESTIONS : "contains"
    QUIZZES ||--o{ QUIZ_ATTEMPTS : "graded_in"

    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : "unlocked_as"

    CHAT_CONVERSATIONS ||--|{ CHAT_MESSAGES : "holds"

    USERS {
        text id PK
        text name
        text email UK
        text password_hash
        text role
        text plan
        text status
        integer security_score
        integer token_version
        text avatar_url
        integer login_streak
        text phone
        text country
        text bio
        integer failed_login_attempts
        datetime lockout_until
        datetime created_at
        datetime updated_at
    }

    EMAIL_SCANS {
        text id PK
        text user_id FK
        text input_summary
        text content_hash
        text verdict
        integer result_score
        text risk_level
        text indicators
        text recommendations
        datetime created_at
    }

    URL_SCANS {
        text id PK
        text user_id FK
        text url
        text domain
        text verdict
        integer risk_score
        text risk_level
        integer is_safe
        text threat_type
        text security_headers
        datetime created_at
    }

    PASSWORD_CHECKS {
        text id PK
        text user_id FK
        integer score
        text strength
        text crack_time
        real entropy_bits
        text feedback
        datetime created_at
    }

    SCANS {
        text id PK
        text user_id FK
        text type
        text target
        text verdict
        integer score
        text risk_level
        text details
        datetime created_at
    }

    QUIZZES {
        text id PK
        text title
        text description
        text category
        text difficulty
        integer is_published
        datetime created_at
        datetime updated_at
    }

    QUIZ_QUESTIONS {
        text id PK
        text quiz_id FK
        text question
        text options
        integer correct_answer
        text explanation
        integer order_num
    }

    QUIZ_ATTEMPTS {
        text id PK
        text user_id FK
        text quiz_id FK
        integer score
        integer total_questions
        integer percentage
        integer passed
        integer time_spent_seconds
        datetime created_at
    }

    ACHIEVEMENTS {
        text id PK
        text key UK
        text title
        text description
        text icon
        integer max_progress
    }

    USER_ACHIEVEMENTS {
        text id PK
        text user_id FK
        text achievement_id FK
        integer progress
        integer is_unlocked
        datetime unlocked_at
    }

    BLOCKED_DOMAINS {
        text id PK
        text domain UK
        text category
        text reason
        datetime created_at
    }

    AUDIT_LOGS {
        text id PK
        text admin_id FK
        text action
        text target_type
        text target_id
        text details
        text ip_address
        datetime created_at
    }
```

---

## 2. Table Specifications & Indexes

### `users`
- **Primary Key**: `id` (text UUID)
- **Unique Indexes**: `users_email_idx` on `email`
- **Fields**:
  - `role`: `'USER'` | `'ADMIN'`
  - `plan`: `'FREE'` | `'PREMIUM'` | `'ENTERPRISE'`
  - `status`: `'ACTIVE'` | `'INACTIVE'` | `'SUSPENDED'`
  - `token_version`: Integer incremented on password resets / deactivations to invalidate active JWTs.

### `email_scans`
- **Foreign Key**: `user_id` $\to$ `users.id` (`ON DELETE SET NULL`)
- **Privacy Guarantees**: Raw email body is omitted. Stores only `input_summary` (sanitized header/preview), `content_hash` (SHA-256), `verdict`, and `risk_level`.

### `url_scans`
- **Foreign Key**: `user_id` $\to$ `users.id` (`ON DELETE SET NULL`)
- **Index**: `url_scans_domain_idx` on `domain` for fast reputation lookups.

### `quizzes` & `quiz_questions`
- **Cascade**: `quiz_questions.quiz_id` $\to$ `quizzes.id` (`ON DELETE CASCADE`).
- **Options**: JSON-serialized string array `["Option A", "Option B", "Option C", "Option D"]`.

### `audit_logs`
- **Foreign Key**: `admin_id` $\to$ `users.id` (`ON DELETE SET NULL`)
- **Purpose**: Non-repudiation audit trail for user role promotions, deactivations, domain blocklist changes, and policy modifications.

---

## 3. Database Management Commands

```bash
# Push schema updates directly to the connected database
npm run db:push

# Generate Drizzle migration SQL files
npm run db:generate

# Execute pending migrations
npm run db:migrate

# Seed database with realistic demo accounts and threat records
npm run db:seed

# Open local Drizzle Studio GUI
npm run db:studio
```
