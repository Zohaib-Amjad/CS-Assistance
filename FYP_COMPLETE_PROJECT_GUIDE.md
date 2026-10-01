# 🛡️ CyberGuard AI — Complete FYP Project Guide & Viva Preparation
*(Roman Urdu & English Guide — Final Year Project Defense)*

---

## 📌 1. Project Overview & Introduction (Project Kya Hai?)

**CyberGuard AI** ek modern **AI-Powered Defensive Cybersecurity Intelligence & Awareness Platform** hai. 

### 🎯 Problem Statement (Yeh Kyun Banaya Gaya?):
Aaj kal online users aur organizations par cyber attacks bohat tezi se barh rahe hain:
- Log fake phishing emails ko pehchan nahi pate aur apna data/paisa ganwa dete hain.
- Malicious URLs aur brand lookalike links (e.g. `paypa1.com`, `easypaisa-verify.top`) se logon ke credentials chori hote hain.
- Weak ya leaked passwords ki wajah se accounts hack hote hain.
- General logon ko cybersecurity ki basic training nahi hoti.

### 💡 Our Solution (CyberGuard AI Kya Karta Hai?):
CyberGuard AI in saare masail ko aik hi centralized, intelligent platform par solve karta hai. Yeh users ko 5 powerful defense tools, AI educational assistant, gamified quizzes, aur automated audit reporting provide karta hai.

---

## 🏗️ 2. Technology Stack & Architecture (Tech Stack Kya Hai?)

Examiner ko batane ke liye technical stack:

| Component | Technology Used | Kyun Use Kiya? (Rationale) |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | Fast Server-Side Rendering (SSR), Modern React 18, Server Actions, SEO Optimized |
| **Language** | **TypeScript** | Type-safety, zero runtime type errors, maintainable enterprise-grade code |
| **Styling & UI** | **Tailwind CSS + Radix UI + Lucide** | High-contrast modern glassmorphic theme, dark/light mode support, accessible UI components |
| **Database & ORM** | **SQLite / Turso + Drizzle ORM** | High-performance, lightweight, type-safe schema with zero overhead |
| **Authentication** | **NextAuth.js v5 (Auth.js)** | Secure session management, bcrypt password hashing, Role-Based Access Control (RBAC) |
| **AI Integration** | **Google Gemini 3.8-Flash REST API** | Real-time generative reasoning, threat analysis, aur offline resilient knowledge engine |
| **Testing Framework** | **Vitest** | Unit & Integration tests (79/79 passing automated tests) |
| **PDF Generation** | **jsPDF + jsPDF-AutoTable** | Dynamic client-side cryptographically styled audit reports export |

---

## 🚀 3. Step-by-Step Localhost Setup (Project Ko Localhost Par Kaise Chalana Hai?)

### Step 1: Requirements Check
Make sure aapke computer mein **Node.js (v18 ya v20+)** installed ho.
Check karne ke liye terminal mein type karein:
```bash
node -v
npm -v
```

### Step 2: Dependencies Install Karein
Project folder (`CS-Assistance`) ke andar terminal open karein aur run karein:
```bash
npm install
```

### Step 3: Environment Variables (`.env`) File
Project ki root directory mein `.env` file exist karni chahiye:
```env
TURSO_DATABASE_URL=file:./cyberguard.db
AUTH_SECRET=cyberguard-super-secret-key-32-characters-minimum-length
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 4: Database Seed (Optional / First Time Setup)
Agar database reset karna ho ya fresh demo data daalna ho:
```bash
npm run db:seed
```

### Step 5: Dev Server Start Karein
```bash
npm run dev
```

### Step 6: Browser Mein Open Karein
Browser khol kar yeh URL enter karein:
👉 **`http://localhost:3000`**

---

## 🔑 4. Demo Login Accounts (Credentials)

| Role | Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **👑 Admin Superuser** | `admin@cyberguard.ai` | `admin123` | Full Admin Console, User Management, Global Logs, Settings |
| **👤 User (Demo Master)** | `user@cyberguard.ai` | `user123` | Full 30-day pre-loaded scan history, 100/100 Security Score |
| **👤 User (Senior Analyst)**| `amna.khan@example.com`| `user123` | Premium User, 92/100 Score, Past Quizzes |
| **👤 User (Free Plan)** | `ali.raza@example.com` | `user123` | Free Tier User, 84/100 Score |

