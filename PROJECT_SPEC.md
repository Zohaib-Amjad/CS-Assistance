# CyberGuard AI — Project Specification & Architecture

## Final Year Project: AI-Powered Cyber Security Assistant
A defensive cybersecurity education platform built as a real, working, secure, responsive, Vercel-deployable full-stack Next.js web application.

---

## 1. Tech Stack (Fixed)
- **Framework**: Next.js 14+ / 15 (App Router, Server Components & Route Handlers / Server Actions)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS, shadcn/ui components, Lucide React icons, Framer Motion (subtle micro-interactions), next-themes (light/dark/system)
- **Charts**: Recharts
- **Database & ORM**: SQLite via libSQL (`@libsql/client`) + Drizzle ORM + `drizzle-kit`
  - Local dev: `TURSO_DATABASE_URL=file:./dev.db`
  - Production (Vercel): Hosted Turso (`libsql://...` + `TURSO_AUTH_TOKEN`)
- **Authentication**: Auth.js v5 (`next-auth@beta`), Credentials provider (email + password, bcryptjs cost 12), JWT sessions, Google OAuth (conditional on env vars)
- **Form & Validation**: Zod + react-hook-form
- **Client State / Fetching**: TanStack Query (where client-side fetching/caching is needed)
- **File Storage**: `lib/storage.ts` abstraction (Vercel Blob when `BLOB_READ_WRITE_TOKEN` exists, else fallback to `public/uploads/` in dev)
- **PDF Generation**: jspdf + jspdf-autotable + html-to-image (client-side export)
- **AI Integration**: AIProvider interface (`analyzeEmail()`, `answerCyberQuestion()`, `analyzeSecurityContent()`) with MockAIProvider, Gemini, OpenAI, and Anthropic providers. Default is Mock mode with a "Demo AI mode" indicator badge.
- **Testing**: Vitest (unit/integration) + Playwright (E2E)

---

## 2. Design Tokens & Visual Fidelity
Visual source of truth: 12-screen design references in `design-ref/` and `images/`.
- **Primary**: `#4F46E5` (Indigo 600)
- **Secondary**: `#7C3AED` (Violet 600)
- **Accent**: `#6366F1` (Indigo 500)
- **Buttons / Gradients**: `from-indigo-600 to-violet-600`
- **Page Background**: `#F6F7FF` (Light mode), `#0B0F19` (Dark mode)
- **Cards**: Pure white `#FFFFFF` / Dark slate `#111827`, border `#E0E4FF` / `#1E293B`, subtle shadows
- **Text**: Primary `#0F172A`, Muted `#64748B`
- **Status Colors**: Success `#16A34A` (soft green tint bg), Warning `#F59E0B` (amber tint bg), Danger `#DC2626` (rose tint bg)
- **Border Radius**: Cards `2xl` (1rem / 16px), Inputs/Buttons `xl` (0.75rem / 12px), Badges `full`

---

## 3. Routes Structure
### Public Routes
- `/` - Modern, engaging Landing Page matching 01-landing design
- `/features` - Comprehensive feature breakdown
- `/about` - About CyberGuard AI, mission, and defensive security ethos
- `/pricing` - Transparent pricing & free student tier info
- `/contact` - Contact and inquiry form (stored in DB)
- `/login` - Sign-in page with email/password + Google OAuth button
- `/signup` - Registration with live password strength requirement
- `/forgot-password` & `/reset-password` - Password recovery flow

### User Dashboard Routes
- `/dashboard` - Overview metrics, security score breakdown, recent activity, quick tool launch
- `/dashboard/email-checker` - AI & heuristic Phishing Email Detector
- `/dashboard/url-checker` - SSRF-safe URL Safety & Threat Scanner
- `/dashboard/password-checker` - 100% Client-side strength analyzer + k-Anonymity HIBP breach checker
- `/dashboard/assistant` - Defensive AI Security Chatbot with simulated interactive sessions
- `/dashboard/quiz` - Interactive Cyber Security Awareness Quiz with categories, timer, explanations
- `/dashboard/reports` - Security health report generation & instant PDF export
- `/dashboard/profile` - User profile, security score, badges, and account activity
- `/dashboard/settings` - Preferences, dark/light theme, notification & session settings

### Admin Routes
- `/admin` - System telemetry, user growth, scan logs summary
- `/admin/users` & `/admin/users/[id]` - User management, role elevation, status toggle
- `/admin/quizzes` - Quiz question creation, editing, category management
- `/admin/reports` - Platform-wide audit logs & analytics
- `/admin/email-logs` - Anonymized phishing scan logs and flag distribution
- `/admin/url-logs` - Scanned domain analysis logs
- `/admin/settings` - Global threat-intel keys, system toggles, AI provider defaults

---

## 4. Security & Architecture Permanent Rules
1. **Server-Side Authorization**: `requireAuth()`, `requireUser()`, `requireAdmin()`. Every user query strictly filtered by session user ID. Never trust client-provided IDs.
2. **DTOs & Secret Sanitization**: Never leak `passwordHash`, salts, or private API keys to clients.
3. **Standardized API Responses**: `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code": "...", "message": "..." } }`.
4. **Zod Validation**: Strict schemas shared across client forms and server endpoints.
5. **Client-Side Password Security**: Password strength and HIBP breach check run 100% client-side (k-Anonymity first 5 chars of SHA-1).
6. **SSRF-Safe URL Inspection**: Hostname resolution, loopback/private/metadata range blocking, redirect limits (max 5 hops), timeout limits.
7. **Defensive AI Safety**: Untrusted input sandboxing, markdown sanitization, defensive prompt engineering (refusal of offensive/destructive requests).
8. **DB Rate Limiting**: Persistent rate limiting in DB table `rate_limits` for auth, scanning, and AI endpoints.
