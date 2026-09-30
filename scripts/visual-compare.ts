import { chromium, Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3000";

const SCREENS = [
  { id: "01-landing", path: "/", auth: "none" },
  { id: "02-login", path: "/login", auth: "none" },
  { id: "03-signup", path: "/signup", auth: "none" },
  { id: "04-dashboard", path: "/dashboard", auth: "user" },
  { id: "05-email-checker", path: "/dashboard/email-checker", auth: "user" },
  { id: "06-url-checker", path: "/dashboard/url-checker", auth: "user" },
  { id: "07-password-checker", path: "/dashboard/password-checker", auth: "user" },
  { id: "08-ai-assistant", path: "/dashboard/assistant", auth: "user" },
  { id: "09-quiz", path: "/dashboard/quiz", auth: "user" },
  { id: "10-profile", path: "/dashboard/profile", auth: "user" },
  { id: "11-admin-users", path: "/admin/users", auth: "admin" },
  { id: "12-reports", path: "/dashboard/reports", auth: "user" },
];

const CSS_FREEZE = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
  ::-webkit-scrollbar {
    display: none !important;
  }
`;

async function loginUser(page: Page, email = "amna.khan@example.com", pass = "user123") {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', pass);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
  await page.waitForLoadState("networkidle");
}

async function resizeAndMatch(refImg: PNG, curImg: PNG, diffPath: string) {
  const width = Math.min(refImg.width, curImg.width);
  const height = Math.min(refImg.height, curImg.height);

  const croppedRef = new PNG({ width, height });
  const croppedCur = new PNG({ width, height });
  const diff = new PNG({ width, height });

  PNG.bitblt(refImg, croppedRef, 0, 0, width, height, 0, 0);
  PNG.bitblt(curImg, croppedCur, 0, 0, width, height, 0, 0);

  const numDiffPixels = pixelmatch(
    croppedRef.data,
    croppedCur.data,
    diff.data,
    width,
    height,
    { threshold: 0.15 }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  const totalPixels = width * height;
  const mismatchPercent = ((numDiffPixels / totalPixels) * 100).toFixed(2);

  return {
    diffPixels: numDiffPixels,
    totalPixels,
    mismatchPercent: parseFloat(mismatchPercent),
    dimensions: `${width}x${height}`,
    refDims: `${refImg.width}x${refImg.height}`,
    curDims: `${curImg.width}x${curImg.height}`,
  };
}

async function run() {
  const diffDir = path.join(process.cwd(), "design-diff");
  const currentDir = path.join(diffDir, "current");
  const diffOutDir = path.join(diffDir, "diff");
  const refDir = path.join(process.cwd(), "design-ref");

  fs.mkdirSync(currentDir, { recursive: true });
  fs.mkdirSync(diffOutDir, { recursive: true });

  console.log("🚀 Starting Playwright Visual Comparison Suite...");
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
    console.log("  Using installed Google Chrome");
  } catch (e1) {
    try {
      browser = await chromium.launch({ channel: "msedge", headless: true });
      console.log("  Using installed Microsoft Edge");
    } catch (e2) {
      console.error("Could not launch system Chrome or Edge:", e2);
      throw e2;
    }
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    window.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.innerHTML = `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    });
  });

  let currentAuth = "none";
  const results: any[] = [];

  for (const screen of SCREENS) {
    console.log(`\n📸 Capturing [${screen.id}] at ${screen.path}...`);

    if (screen.auth !== currentAuth) {
      if (screen.auth === "user") {
        await loginUser(page, "amna.khan@example.com", "user123");
        currentAuth = "user";
      } else if (screen.auth === "admin") {
        await loginUser(page, "admin@cyberguard.ai", "admin123");
        currentAuth = "admin";
      } else {
        await context.clearCookies();
        currentAuth = "none";
      }
    }

    try {
      await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: "networkidle", timeout: 20000 });
      await page.addStyleTag({ content: CSS_FREEZE });
      await page.waitForTimeout(600);

      const currentImgPath = path.join(currentDir, `${screen.id}.png`);
      await page.screenshot({ path: currentImgPath, fullPage: false });

      const refImgPath = path.join(refDir, `${screen.id}.png`);
      if (fs.existsSync(refImgPath)) {
        const refPng = PNG.sync.read(fs.readFileSync(refImgPath));
        const curPng = PNG.sync.read(fs.readFileSync(currentImgPath));
        const diffImgPath = path.join(diffOutDir, `${screen.id}-diff.png`);

        const match = await resizeAndMatch(refPng, curPng, diffImgPath);
        results.push({
          screen: screen.id,
          path: screen.path,
          status: "SUCCESS",
          mismatch: `${match.mismatchPercent}%`,
          mismatchNum: match.mismatchPercent,
          diffPixels: match.diffPixels,
          refDims: match.refDims,
          curDims: match.curDims,
        });
        console.log(`   ✅ Comparison: ${match.mismatchPercent}% mismatch (ref: ${match.refDims}, cur: ${match.curDims})`);
      } else {
        results.push({
          screen: screen.id,
          path: screen.path,
          status: "NO_REF_FOUND",
          mismatch: "N/A",
        });
        console.log(`   ⚠️ No reference image found for ${refImgPath}`);
      }
    } catch (err: any) {
      console.error(`   ❌ Failed to capture ${screen.id}:`, err.message);
      results.push({
        screen: screen.id,
        path: screen.path,
        status: "ERROR",
        error: err.message,
      });
    }
  }

  await browser.close();

  console.log("\n=======================================================");
  console.log("             VISUAL COMPARISON RESULTS                 ");
  console.log("=======================================================");
  console.table(results);

  // Write report JSON
  fs.writeFileSync(
    path.join(diffDir, "report.json"),
    JSON.stringify(results, null, 2)
  );
}

run().catch((e) => {
  console.error("Visual compare fatal error:", e);
  process.exit(1);
});
