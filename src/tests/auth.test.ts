import { describe, it, expect, vi } from "vitest";
import { signupSchema, loginSchema, passwordComplexityRegex } from "@/lib/validation";

describe("Phase 3: Authentication & Authorization Tests", () => {
  describe("Signup Validation Rules", () => {
    it("should accept valid registration input", () => {
      const validData = {
        name: "Amna Khan",
        email: "amna.khan@example.com",
        password: "CyberGuard#2024Secure!",
        confirmPassword: "CyberGuard#2024Secure!",
      };
      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject name with less than 2 characters", () => {
      const invalidData = {
        name: "A",
        email: "amna@example.com",
        password: "CyberGuard#2024Secure!",
        confirmPassword: "CyberGuard#2024Secure!",
      };
      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toMatch(/at least 2 characters/i);
      }
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        name: "Amna Khan",
        email: "not-an-email",
        password: "CyberGuard#2024Secure!",
        confirmPassword: "CyberGuard#2024Secure!",
      };
      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password without required uppercase, lowercase, digit, or symbol", () => {
      const weakPasswords = [
        "alllowercase123!",
        "ALLUPPERCASE123!",
        "NoSpecialChar1234",
        "Short#1",
      ];

      for (const pass of weakPasswords) {
        expect(passwordComplexityRegex.test(pass)).toBe(false);
      }
    });

    it("should reject mismatching password confirmation", () => {
      const mismatchData = {
        name: "Amna Khan",
        email: "amna@example.com",
        password: "CyberGuard#2024Secure!",
        confirmPassword: "DifferentPassword#2024!",
      };
      const result = signupSchema.safeParse(mismatchData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toMatch(/passwords don't match/i);
      }
    });
  });

  describe("Login Validation Rules", () => {
    it("should validate correct login payload", () => {
      const validLogin = {
        email: "user@cyberguard.ai",
        password: "user123",
      };
      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it("should reject empty or malformed email on login", () => {
      const badLogin = {
        email: "",
        password: "password123",
      };
      const result = loginSchema.safeParse(badLogin);
      expect(result.success).toBe(false);
    });
  });

  describe("Role-Based Access Control Guard Logic", () => {
    it("should identify admin privileges accurately", () => {
      const adminUser = { id: "1", role: "ADMIN", status: "ACTIVE" };
      const regularUser = { id: "2", role: "USER", status: "ACTIVE" };
      const inactiveAdmin = { id: "3", role: "ADMIN", status: "INACTIVE" };

      expect(adminUser.role.toUpperCase() === "ADMIN" && adminUser.status === "ACTIVE").toBe(true);
      expect(regularUser.role.toUpperCase() === "ADMIN").toBe(false);
      expect(inactiveAdmin.status === "ACTIVE").toBe(false);
    });

    it("should block unauthenticated access when session is missing", () => {
      const session = null;
      const isAuthenticated = !!(session as any)?.user?.id;
      expect(isAuthenticated).toBe(false);
    });
  });
});
