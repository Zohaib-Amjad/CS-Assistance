# 🔒 CyberGuard AI — Security Policy & Threat Model

CyberGuard AI is built under a **Defense-in-Depth** and **Zero-Trust** security architecture. This document outlines the security controls, threat mitigations, cryptographic standards, and vulnerability handling policies implemented across the application.

---

## 1. Threat Model & STRIDE Analysis

| STRIDE Category | Threat Description | CyberGuard AI Defense Implementation |
|---|---|---|
| **Spoofing** | Attacker impersonates an admin or forged session token. | - NextAuth JWT with HMAC-SHA256 signature.<br>- `tokenVersion` stored in the database; immediately invalidated upon password change or debarment.<br>- `requireAdminApi()` re-queries the database for live status (`ACTIVE`) and role (`ADMIN`) on every request. |
| **Tampering** | User modifies quiz questions/answers on client side or alters scan scores. | - Server-side quiz grading: `/api/quiz/start` strips answers, correct choices, and explanations.<br>- Scoring is strictly evaluated on `/api/quiz/submit` on the server.<br>- Immutable `audit_logs` table for administrative operations. |
| **Repudiation** | Admin performs malicious user deactivation or data deletion and denies action. | - Mandatory audit logging via `recordAuditLog()` for every create, update, delete, or setting mutation with admin ID, action type, IP, and timestamp. |
| **Information Disclosure** | Sensitive raw email text, user passwords, or tokens leaked in logs or client responses. | - Password hashing with bcrypt (10 rounds).<br>- Passwords entered into the analyzer are evaluated in-memory only and **never persisted** to disk or sent in telemetry.<br>- Email logs omit raw email bodies; only SHA-256 hashes and redacted previews are retained.<br>- Strict `Content-Security-Policy` and `noindex` headers. |
| **Denial of Service** | Flooding scanner endpoints or brute-forcing authentication. | - Sliding-window rate limiting on all public API endpoints and scan triggers.<br>- Account lockout for 10 minutes following consecutive failed login attempts.<br>- Lazy-loaded heavy charting and PDF libraries to prevent client thread exhaustion. |
| **Elevation of Privilege** | Standard `USER` attempts to access `/admin` or delete other administrators. | - Dual-layer RBAC at Next.js middleware and route handler levels.<br>- Self-protection guards: Admins cannot delete, debar, or demote themselves. |

---

## 2. Server-Side Request Forgery (SSRF) Defense

To prevent attackers from using the URL Scanner (`/dashboard/url-checker`) to probe internal infrastructure, loopback addresses, or cloud metadata endpoints:

1. **Protocol Whitelisting**: Only `http://` and `https://` schemes are accepted. Protocols like `file://`, `gopher://`, `ftp://`, or `dict://` are immediately rejected.
2. **IP Resolution & Private Range Blocking**:
   - Hostnames are resolved to IP addresses before initiating network operations.
   - Any IP matching the following ranges is strictly blocked:
     - `127.0.0.0/8` (Loopback)
     - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (RFC 1918 Private Networks)
     - `169.254.169.254` (AWS/GCP/Azure Cloud Metadata API)
     - `::1`, `fc00::/7`, `fe80::/10` (IPv6 loopback and link-local)
3. **Redirection Limit**: HTTP redirects are capped at 3 hops, with each subsequent hop re-validated against the SSRF filter.

---

## 3. Prompt Injection & AI Guardrails

The AI Security Assistant (`/dashboard/assistant`) interacts with large language models. The following mitigations prevent prompt injection and jailbreaking:

- **System Rule Encapsulation**: The system prompt strictly frames the model's persona as a defensive cybersecurity advisor.
- **Delimiter Isolation**: User inputs are demarcated using strict boundary delimiters to prevent prompt override attacks.
- **Topic Enforcement**: Prompts attempting to generate malicious exploit payloads, keyloggers, or phishing templates trigger a defensive refusal fallback.

---

## 4. Content Security Policy (CSP) & HTTP Headers

Enforced via `next.config.mjs`:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://generativelanguage.googleapis.com https://*.turso.io; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Robots-Tag: noindex, nofollow, noarchive (on /admin/*, /dashboard/*, /api/*)
```

---

## 5. Vulnerability Reporting Policy

If you discover a security vulnerability in CyberGuard AI, please report it responsibly:
- **Email**: `security@cyberguard.local` or create a private security advisory.
- Please include steps to reproduce the issue, attack vectors, and proof-of-concept payloads.
- We aim to acknowledge reports within 24 hours and release patches within 72 hours.
