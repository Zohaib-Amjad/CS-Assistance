# 🎭 CyberGuard AI — Formal Use Cases Specification

---

## Use Case 1: UC-01 User Authentication & Dashboard Access
- **Primary Actor**: Registered User / SOC Analyst
- **Preconditions**: User has registered an account.
- **Trigger**: User navigates to `/login` and submits credentials.
- **Main Success Scenario**:
  1. User inputs email and password.
  2. System verifies password hash using bcrypt.
  3. System checks user account status is `ACTIVE`.
  4. System issues signed JWT session cookie.
  5. System redirects user to `/dashboard` with personalized security score and recent threat metrics.
- **Extensions / Alternative Flows**:
  - *3a. 5 consecutive failed logins*: System locks account for 10 minutes and shows error toast.
  - *3b. Account is INACTIVE or SUSPENDED*: System rejects authentication with 403 Forbidden.

---

## Use Case 2: UC-02 Email Phishing Analysis
- **Primary Actor**: User
- **Preconditions**: User is on `/dashboard/email-checker`.
- **Trigger**: User pastes raw email text and clicks "Analyze Email".
- **Main Success Scenario**:
  1. System extracts header fields, subject, and body text.
  2. System executes heuristic rules (urgency triggers, Pakistani bank keywords, sender mismatches).
  3. System computes threat score. If complex or uncertain, system prompts Gemini AI for detailed categorization.
  4. System persists sanitized record (preview + SHA-256 hash + verdict) to database.
  5. System updates user security score and displays color-coded verdict card with highlighted threat indicators.

---

## Use Case 3: UC-03 Malicious URL & SSRF Inspection
- **Primary Actor**: User
- **Preconditions**: User is on `/dashboard/url-checker`.
- **Trigger**: User inputs a target URL and clicks "Scan URL".
- **Main Success Scenario**:
  1. System checks URL protocol (only HTTP/HTTPS accepted).
  2. System resolves domain to IP addresses and checks against private/loopback/cloud metadata ranges.
  3. System checks platform blocklist for banned domains.
  4. System computes Levenshtein distance for homoglyph lookalikes (e.g. `m33zan.com`).
  5. System evaluates Safe Browsing indicators and returns comprehensive safety report.
- **Extensions**:
  - *2a. Private IP or Cloud Metadata IP resolved*: System flags SSRF attempt and blocks outbound connection.

---

## Use Case 4: UC-04 Interactive Security Quiz & Certification
- **Primary Actor**: User
- **Preconditions**: User is on `/dashboard/quiz`.
- **Trigger**: User clicks "Start Quiz".
- **Main Success Scenario**:
  1. System requests sanitized questions from `/api/quiz/start` (without correct answers).
  2. User answers questions one by one with randomized question/option order.
  3. User submits quiz on final question.
  4. System evaluates answers on the server (`/api/quiz/submit`), calculates percentage, logs attempt, and evaluates achievement unlocks.
  5. User sees result summary with per-question explanations and defense tips.

---

## Use Case 5: UC-05 SOC Admin User Management & Self-Protection
- **Primary Actor**: System Administrator
- **Preconditions**: Authenticated as `ADMIN` with active status.
- **Trigger**: Administrator accesses `/admin/users`.
- **Main Success Scenario**:
  1. Admin searches and filters users by role, plan, and status.
  2. Admin clicks "+ Add User", enters name, email, role, and temporary password.
  3. System validates input, hashes password, saves record, and logs action to `audit_logs`.
  4. Admin can export directory to CSV or edit existing users.
- **Extensions**:
  - *Admin attempts to delete or demote their own account*: System catches `adminId === targetUserId` and returns `400 Bad Request: ADMIN_CANNOT_DELETE_SELF`.
