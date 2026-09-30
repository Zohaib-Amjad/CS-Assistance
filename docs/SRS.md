# 📋 Software Requirements Specification (SRS) — CyberGuard AI

## 1. Introduction
### 1.1 Purpose
The purpose of CyberGuard AI is to provide a proactive, AI-driven cybersecurity awareness, behavioral analysis, and threat intelligence system. It combines heuristic scanning engines, artificial intelligence (Google Gemini), gamified LMS learning, and enterprise SOC administration into a single cohesive platform.

### 1.2 Scope
- Automated phishing detection for suspicious emails and Pakistani banking scams.
- Malicious URL and SSRF-resistant website safety verification.
- Zero-knowledge password entropy and breach analysis.
- Multi-turn conversational AI security advisory chatbot.
- Gamified cybersecurity training with server-graded quizzes and badge achievements.
- Administrative telemetry, audit logging, and domain blocklisting.

---

## 2. Overall Description
### 2.1 Product Perspective
CyberGuard AI operates as a modern cloud-native web application built on Next.js 14 App Router, TypeScript, TailwindCSS, Drizzle ORM, and SQLite/Turso.

### 2.2 User Classes and Characteristics
- **Standard User**: Can run scans (Email, URL, Password), take quizzes, view personal telemetry, customize profile, and consult the AI Security Copilot.
- **SOC Administrator**: Can access `/admin`, inspect aggregated platform telemetry, manage users (+Add, Edit, Deactivate, Delete), manage quiz curricula, review privacy-sanitized logs, and update malicious domain blocklists.

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization
- **FR-AUTH-01**: The system shall authenticate users via email and bcrypt-hashed passwords.
- **FR-AUTH-02**: The system shall lock accounts for 10 minutes upon 5 consecutive failed login attempts.
- **FR-AUTH-03**: The system shall support password reset tokens with session invalidation via `tokenVersion`.
- **FR-AUTH-04**: The system shall enforce role-based access control (RBAC) preventing `USER` roles from reaching `/admin` or `/api/admin/*`.

### 3.2 Email Phishing Analysis Engine
- **FR-EMAIL-01**: The system shall detect urgency phrases, credential harvesting patterns, and Pakistani bank lookalikes (HBL, Meezan, Easypaisa, JazzCash, FBR).
- **FR-EMAIL-02**: The system shall invoke Gemini AI with structured prompts when confidence threshold requires deep analysis.
- **FR-EMAIL-03**: The system shall never persist or display raw email body text in administrative logs.

### 3.3 SSRF-Resistant URL Scanner
- **FR-URL-01**: The system shall reject non-HTTP/HTTPS protocols (e.g. `file://`, `gopher://`).
- **FR-URL-02**: The system shall block loopback (`127.0.0.1`), RFC 1918 private subnets, and cloud metadata IPs (`169.254.169.254`).
- **FR-URL-03**: The system shall calculate Levenshtein distance against known authentic domains to flag typo-squatting homoglyphs.

### 3.4 Password Entropy & Security
- **FR-PASS-01**: The system shall evaluate password entropy, crack times, and NIST SP 800-63B conformance in-memory.
- **FR-PASS-02**: The system shall never save evaluated passwords to disk or database.

### 3.5 Cyber Quiz & Learning LMS
- **FR-QUIZ-01**: The system shall deliver quiz questions without answers to the client (`/api/quiz/start`).
- **FR-QUIZ-02**: The system shall grade attempts strictly server-side (`/api/quiz/submit`).
- **FR-QUIZ-03**: The system shall unlock achievement badges upon reaching score/attempt milestones.

### 3.6 SOC Admin Management
- **FR-ADM-01**: The system shall prevent administrators from deleting, debarring, or demoting themselves.
- **FR-ADM-02**: The system shall record all administrative mutations into an immutable `audit_logs` table.

---

## 4. Non-Functional Requirements
- **NFR-SEC-01**: Enforce Content Security Policy (CSP), HSTS, X-Frame-Options DENY, and noindex headers.
- **NFR-PERF-01**: Page loads and API scanner responses shall complete within $\le 2.0$ seconds under normal load.
- **NFR-RESP-01**: Application shall be fully responsive across screen widths from 320px to 1920px.
- **NFR-A11Y-01**: Interactive elements shall adhere to WCAG 2.1 AA contrast and accessibility standards with minimum 44px touch targets.
