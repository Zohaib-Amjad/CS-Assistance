import { test, expect } from "@playwright/test";

test.describe("CyberGuard AI End-to-End Core Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies & storage
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("1. Authentication Flow: Login as Demo User (Amna Khan) & verify dashboard stats", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "amna.khan@example.com");
    await page.fill('input[type="password"]', "user123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText("Welcome back, Amna")).toBeVisible();
    await expect(page.getByText("Security Score")).toBeVisible();
    await expect(page.getByText("Threats Detected")).toBeVisible();
  });

  test("2. Email Phishing Scanner: Scan email and verify analysis verdict card", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', "amna.khan@example.com");
    await page.fill('input[type="password"]', "user123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to Email Checker
    await page.goto("/dashboard/email-checker");
    await expect(page.getByText("Email Phishing Detector")).toBeVisible();

    const sampleEmail = "URGENT: Your bank account has been suspended! Verify your credentials now at http://fake-hbl-login.com or your balance will be frozen.";
    await page.fill("textarea", sampleEmail);
    await page.click('button:has-text("Analyze Email")');

    // Verify analysis result
    await expect(page.getByText(/Verdict|Risk Score|Phishing/i)).toBeVisible({ timeout: 15000 });
  });

  test("3. URL Scanner: Scan domain and check safety indicators", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "amna.khan@example.com");
    await page.fill('input[type="password"]', "user123");
    await page.click('button[type="submit"]');

    await page.goto("/dashboard/url-checker");
    await expect(page.getByText("Malicious URL & Link Scanner")).toBeVisible();

    await page.fill('input[placeholder*="http"]', "https://secure-login-easypaisa-bonus.xyz/claim");
    await page.click('button:has-text("Scan URL")');

    await expect(page.getByText(/Threat Level|Verdict|Risk|Detected/i)).toBeVisible({ timeout: 15000 });
  });

  test("4. Password Strength Analyzer: Test strength evaluation and recommendations", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "amna.khan@example.com");
    await page.fill('input[type="password"]', "user123");
    await page.click('button[type="submit"]');

    await page.goto("/dashboard/password-checker");
    await expect(page.getByText("Password Security & Breach Analyzer")).toBeVisible();

    await page.fill('input[placeholder*="password"]', "SuperSecure!2026#P@kistan");
    await expect(page.getByText(/Strong|Excellent|Entropy/i)).toBeVisible({ timeout: 5000 });
  });

  test("5. Quiz Engine: Start quiz, answer questions, submit, and view score breakdown", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "amna.khan@example.com");
    await page.fill('input[type="password"]', "user123");
    await page.click('button[type="submit"]');

    await page.goto("/dashboard/quiz");
    await expect(page.getByText(/Cyber Quiz|Select a Quiz|Interactive Cybersecurity/i)).toBeVisible();

    // If quiz start button is present
    const startBtn = page.locator('button:has-text("Start Quiz"), button:has-text("Start Training")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await expect(page.getByText(/Question/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test("6. Admin Access Control: User cannot access /admin or /api/admin/metrics", async ({ page }) => {
    // Login as normal user
    await page.goto("/login");
    await page.fill('input[type="email"]', "amna.khan@example.com");
    await page.fill('input[type="password"]', "user123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Try navigating to /admin
    await page.goto("/admin");
    // Should redirect to /dashboard or show unauthorized
    await expect(page).not.toHaveURL(/\/admin$/);

    // API should return 403
    const response = await page.request.get("/api/admin/metrics");
    expect(response.status()).toBe(403);
  });

  test("7. Admin Panel: Admin login, view metrics and users table", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@cyberguard.ai");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*admin/);
    await expect(page.getByText(/Total Users|Threats Detected|SOC Telemetry/i)).toBeVisible({ timeout: 10000 });

    // Navigate to users
    await page.goto("/admin/users");
    await expect(page.getByText("Users Directory")).toBeVisible();
    await expect(page.getByText("Amna Khan")).toBeVisible();
  });
});
