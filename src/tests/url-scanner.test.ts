import { describe, it, expect } from "vitest";
import { scanUrlSafely } from "@/lib/detection/url-scanner";

describe("URL Safety & SSRF Defense Engine", () => {
  it("should block loopback IPv4 address (127.0.0.1) as MALICIOUS SSRF attempt", async () => {
    const res = await scanUrlSafely("http://127.0.0.1:8080/admin/debug");
    expect(res.verdict.toUpperCase()).toBe("MALICIOUS");
    expect(res.riskScore).toBe(100);
    expect(res.threatIndicators.some((t) => t.includes("SSRF"))).toBe(true);
    expect(res.checks.ssrfSafe).toBe(false);
  });

  it("should block AWS/Cloud metadata IP (169.254.169.254) as MALICIOUS SSRF attempt", async () => {
    const res = await scanUrlSafely("http://169.254.169.254/latest/meta-data/iam/security-credentials/");
    expect(res.verdict.toUpperCase()).toBe("MALICIOUS");
    expect(res.threatIndicators.some((t) => t.includes("SSRF"))).toBe(true);
    expect(res.checks.ssrfSafe).toBe(false);
  });

  it("should block 0.0.0.0 and private RFC1918 addresses (10.x, 192.168.x, 172.16.x)", async () => {
    const res1 = await scanUrlSafely("http://0.0.0.0:3000");
    expect(res1.verdict.toUpperCase()).toBe("MALICIOUS");

    const res2 = await scanUrlSafely("http://192.168.1.1/router-login");
    expect(res2.verdict.toUpperCase()).toBe("MALICIOUS");

    const res3 = await scanUrlSafely("http://10.0.0.5:8000");
    expect(res3.verdict.toUpperCase()).toBe("MALICIOUS");
  });

  it("should reject non-HTTP/HTTPS protocols (e.g. file://, gopher://, ftp://)", async () => {
    const res = await scanUrlSafely("file:///etc/passwd");
    expect(res.verdict.toUpperCase()).toBe("MALICIOUS");
    expect(res.threatIndicators.some((t) => t.includes("protocol"))).toBe(true);
  });

  it("should detect @ trick URL obfuscation", async () => {
    const res = await scanUrlSafely("https://google.com@evil-attacker-site.com/login");
    expect(res.threatIndicators.some((t) => t.includes("@"))).toBe(true);
    expect(["SUSPICIOUS", "MALICIOUS"]).toContain(res.verdict.toUpperCase());
  });

  it("should detect Punycode / IDN Homograph domain masquerading", async () => {
    const res = await scanUrlSafely("https://xn--e1afmkfd.xn--p1ai");
    expect(res.isPunycode).toBe(true);
    expect(res.threatIndicators.some((t) => t.includes("Punycode") || t.includes("Homograph"))).toBe(true);
  });

  it("should detect brand lookalikes for Pakistani banking and wallets", async () => {
    const res1 = await scanUrlSafely("http://easypaisa-bonus-claim-reward.xyz/login");
    expect(res1.isLookalike).toBe(true);
    expect(["SUSPICIOUS", "MALICIOUS"]).toContain(res1.verdict.toUpperCase());

    const res2 = await scanUrlSafely("http://hbl-verify-account-portal.top");
    expect(res2.isLookalike).toBe(true);
    expect(["SUSPICIOUS", "MALICIOUS"]).toContain(res2.verdict.toUpperCase());

    const res3 = await scanUrlSafely("http://nayapay-security-update.club");
    expect(res3.isLookalike).toBe(true);
  });

  it("should detect URL shorteners (e.g. bit.ly, tinyurl.com)", async () => {
    const res = await scanUrlSafely("https://bit.ly/3xSampleShort");
    expect(res.isShortener).toBe(true);
    expect(res.threatIndicators.some((t) => t.includes("shortener"))).toBe(true);
  });

  it("should detect excessive subdomains and suspicious high-risk TLDs", async () => {
    const res = await scanUrlSafely("http://portal.login.secure.update.verify.account.xyz.top/auth");
    expect(res.threatIndicators.some((t) => t.includes("subdomain") || t.includes("TLD") || t.includes("hyphen"))).toBe(true);
    expect(res.riskScore).toBeGreaterThanOrEqual(40);
  });

  it("should handle completely invalid URL strings gracefully", async () => {
    const res = await scanUrlSafely("not a valid url at all #$%^");
    expect(res.verdict.toUpperCase()).toBe("UNKNOWN");
    expect(res.riskScore).toBe(0);
    expect(res.threatIndicators.length).toBeGreaterThan(0);
  });

  it("should recognize known reputable allowlisted domains as SAFE", async () => {
    const res = await scanUrlSafely("https://google.com/search?q=cybersecurity");
    expect(res.verdict.toUpperCase()).toBe("SAFE");
    expect(res.riskScore).toBe(0);
    expect(res.checks.allowlistMatched).toBe(true);
  });
});
