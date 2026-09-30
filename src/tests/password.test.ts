import { describe, it, expect } from "vitest";
import {
  evaluatePasswordStrength,
  generateSecurePassword,
  generatePassphrase,
  checkPwnedPasswordClient,
} from "@/lib/detection/password";

describe("Password Strength, Entropy & Pattern Detection", () => {
  it("should mark empty passwords as Very Weak with 0 score", () => {
    const res = evaluatePasswordStrength("");
    expect(res.score).toBe(0);
    expect(res.levelScore).toBe(0);
    expect(res.label).toBe("Very Weak");
    expect(res.entropyBits).toBe(0);
    expect(res.hasMinLength).toBe(false);
  });

  it("should detect common dictionary passwords (e.g. 'password', 'pakistan', '123456')", () => {
    const res1 = evaluatePasswordStrength("password");
    expect(res1.hasNoCommonWords).toBe(false);
    expect(res1.label).toBe("Very Weak");
    expect(res1.levelScore).toBe(0);

    const res2 = evaluatePasswordStrength("pakistan");
    expect(res2.hasNoCommonWords).toBe(false);
    expect(res2.label).toBe("Very Weak");

    const res3 = evaluatePasswordStrength("12345678");
    expect(res3.hasNoCommonWords).toBe(false);
    expect(res3.label).toBe("Very Weak");
  });

  it("should detect sequential character patterns", () => {
    const res = evaluatePasswordStrength("Abcdef123!");
    expect(res.hasNoSequences).toBe(false);
    expect(res.suggestions.some((s) => s.includes("sequential"))).toBe(true);
  });

  it("should detect repeated character patterns", () => {
    const res = evaluatePasswordStrength("Aaaaaa123!");
    expect(res.hasNoRepeats).toBe(false);
  });

  it("should detect keyboard walking patterns (e.g. 'qwerty', 'asdfgh')", () => {
    const res = evaluatePasswordStrength("Qwerty!2024");
    expect(res.hasNoSequences).toBe(false);
  });

  it("should detect birth years or recognizable dates (1950-2035)", () => {
    const res = evaluatePasswordStrength("AhmedSecure1998");
    expect(res.hasNoDates).toBe(false);
    expect(res.suggestions.some((s) => s.includes("birth years"))).toBe(true);
  });

  it("should score medium-complexity passwords as Fair or Weak", () => {
    const res = evaluatePasswordStrength("Ahmed2024");
    expect(["Very Weak", "Weak", "Fair"]).toContain(res.label);
    expect(res.levelScore).toBeLessThanOrEqual(2);
  });

  it("should evaluate a robust 16+ character mixed passphrase as Very Strong", () => {
    const res = evaluatePasswordStrength("K9#mQ!vL2$xP9@zW");
    expect(res.label).toBe("Very Strong");
    expect(res.levelScore).toBe(4);
    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(res.entropyBits).toBeGreaterThan(80);
    expect(res.hasMinLength).toBe(true);
    expect(res.hasUppercase).toBe(true);
    expect(res.hasLowercase).toBe(true);
    expect(res.hasNumbers).toBe(true);
    expect(res.hasSymbols).toBe(true);
    expect(res.hasNoRepeats).toBe(true);
  });

  it("should generate a secure random password of customizable length", () => {
    const pwd16 = generateSecurePassword({ length: 16 });
    expect(pwd16.length).toBe(16);
    expect(/[A-Za-z0-9]/.test(pwd16)).toBe(true);

    const pwd24 = generateSecurePassword({ length: 24, useSymbols: true, useNumbers: true });
    expect(pwd24.length).toBe(24);
  });

  it("should generate a multi-word passphrase with numbers", () => {
    const passphrase = generatePassphrase(4);
    const parts = passphrase.split("-");
    expect(parts.length).toBe(5); // 4 words + 1 trailing number
    expect(passphrase.length).toBeGreaterThan(15);
  });

  it("should validate HIBP k-anonymity client hash prefix helper", async () => {
    // Invalid hash format returns false safely without network crash
    const res = await checkPwnedPasswordClient("invalid-hash");
    expect(res.breached).toBe(false);
    expect(res.count).toBe(0);
  });
});
