# 🎓 CyberGuard AI — FYP Defense & Viva Voce Preparation Guide

---

## 📌 1. Project Elevator Pitch (1-Minute Summary)
> "CyberGuard AI is a Next-Gen, AI-driven cybersecurity defense and awareness platform. It tackles the #1 root cause of security breaches—human error and social engineering—by uniting real-time heuristic email phishing detection, SSRF-resistant URL intelligence, zero-knowledge password entropy auditing, an interactive Gemini AI security copilot, gamified LMS training, and enterprise SOC administration into a single high-performance Next.js 14 architecture."

---

## ❓ 2. Core Architectural Questions & Examiner FAQs

### Q1: Why did you choose Next.js 14 App Router over a traditional React SPA + Express.js backend?
**Answer:**
- **Unified Security Boundary**: React Server Components (RSC) and Server Actions allow sensitive database logic, rate limiters, and AI secret keys (`GEMINI_API_KEY`) to run strictly on the server without exposing API endpoints or bundle logic to the client.
- **Performance & SEO**: Hybrid static/dynamic rendering delivers sub-100ms First Contentful Paint (FCP) and optimal metadata/OpenGraph generation.
- **Edge Middleware**: Next.js middleware executes before requests hit the rendering engine, enabling instantaneous JWT and RBAC enforcement.

### Q2: How does your Email Phishing Detection Engine work without relying exclusively on AI?
**Answer:**
- We implemented a **Hybrid Heuristic + AI Pipeline**:
  1. **Deterministic Heuristics (Rule Engine)**: Evaluates urgency indicators, spoofed headers, financial trigger words, and targeted Pakistani brand lookalikes (HBL, Meezan, Easypaisa, JazzCash, FBR).
  2. **Machine Learning / AI Fallback**: If the heuristic score is ambiguous or requires deep linguistic analysis, Google Gemini AI is invoked with a structured prompt.
  3. **Privacy by Design**: Raw email body text is evaluated in-memory and omitted from administrative tables to protect user confidentiality.

### Q3: How do you prevent Server-Side Request Forgery (SSRF) when scanning user-submitted URLs?
**Answer:**
- We enforce strict **Defense-in-Depth validation**:
  - **Protocol Filtering**: Rejection of non-HTTP/HTTPS schemes (e.g. `file://`, `gopher://`).
  - **DNS Resolution & Subnet Filtering**: Resolving the domain to IP addresses and checking against loopback (`127.0.0.1`), RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata services (`169.254.169.254`).
  - **Redirect Limiting**: Following at most 3 redirects and re-checking every hop.

### Q4: How is User Authentication protected against Session Hijacking and Tampering?
**Answer:**
- **NextAuth.js v5 with JWT**: Authenticated sessions use cryptographically signed tokens (HMAC-SHA256) stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- **Database Status Re-checks**: On every privileged request (`requireAdminApi`), the system queries the live database to verify that the account is active and retains its admin role.
- **Token Versioning (`tokenVersion`)**: Any password reset or account deactivation increments the user's `tokenVersion` in the DB, immediately revoking all issued JWTs.
- **Brute-Force Lockout**: 5 failed login attempts trigger an automated 10-minute cooldown period.

### Q5: How is your database designed to support both local development and cloud serverless deployments?
**Answer:**
- We use **Drizzle ORM** configured with an interchangeable driver:
  - In local development, it runs over `better-sqlite3` with a local `cyberguard.db` file.
  - In production (e.g. Vercel), it connects seamlessly to **Turso libSQL** via `@libsql/client` over WebSocket/HTTP. This resolves the limitation of ephemeral read-only serverless filesystems while retaining sub-millisecond SQLite query performance.

### Q6: How does the gamified quiz prevent students from cheating by inspecting network traffic or React state?
**Answer:**
- **Server-Side Grading**: The endpoint `/api/quiz/start` strips all correct answers, explanations, and flags from the JSON payload.
- Grading is calculated entirely on the server via `/api/quiz/submit`. Questions and options are also randomized per attempt.

---

## 🎯 3. Demonstration Checklist for Viva

1. **User Journey**:
   - Register new user $\to$ login with demo account $\to$ view dynamic security score.
   - Scan phishing email mimicking a fake banking urgency warning $\to$ observe risk breakdown.
   - Scan a malicious lookalike URL (`easypalssa.com`) $\to$ observe Levenshtein distance match.
   - Test password entropy meter $\to$ verify offline crack calculation.
   - Take interactive Cyber Quiz $\to$ achieve $\ge 90\%$ $\to$ unlock "Security Expert" achievement.
   - Download comprehensive SOC Security Audit PDF report.
2. **Admin Journey**:
   - Log in as Admin $\to$ inspect live telemetry & 7-day velocity charts.
   - View `/admin/users` $\to$ search, filter, export to CSV $\to$ show self-deletion guard rejection.
   - View `/admin/settings` $\to$ add a blocked domain $\to$ check AI provider diagnostics.