---

## 🧩 5. Core Modules & Engine Algorithms (Har Feature Ki Tafseel)

---

### 📧 Module 1: Email Phishing Detection Engine (`/dashboard/email-checker`)
* **Kaam Kya Hai:** User kisi bhi shakk wali email ka text ya headers paste karta hai, system use scan karke **Safe / Suspicious / Malicious** verdict aur **0–100 Risk Score** deta hai.
* **Behind The Scenes (Algorithm):**
  1. **Link Masquerading Detection:** Text mein `paypal.com` likha ho lekin peeche hyperlink `evil.com` ho to pakad leta hai.
  2. **Sender Spoofing & Header Analysis:** SPF, DKIM, DMARC alignment aur lookalike sender domains check karta hai.
  3. **Psychological Urgency Trigger Detection:** *"Account suspended in 24 hours"*, *"Urgent action required"*, *"Failure to respond"*.
  4. **Credential Harvesting Traps:** Bank PINs, OTPs, CNIC, passwords mangne wale patterns detect karta hai.
  5. **Blended Scoring Formula:**
     $$\text{Composite Score} = (50\% \times \text{Deterministic Heuristic Rules}) + (50\% \times \text{AI Gemini Analysis})$$

---

### 🌐 Module 2: URL Scanner & SSRF Defense Gateway (`/dashboard/url-checker`)
* **Kaam Kya Hai:** Web links ko check karta hai ke woh safe hain ya fake phishing portal / malware host.
* **Behind The Scenes (Algorithm):**
  1. **SSRF & Loopback Block:** Internal addresses (`127.0.0.1`, `192.168.x.x`, `10.x.x.x`) aur AWS/GCP cloud metadata (`169.254.169.254`) ko gateway par hi block karta hai.
  2. **Brand Typosquatting Engine:** Levenshtein distance se brand lookalikes detect karta hai (`paypa1.com`, `easypaisa-login.top`, `nayapay-support.xyz`).
  3. **Punycode / Homoglyph Detection:** Cyrillic / Greek characters (`xn--...`) jo dekhne mein English lagte hain unhe pakadta hai.
  4. **Live DNS Resolution:** Public DNS lookup karke check karta hai ke domain active hai ya disposable dead link.
  5. **High-Abuse TLD Rules:** `.tk`, `.ml`, `.xyz`, `.top`, `.buzz`, `.icu` jese risky domains ko penalty deta hai.

---

### 🔐 Module 3: Password Resilience Evaluator (`/dashboard/password-checker`)
* **Kaam Kya Hai:** Passwords ki cryptographic strength, entropy, aur brute-force time measure karta hai.
* **Behind The Scenes (Algorithm):**
  1. **Zero-Leak Client-Side Evaluation:** Plaintext password server par nahi bheja jata, browser ke andar Web Crypto API se evaluate hota hai.
  2. **Shannon Entropy Formula:**
     $$\text{Entropy (Bits)} = \text{Length} \times \log_2(\text{Character Pool Size})$$
     - *Lowercase (26) + Uppercase (26) + Numbers (10) + Symbols (33) = Pool Size 95.*
  3. **Breached Wordlist Penalty:** Common leaked passwords (`password123`, `admin`, `pakistan123`) par -45 points penalty.
  4. **Keyboard Spatial Walk & Sequences:** `qwerty`, `asdf`, `12345` patterns ko detect karta hai.
  5. **HIBP k-Anonymity Breach Check:** Password ka SHA-1 hash generate karke first 5 characters se anonymous breach database query karta hai.

---

### 🤖 Module 4: AI Cybersecurity Assistant (`/dashboard/assistant`)
* **Kaam Kya Hai:** 24/7 Cybersecurity Advisor jo security concepts explain karta hai aur incident handling mein help karta hai.
* **Behind The Scenes:**
  1. **Defensive Guardrails:** Agar koi offensive attack code (malware, keylogger, hacking script) mangey, to AI use **strictly refuse** karke defense/mitigation explain karta hai.
  2. **Google Gemini Integration:** Real-time conversational AI dynamically har question ka answer deta hai.
  3. **35+ Core Topic Horizontal Quick Bar:** Phishing, Ransomware, Passkeys, Zero Trust, SQLi, XSS, SSRF, VPNs, PECA laws wagera ke direct clickable pills.
  4. **Multi-Turn Chat History:** Drizzle ORM ke through chat sessions save aur manage hote hain.

