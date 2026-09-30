# 🚀 CyberGuard AI — Production Deployment Guide

This guide details the complete process for deploying **CyberGuard AI** to production using **Vercel** (Serverless Frontend & API) + **Turso libSQL** (Distributed Cloud SQLite) + **Vercel Blob** (Object Storage).

---

## ⚠️ Why Plain SQLite Files Fail on Serverless (Vercel / AWS Lambda)

When running locally, CyberGuard AI writes to a local SQLite database file (`cyberguard.db`). However:
1. **Serverless Filesystem Ephemerality**: Serverless container instances spin up and terminate on demand. Any writes to local files inside `/tmp` or the project root are discarded when the container cold-starts or scales.
2. **Concurrent Multi-Instance Conflicts**: In serverless architectures, dozens of instances handle incoming requests concurrently. Multiple instances attempting to lock a single local file cause `SQLITE_BUSY` or data corruption.
3. **Read-Only App Directory**: Vercel freezes the application code bundle at build time; attempting to write to local directory paths throws `EROFS: read-only file system`.

### The Solution: Turso libSQL
Turso provides a distributed, cloud-hosted SQLite database via the open-source **libSQL** protocol. It delivers sub-millisecond edge latency while maintaining 100% SQLite query compatibility.

---

## 🛠️ Step-by-Step Deployment Walkthrough

### Step 1: Provision a Turso Cloud Database

1. Install the Turso CLI (or sign in at [turso.tech](https://turso.tech)):
   ```bash
   # On macOS/Linux:
   curl -sSfL https://get.tur.so/install.sh | bash

   # On Windows (PowerShell):
   irm https://get.tur.so/install.ps1 | iex
   ```
2. Log in and create a new database:
   ```bash
   turso auth login
   turso db create cyberguard-prod
   ```
3. Retrieve your Database URL:
   ```bash
   turso db show cyberguard-prod --url
   # Output example: libsql://cyberguard-prod-youruser.turso.io
   ```
4. Generate a persistent authentication token:
   ```bash
   turso db tokens create cyberguard-prod
   # Output example: eyJhbGciOiJFZERTQ...
   ```

---

### Step 2: Push Schema & Seed Turso Database

1. Update your local `.env` temporarily to point to Turso:
   ```env
   DATABASE_URL="libsql://cyberguard-prod-youruser.turso.io"
   TURSO_AUTH_TOKEN="your-turso-auth-token"
   ```
2. Push your Drizzle schema and seed default data:
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

### Step 3: Configure Vercel Project

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Import Project"**.
3. Set the **Framework Preset** to `Next.js`.
4. Configure the following **Environment Variables** in Vercel:

| Variable Name | Value Description | Example |
|---|---|---|
| `NEXTAUTH_URL` | Your production custom domain or Vercel URL | `https://cyberguard.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `https://cyberguard.vercel.app` |
| `NEXTAUTH_SECRET` | 32+ character random secret string | `openssl rand -base64 32` |
| `DATABASE_URL` | Turso libSQL connection URL | `libsql://cyberguard-prod-youruser.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso authentication token | `eyJhbGciOiJFZERTQ...` |
| `GEMINI_API_KEY` | Google AI Studio API Key | `AIzaSy...` |
| `BLOB_READ_WRITE_TOKEN` | (Optional) Vercel Blob token for avatars | Auto-injected by Vercel |

5. Click **"Deploy"**.

---

### Step 4: Post-Deployment Verification

1. Navigate to `https://your-domain.vercel.app`.
2. Test the **Login** page using the seeded admin (`admin@cyberguard.ai` / `admin123`) or user account (`amna.khan@example.com` / `user123`).
3. Verify that:
   - Dashboard telemetry loads without server errors.
   - Email and URL scanners execute and record to Turso.
   - Admin Panel `/admin` is accessible only to active administrators.
   - PDF reports download correctly from `/dashboard/reports`.
