# 🏛️ CyberGuard AI — System Architecture & Design Blueprint

This document details the architectural design, security boundaries, component decomposition, and end-to-end data flows for the **CyberGuard AI** platform.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client Layer ["Client Tier (Browser / Mobile)"]
        UI["React 18 / TailwindCSS / Radix UI"]
        NextClient["Next.js Client Components (Hydrated State)"]
    end

    subgraph Edge Layer ["Network & Edge Security Tier"]
        Cloudflare["Edge CDN / DNS"]
        CSP["Content-Security-Policy & Security Headers"]
        Middleware["Next.js Middleware (Edge Auth & RBAC Check)"]
    end

    subgraph App Layer ["Application & API Tier (Next.js 14 App Router)"]
        AppServer["Server Components (RSC)"]
        AuthModule["NextAuth.js v5 (JWT Session & Version Verification)"]
        ScannerEngines["Threat Scanner Pipeline (Phishing, URL, Password)"]
        QuizEngine["Server-Side Quiz & Achievement Evaluator"]
        AdminService["SOC Telemetry & Audit Logging Service"]
    end

    subgraph External Layer ["External Threat Intelligence & AI Tier"]
        GeminiAPI["Google Gemini 1.5 Flash API"]
        SafeBrowsing["Google Safe Browsing & Heuristics"]
    end

    subgraph Persistence Layer ["Data & Storage Tier"]
        Drizzle["Drizzle ORM Engine"]
        DB[(SQLite / Turso libSQL Database)]
        BlobStorage["Avatar & Media Storage (Local / Vercel Blob)"]
    end

    UI --> Cloudflare
    Cloudflare --> CSP
    CSP --> Middleware
    Middleware --> AppServer
    AppServer --> AuthModule
    AppServer --> ScannerEngines
    AppServer --> QuizEngine
    AppServer --> AdminService

    ScannerEngines --> GeminiAPI
    ScannerEngines --> SafeBrowsing
    AdminService --> Drizzle
    QuizEngine --> Drizzle
    AuthModule --> Drizzle
    Drizzle --> DB
    AppServer --> BlobStorage
```

---

## 2. Authentication & Session Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Admin
    participant Client as Browser Client
    participant Auth as NextAuth.js (/api/auth)
    participant DB as Database (SQLite/Turso)

    User->>Client: Enters credentials (email, password)
    Client->>Auth: POST /api/auth/callback/credentials
    Auth->>DB: Query user by email
    DB-->>Auth: User record (passwordHash, status, role, tokenVersion)
    
    alt User Inactive or Suspended
        Auth-->>Client: Error 403 (Account Inactive / Suspended)
    else Invalid Password
        Auth->>DB: Record failed attempt count
        Auth-->>Client: Error 401 (Invalid Credentials)
    else Valid Credentials
        Auth->>Auth: Reset failed attempts, generate JWT with role & tokenVersion
        Auth-->>Client: Set secure HttpOnly session cookie
        Client->>Client: Redirect to /dashboard or /admin
    end

    Note over Client, DB: Subsequent API / Page Navigation
    Client->>Auth: Request with JWT Cookie
    Auth->>DB: Verify tokenVersion & active status in DB
    alt Token Version mismatch or DB status != ACTIVE
        Auth-->>Client: Reject (401 Unauthorized / Token Revoked)
    else Valid
        Auth-->>Client: Serve protected resource
    end
```

---

## 3. Heuristic & AI Email Phishing Analysis Flow

```mermaid
flowchart TD
    Start(["User submits email content"]) --> Sanitize["Extract Subject, Sender, Body & URLs"]
    Sanitize --> Heuristics["Execute Heuristic Threat Matrix"]
    
    subgraph Threat Matrix ["Multi-Vector Heuristic Analysis"]
        Urgency["Urgency / Threat Words (e.g. 'Account Suspended', 'Urgent Action')"]
        Lookalike["Pakistani Brand Impersonation (HBL, Meezan, Easypaisa, FBR)"]
        HeaderMismatch["Header Spoofing / Suspicious Sender TLD"]
        Links["Embedded Suspicious Link Analysis"]
    end

    Heuristics --> Urgency
    Heuristics --> Lookalike
    Heuristics --> HeaderMismatch
    Heuristics --> Links

    Urgency & Lookalike & HeaderMismatch & Links --> CombineScore["Aggregate Heuristic Threat Score (0-100)"]
    CombineScore --> CheckAI{"Confidence Threshold or AI Configured?"}
    
    CheckAI -->|Yes| CallGemini["Query Google Gemini AI with Structured Prompt"]
    CallGemini --> ParseAI["Extract AI Risk Level, Explanations & Actionable Advice"]
    CheckAI -->|No / Offline| FallbackHeuristic["Synthesize Heuristic Indicators"]

    ParseAI & FallbackHeuristic --> SaveDB["Save Scan Record to DB (Privacy Sanitized)"]
    SaveDB --> UserScore["Recompute User Security Score & Check Achievements"]
    UserScore --> ReturnVerdict(["Return Phishing Verdict & Threat Indicators to UI"])
```

