# CyberGuard AI — AI-Powered Cyber Security Assistant
### Final Year Project (FYP) — Defensive Cybersecurity Education Platform

CyberGuard AI is a real, secure, responsive, Vercel-deployable full-stack Next.js web application designed to educate users, audit password hygiene, inspect suspicious emails for phishing indicators, evaluate URL destinations with zero SSRF risk, and guide security learners with defensive AI assistance.

---

## 🌟 Key Features & Defensive Modules

### 1. 📧 AI & Heuristic Phishing Email Detector (`/dashboard/email-checker`)
- **Multi-Factor Threat Analysis**: Evaluates email text and headers across 4 distinct threat categories:
  - Urgency & manufactured panic cues
  - Credential & identity solicitation attempts
  - Brand and sender header spoofing
  - Financial lures, gift card scams, and wire requests
- **Quantitative Scoring (0–100)**: Instant threat risk index and actionable guidance.
- **Preloaded Realistic Attack Samples**: 1-click testing with PayPal fake alerts, CEO BEC gift card scams, and benign GitHub advisories.

### 2. 🌐 SSRF-Safe URL Safety Inspector (`/dashboard/url-checker`)
- **Zero-Execution Sandbox**: Inspects URLs without executing client-side scripts.
- **SSRF Boundary Protection**: Strict DNS resolution blocking access to `127.0.0.1`, RFC1918 private subnets (`10.0.0.0/8`, `192.168.0.0/16`), and cloud metadata APIs (`169.254.169.254`).
- **Domain & TLD Risk Engine**: Flags typosquatting, deceptive keywords, and high-abuse top-level domains (`.xyz`, `.top`, `.tk`).
- **Google Safe Browsing Threat Feed Hook**: Optional verified intelligence integration.

### 3. 🔑 Zero-Knowledge Password Strength & Breach Auditor (`/dashboard/password-checker`)
- **100% Client-Side Evaluation**: Plaintext passwords **never** leave your browser.
- **Shannon Entropy & GPU Crack Time**: Calculates bit entropy, composition coverage, and brute-force cracking estimates.
- **k-Anonymity HIBP Breach Verification**: Queries HaveIBeenPwned API using only the first 5 hexadecimal characters of the SHA-1 hash.
- **Cryptographic Generator**: Instant high-entropy passphrase generator.
- **Zero Plaintext Storage**: Only aggregate audit scores and entropy metrics are recorded to user history.

### 4. 🤖 Defensive AI Security Assistant (`/dashboard/assistant`)
- **Strict Defensive Guardrails**: Dedicated system prompt enforcing ethical boundaries. Refuses malware generation, unauthorized access, and credential theft requests.
- **Multi-Provider Architecture**: Seamlessly operates in **Mock AI Demo Mode** (zero API key needed), with hooks for Google Gemini, OpenAI, and Anthropic.
- **Interactive Suggestions**: Dynamic follow-up prompts to deepen conceptual understanding.

### 5. 🏆 Cyber Security Awareness Quiz (`/dashboard/quiz`)
- **10+ Curated Challenge Items**: Covering phishing, malware, ransomware, Zero Trust, and identity defense.
- **Live Stopwatch**: Real-time timer and progress indicators.
- **Flawless Celebration**: Confetti animation on 100% score and instant "Cyber Mastermind" badge unlocking.
- **Defensive Explanations**: Detailed reasoning for every correct and incorrect answer.

### 6. 📊 Security Health Reports & PDF Export (`/dashboard/reports`)
- **Comprehensive Audit Trail**: Searchable, filterable event logs across all diagnostic tools.
- **Signed PDF Export**: Instant client-side PDF document generation using `jspdf` and `jspdf-autotable`.

### 7. 🛡️ User Profile & Gamified Badges (`/dashboard/profile`)
- **Dynamic Security Posture Score (0–100)**: Recalculated dynamically based on diagnostic scans, password strength, and quiz performance.
- **Badge Shelf**: Unlocks "Shield Recruit", "Phish Hunter", "Cyber Scholar", and "Cyber Mastermind".

### 8. ⚙️ SOC Administration Portal (`/admin`)
- **Central Telemetry**: Live metrics on user volume, scan counts, and blocked malicious indicators.
- **User Directory**: Full RBAC role management and individual user diagnostic history.
- **Curriculum Manager**: Quiz question creation and difficulty grading.
- **Forensic Logs**: Raw anonymized ingestion stream for phishing and URL queries.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui + Lucide Icons + next-themes (Light & Dark mode)
- **Database & ORM**: SQLite via LibSQL (`@libsql/client`) / `better-sqlite3` + Drizzle ORM
  - Local dev: `TURSO_DATABASE_URL=file:./dev.db`
  - Production: Hosted Turso (`libsql://...`)
- **Authentication**: Auth.js v5 (`next-auth@beta`), Credentials provider (bcrypt cost 12), JWT sessions, RBAC
- **Charts & Visuals**: Recharts
- **PDF Generation**: `jspdf` + `jspdf-autotable`
- **Testing**: Vitest (Unit & Integration tests) + Playwright (E2E)

---

## 🚀 Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
```bash
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin Officer** | `admin@cyberguard.ai` | `admin123` | Full SOC Admin & User Workspace |
| **Standard User** | `user@cyberguard.ai` | `user123` | Standard Security Dashboard |

*(Both accounts feature 1-click autofill on the login screen for effortless evaluation!)*

---

## 🧪 Running Automated Tests

```bash
# Run Unit Tests with Vitest
npx vitest run
```

---

## 📂 Project Structure

```text
CS-Assistance/
├── src/
│   ├── app/
│   │   ├── (public) pages: /, /features, /about, /pricing, /contact
│   │   ├── (auth) pages: /login, /signup, /forgot-password, /reset-password
│   │   ├── dashboard/: /dashboard, /email-checker, /url-checker, /password-checker, /assistant, /quiz, /reports, /profile, /settings
│   │   ├── admin/: /admin, /users, /quizzes, /reports, /email-logs, /url-logs, /settings
│   │   └── api/: /scan/email, /scan/url, /scan/password, /quiz/submit, /chat, /contact, /admin/users
│   ├── components/
│   │   ├── ui/ (Button, Card, Badge, Progress, Table, Dialog, Dropdown, Avatar, ThemeToggle)
│   │   ├── layout/ (Sidebar, AdminSidebar, Header, PublicNav, Footer)
│   │   └── dashboard/ (DashboardCharts)
│   ├── db/ (schema.ts, index.ts, seed.ts, init-schema.ts)
│   ├── lib/
│   │   ├── detection/ (phishing.ts, url-scanner.ts, password.ts)
│   │   ├── ai/ (index.ts, providers.ts)
│   │   ├── auth.ts, auth.config.ts, auth-helpers.ts
│   │   ├── rate-limit.ts, validation.ts, utils.ts
│   └── services/ (user, scan, quiz, tip, chat, admin)
├── public/assets/ (3D Shield hero, envelope-with-magnifier, shield-with-check, user-avatar, logo)
├── design-ref/ (12 FullHD design reference screens)
├── PROJECT_SPEC.md & PROGRESS.md & DESIGN_TOKENS.md
└── package.json
```
