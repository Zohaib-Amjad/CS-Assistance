# 🌐 CyberGuard AI — REST API Reference Specification

All endpoints communicate via JSON over HTTPS. Authenticated routes require an active NextAuth session cookie (or `Authorization: Bearer <JWT>` header).

---

## 📑 Table of Endpoints

- [Authentication & Account Recovery](#1-authentication--account-recovery)
- [Threat Intelligence & Scanners](#2-threat-intelligence--scanners)
- [Cyber Training & Quizzes](#3-cyber-training--quizzes)
- [User Profile & Settings](#4-user-profile--settings)
- [AI Assistant & Counseling](#5-ai-assistant--counseling)
- [Reports & Forensics](#6-reports--forensics)
- [Admin Telemetry & User Management](#7-admin-telemetry--user-management)

---

## 1. Authentication & Account Recovery

### `POST /api/auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": { "id": "user-uuid", "email": "jane@example.com", "name": "Jane Doe" }
  }
  ```

### `POST /api/auth/forgot-password`
Generates a secure password reset token.
- **Request Body**: `{ "email": "jane@example.com" }`
- **Response `200 OK`**: `{ "success": true, "message": "Password reset instructions sent." }`

### `POST /api/auth/reset-password`
Resets password using a validated token and invalidates previous sessions.
- **Request Body**:
  ```json
  {
    "token": "valid-reset-token",
    "newPassword": "BrandNewSecurePassword123!"
  }
  ```
- **Response `200 OK`**: `{ "success": true, "message": "Password has been successfully updated." }`

---

## 2. Threat Intelligence & Scanners

### `POST /api/scan/email`
Executes heuristic and AI phishing analysis on raw email text.
- **Authentication**: Optional (saves to user history if authenticated).
- **Request Body**:
  ```json
  {
    "rawText": "Subject: URGENT Account Suspended\nPlease click http://fake-bank-login.com to verify."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "verdict": "PHISHING",
      "riskScore": 88,
      "riskLevel": "HIGH",
      "indicators": [
        "Urgency trigger phrases detected ('account suspended')",
        "Unverified domain link in email body"
      ],
      "recommendations": ["Do not click links", "Report to IT Security"]
    }
  }
  ```

### `POST /api/scan/url`
Performs SSRF defense, lookalike homoglyph evaluation, and reputation checks.
- **Request Body**: `{ "url": "https://secure-login-easypaisa-bonus.xyz" }`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "url": "https://secure-login-easypaisa-bonus.xyz",
      "verdict": "MALICIOUS",
      "riskScore": 92,
      "riskLevel": "CRITICAL",
      "isSafe": false,
      "threatType": "Brand Impersonation (Easypaisa)",
      "checks": {
        "ssrfPassed": true,
        "isIpAddress": false,
        "levenshteinMatch": "easypaisa.com.pk (distance: 5)",
        "inBlocklist": false
      }
    }
  }
  ```

### `POST /api/scan/password`
Audits password entropy, character diversity, and dictionary attack patterns.
- **Request Body**: `{ "password": "UserSuppliedPassword123!" }`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "score": 3,
      "strength": "STRONG",
      "crackTime": "3 centuries",
      "entropyBits": 64.2,
      "feedback": ["Avoid common year suffixes", "Good character variety"]
    }
  }
  ```

---

## 3. Cyber Training & Quizzes

### `GET /api/quiz/quizzes`
Returns all published quizzes with category, difficulty, question count, and user best score.

### `POST /api/quiz/start`
Initializes a quiz session and returns sanitized questions **without correct answers**.
- **Request Body**: `{ "quizId": "quiz-uuid" }`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "attemptId": "attempt-uuid",
      "quizTitle": "Phishing & Social Engineering Defense",
      "questions": [
        {
          "id": "q-1",
          "question": "What is the primary indicator of a spear phishing email?",
          "options": ["A. Generic greeting", "B. Highly targeted personal context", "C. Missing subject", "D. Broken HTML"]
        }
      ]
    }
  }
  ```

### `POST /api/quiz/submit`
Grades the quiz attempt on the server, saves score, and checks achievements.
- **Request Body**:
  ```json
  {
    "attemptId": "attempt-uuid",
    "quizId": "quiz-uuid",
    "answers": { "q-1": 1, "q-2": 0 },
    "timeSpentSeconds": 145
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "score": 9,
      "totalQuestions": 10,
      "percentage": 90,
      "passed": true,
      "review": [
        {
          "questionId": "q-1",
          "userAnswer": 1,
          "correctAnswer": 1,
          "isCorrect": true,
          "explanation": "Spear phishing targets specific individuals with customized information."
        }
      ],
      "unlockedAchievements": ["Security Expert"]
    }
  }
  ```

---

## 4. User Profile & Settings

### `GET /api/user/profile` | `PATCH /api/user/profile`
Fetches or updates user display name, bio, phone, country, and security score.

### `POST /api/user/avatar`
Uploads a user avatar image (validates MIME `image/jpeg`, `image/png`, `image/webp` $\le$ 2MB).

### `POST /api/user/change-password`
Changes current user password and increments `tokenVersion` to invalidate active tokens.

---

## 5. AI Assistant & Counseling

### `POST /api/chat`
Sends a message to the Gemini AI Security Copilot with conversation context.
- **Request Body**:
  ```json
  {
    "conversationId": "conv-uuid",
    "message": "How do I secure my home Wi-Fi network from unauthorized access?"
  }
  ```
- **Response `200 OK`**: Returns AI response with defensive security recommendations.

---

## 6. Reports & Forensics

### `GET /api/reports/scans`
Returns paginated, filterable scan history for the authenticated user.
- **Query Params**: `timeRange` (`7d` | `30d` | `90d` | `all`), `module` (`email` | `url` | `password` | `all`), `risk` (`low` | `medium` | `high` | `all`).

---

## 7. Admin Telemetry & User Management

*All admin routes require an active session with `role === 'ADMIN'` and `status === 'ACTIVE'`.*

### `GET /api/admin/metrics`
Returns aggregate platform telemetry (Total Users, Active Users, Total Scans, Threats Detected, Quizzes Completed, Average Score, Quiz Pass Rate, 7-day trends).

### `GET /api/admin/users` | `POST /api/admin/users`
Lists users with search, role/plan/status filters, and pagination, or creates a new user.

### `GET /api/admin/users/[id]` | `PATCH /api/admin/users/[id]` | `DELETE /api/admin/users/[id]`
Fetches user details with privacy-safe activity trace, edits profile/role, or deactivates/deletes account (with self-protection guards).

### `GET /api/admin/settings/blocked-domains` | `POST` | `DELETE`
Manages the platform-wide malicious domain blacklist.