---

## 4. SSRF-Resistant URL Security Scanner Flow

```mermaid
flowchart TD
    URLInput(["User Submits URL"]) --> Normalize["Normalize & Parse URL Scheme + Host"]
    Normalize --> SchemeCheck{"Scheme is HTTP or HTTPS?"}
    SchemeCheck -->|No (e.g., file://, gopher://, ftp://)| RejectSSRF["Reject: Invalid / Dangerous Protocol"]
    
    SchemeCheck -->|Yes| IPResolution["Resolve Hostname to Target IP Addresses"]
    IPResolution --> SSRFFilter{"Is IP Loopback, Private RFC1918, or Cloud Metadata?"}
    
    SSRFFilter -->|Yes (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, 169.254.169.254)| BlockSSRF["Block SSRF Attack Attempt"]
    
    SSRFFilter -->|No (Public IP)| BlocklistCheck{"Domain in Admin Blocklist?"}
    BlocklistCheck -->|Yes| BlockVerdict["Verdict: HIGH RISK / MALICIOUS (Blocklisted)"]
    
    BlocklistCheck -->|No| HeuristicRules["Analyze Brand Lookalikes, Homoglyphs & TLD Entropy"]
    HeuristicRules --> SafeBrowsing["Evaluate Google Safe Browsing / Heuristics"]
    SafeBrowsing --> FinalScore["Compute Threat Score & Security Headers"]
    FinalScore --> SaveURL["Persist Scan to url_scans Table"]
    SaveURL --> OutputResult(["Display Safety Badge & Safety Breakdown"])
```

---

## 5. SOC Admin Management & Self-Protection Guard Flow

```mermaid
flowchart TD
    AdminReq(["Admin Action (Edit Role, Deactivate, Delete)"]) --> RequireAdmin["requireAdminApi() Verification"]
    RequireAdmin --> DBCheck{"Caller is Active ADMIN in DB?"}
    
    DBCheck -->|No| DenyAdmin["403 Forbidden: Insufficient Privileges"]
    
    DBCheck -->|Yes| SelfGuard{"Target User ID == Caller Admin ID?"}
    
    SelfGuard -->|Yes (Self-Target)| ActionCheck{"Attempting Delete, Deactivation or Demotion?"}
    ActionCheck -->|Yes| BlockSelf["Reject: ADMIN_CANNOT_DELETE_SELF / DEMOTE_SELF"]
    ActionCheck -->|No (Self-Profile Update)| AllowMutation["Execute Mutation in DB"]
    
    SelfGuard -->|No (Different User)| AllowMutation
    AllowMutation --> AuditLog["Record Entry in audit_logs Table"]
    AuditLog --> Complete(["Return Success Response to Admin UI"])
```

---

## 6. Report Generation & Forensics Export Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / SOC Analyst
    participant ReportsUI as Reports Page (/dashboard/reports)
    participant API as /api/reports/scans
    participant DB as SQLite / Turso DB
    participant PDFLib as jsPDF & AutoTable Engine

    User->>ReportsUI: Selects Date Range (7d/30d/90d), Module & Risk Filter
    ReportsUI->>API: GET /api/reports/scans?timeRange=30d&module=all&risk=all
    API->>DB: Query scans with compound WHERE clauses & ordering
    DB-->>API: Filtered scan dataset (timestamps, types, verdicts, scores)
    API-->>ReportsUI: JSON payload with scan records & aggregate counts
    ReportsUI->>ReportsUI: Render interactive table & summary telemetry cards
    
    User->>ReportsUI: Clicks "Download PDF Report"
    ReportsUI->>PDFLib: Dynamically load jsPDF & jspdf-autotable
    PDFLib->>PDFLib: Generate SOC Header, Executive Summary, Threat Breakdown & Audit Table
    PDFLib-->>User: Trigger browser PDF download (CyberGuard_Security_Report.pdf)
```

---

## 7. Component Layering & Code Modularity

- **`src/app/`**: Next.js App Router presentation layer. Routes are split between authenticated user dashboard (`/dashboard/*`), public onboarding (`/`, `/login`, `/signup`), and SOC management (`/admin/*`).
- **`src/services/`**: Pure business logic modules isolated from HTTP request objects. Every service can be tested directly with unit tests without mocking Next.js server context.
- **`src/db/`**: Schema definitions, Drizzle ORM client initialization, migration configuration, and seed scripts.
- **`src/lib/`**: Reusable security primitives including password hashing, token validation, rate limiters, SSRF checkers, and avatar storage wrappers.
- **`src/components/ui/`**: Headless, accessible Radix UI component primitives wrapped with CyberGuard AI design tokens.