---

### 🎮 Module 5: Cybersecurity Quiz Training Arena (`/dashboard/quiz`)
* **Kaam Kya Hai:** Gamified interactive challenges jo user ki cyber awareness test karte hain aur Security Score boost karte hain.
* **Behind The Scenes:**
  1. **Anti-Cheat Architecture:** Sahi answers frontend code mein expose nahi hote; submission backend par evaluate hoti hai.
  2. **Fisher-Yates Shuffle Algorithm:** Har dafa questions aur 4 options (`A, B, C, D`) randomly shuffle hote hain.
  3. **Real-time Performance Telemetry:** Duration seconds, accuracy percentage, aur score calculate karta hai.
  4. **Smart Remediation Breakdown:** Quiz complete hone par har galat question ka detailed explanation aur security tip deta hai.
  5. **Attempt Record Deletion:** User apne past attempts ko direct delete kar sakta hai.

---

### 📊 Module 6: Security Health & Signed PDF Audit Reports (`/dashboard/reports`)
* **Kaam Kya Hai:** Pure account ki complete diagnostic telemetry ka summary dashboard aur verifiable PDF export.
* **Behind The Scenes:**
  1. **Weighted Security Score Formula:**
     $$\text{Health Score} = (\text{Scans Resiliency} \times 40\%) + (\text{Password Entropy} \times 30\%) + (\text{Quiz Performance} \times 30\%)$$
  2. **PDF Export Engine:** `jsPDF` aur `jspdf-autotable` ke through professional branded PDF audit document generate karta hai.
  3. **Audit Record Management:** Individual telemetry records ko delete karne ka secure option.

---

## 🎯 6. Top FYP Viva Questions & Answers (Examiner Ke Sawalaat Ke Jawab)

### Q1: Aapke project ka main purpose kya hai?
**Answer:** "CyberGuard AI ek proactive cybersecurity awareness aur threat detection platform hai. Yeh users ko phishing emails, malicious URLs, aur weak passwords se bachata hai, aur AI assistant aur interactive quizzes ke through practical defense training deta hai."

### Q2: Password checker mein password server par jata hai ya client-side evaluate hota hai?
**Answer:** "Zero-Leak Architecture follow karte hue evaluation **100% client-side** hoti hai using Shannon Entropy calculation. Sirf HaveIBeenPwned breach check ke liye SHA-1 hash ka 5-character prefix (k-Anonymity model) use hota hai, kabhi bhi plaintext password server par leak nahi hota."

### Q3: URL scanner mein SSRF protection kaise implement ki hai?
**Answer:** "URL Scanner mein hum protocol filter lagate hain (`http/https` only) aur private IP subnets (RFC 1918: `127.0.0.1`, `10.x.x.x`, `192.168.x.x`) aur cloud metadata endpoint (`169.254.169.254`) ko live DNS resolution ke waqt hi block kar dete hain."

### Q4: Anti-cheat mechanism quiz mein kaise kaam karta hai?
**Answer:** "Questions sanitize hokar client par aate hain bina correct answers ke. Jab user submit karta hai to backend server comparison karta hai. Saath hi Fisher-Yates algorithm se questions aur options har attempt par shuffle hote hain."

### Q5: Phishing detection ka formula kya hai?
**Answer:** "Hum blended engine use karte hain: 50% Deterministic Heuristics (link mismatch, urgency triggers, spoofed headers) + 50% Generative AI Natural Language Processing (psychological manipulation analysis)."

---

## 🌟 7. Project Summary Checklist (Final Verification)
- ✅ Next.js 14 App Router with full TypeScript strict typing.
- ✅ 79/79 Unit & Integration tests passing in Vitest.
- ✅ Live deployed on Vercel: `https://cs-assistance.vercel.app`.
- ✅ Complete Role-Based Access Control (Admin + User).
- ✅ Clean modern design with dark/light mode toggle.
