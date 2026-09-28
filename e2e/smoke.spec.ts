import { test, expect } from "@playwright/test";

test.describe("CyberGuard AI Landing & Navigation", () => {
  test("loads landing page with hero header and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CyberGuard AI/i);
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toBeVisible();
  });

  test("loads login page and has demo account buttons", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome Back")).toBeVisible();
    await expect(page.getByText("User Demo")).toBeVisible();
    await expect(page.getByText("Admin Demo")).toBeVisible();
  });

  test("loads signup page", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create Account")).toBeVisible();
  });
});
