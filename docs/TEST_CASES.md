# 🧪 CyberGuard AI — Comprehensive Manual & Automated Test Suite (30+ Test Cases)

| Test Case ID | Test Category | Title / Objective | Preconditions & Inputs | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-SEC-01** | Security | Inactive user login rejection | User status is `INACTIVE` in DB | Login rejected with 403 / Inactive account toast | ✅ Passed |
| **TC-SEC-02** | Security | Account lockout on 5 failed attempts | 5 invalid password submissions | 6th attempt rejected with "Locked for 10 minutes" | ✅ Passed |
| **TC-SEC-03** | Security | Token invalidation on password change | Password changed via `/api/user/change-password` | Old JWT session cookie rejected (tokenVersion mismatch) | ✅ Passed |
| **TC-SEC-04** | Security | SSRF loopback IP blocking | Scan `http://127.0.0.1:8080/admin` | Rejected with SSRF blocked warning; no socket connection | ✅ Passed |
| **TC-SEC-05** | Security | SSRF cloud metadata blocking | Scan `http://169.254.169.254/latest/meta-data` | Blocked immediately with high risk indicator | ✅ Passed |
| **TC-SEC-06** | Security | SSRF RFC 1918 private network block | Scan `http://192.168.1.1/router-login` | Blocked immediately as private subnet | ✅ Passed |
| **TC-SEC-07** | Security | Non-HTTP protocol rejection | Scan `file:///etc/passwd` or `gopher://127.0.0.1` | Rejected: "Only http and https protocols supported" | ✅ Passed |
| **TC-SEC-08** | Security | Admin self-deletion guard | Admin clicks delete on their own user row | Rejected with `ADMIN_CANNOT_DELETE_SELF` | ✅ Passed |
| **TC-SEC-09** | Security | Admin self-demotion guard | Admin attempts to update own role to `USER` | Rejected with `ADMIN_CANNOT_DEMOTE_SELF` | ✅ Passed |
| **TC-SEC-10** | Security | Regular user admin access block | User role `USER` visits `/admin` | Redirected to `/dashboard` / API returns 403 Forbidden | ✅ Passed |
| **TC-SEC-11** | Security | Zero password logging | Submit complex password to analyzer | Password is NOT found in server console, disk, or logs | ✅ Passed |
| **TC-SEC-12** | Security | Privacy email logging | Submit phishing email to analyzer | Admin email log shows only SHA-256 hash & summary preview | ✅ Passed |
| **TC-SEC-13** | Security | CSP header enforcement | Inspect HTTP response headers | `Content-Security-Policy` and `X-Frame-Options: DENY` present | ✅ Passed |
| **TC-SEC-14** | Security | Noindex on protected routes | Inspect headers on `/dashboard` or `/admin` | `X-Robots-Tag: noindex, nofollow, noarchive` present | ✅ Passed |
| **TC-FUNC-15** | Functional | User registration flow | Valid name, unique email, strong password | User created in DB; redirected to login/dashboard | ✅ Passed |
| **TC-FUNC-16** | Functional | Email urgency phrase detection | Email containing "URGENT Account Suspended" | Risk score $\ge 70$, urgency indicator highlighted | ✅ Passed |
| **TC-FUNC-17** | Functional | Pakistani bank scam detection | Email mimicking HBL or Meezan Bank login | Brand impersonation indicator flagged | ✅ Passed |
| **TC-FUNC-18** | Functional | Homoglyph lookalike detection | URL `https://easypalssa-login.com` | Flagged as typosquatting `easypaisa.com.pk` | ✅ Passed |
| **TC-FUNC-19** | Functional | Blocklisted domain detection | URL matching admin blocklisted domain | Flagged as MALICIOUS / Blocklisted | ✅ Passed |
| **TC-FUNC-20** | Functional | Password entropy evaluation | Test `password123` vs `K9#m$X8!vL2@` | `password123` = WEAK (0); complex = STRONG (4) | ✅ Passed |
| **TC-FUNC-21** | Functional | Quiz question sanitization | Inspect `/api/quiz/start` response | Correct answers, explanations, and flags are omitted | ✅ Passed |
| **TC-FUNC-22** | Functional | Quiz server-side grading | Submit answers to `/api/quiz/submit` | Accurately calculates score & percentage on backend | ✅ Passed |
| **TC-FUNC-23** | Functional | Achievement unlock on milestone | Complete 5 quizzes | "Quiz Master" badge unlocks; notification created | ✅ Passed |
| **TC-FUNC-24** | Functional | AI Assistant conversation | Submit "How to prevent ransomware?" | Returns defensive cybersecurity guidance via Gemini | ✅ Passed |
| **TC-FUNC-25** | Functional | Avatar upload MIME validation | Upload 1MB `.png` vs `.exe` | PNG succeeds; executable rejected with 400 | ✅ Passed |
| **TC-FUNC-26** | Functional | Avatar file size restriction | Upload 5MB image file | Rejected: "File exceeds 2 MB limit" | ✅ Passed |
| **TC-FUNC-27** | Functional | Admin user creation (+Add User) | Admin submits new user modal form | User saved with hashed temp password; audit logged | ✅ Passed |
| **TC-FUNC-28** | Functional | Admin user filter and search | Search by "Amna", filter by `PREMIUM` | Table updates with matching records | ✅ Passed |
| **TC-FUNC-29** | Functional | Admin CSV directory export | Click "Export CSV" on `/admin/users` | CSV file generated and downloaded in browser | ✅ Passed |
| **TC-FUNC-30** | Functional | Forensic PDF report generation | Click "Download PDF" on `/dashboard/reports` | Formatted PDF with SOC telemetry downloaded | ✅ Passed |
| **TC-RESP-31** | Responsive | Mobile view (390px viewport) | Resize browser to iPhone 12 width | Navigation collapses to drawer; no horizontal scroll | ✅ Passed |
| **TC-RESP-32** | Responsive | Tablet view (768px viewport) | Resize browser to iPad width | Grid adjusts from 3 columns to 1-2 columns cleanly | ✅ Passed |
| **TC-A11Y-33** | A11y & UI | Dark / Light theme toggle | Toggle theme button in navigation | Classes update without flashing; contrast maintained | ✅ Passed |
