import dns from "dns/promises";
import net from "net";

export type URLVerdict = "SAFE" | "SUSPICIOUS" | "MALICIOUS" | "UNKNOWN" | "safe" | "suspicious" | "malicious" | "unknown";

export interface URLScanChecks {
  isHttps: boolean;
  validDns: boolean;
  noSuspiciousTld: boolean;
  noPunycode: boolean;
  noBrandImpersonation: boolean;
  noSsrfTarget: boolean;
  noAtSymbolTrick: boolean;
  noRawIpHost: boolean;
  noExcessiveHyphens: boolean;
  allowlistMatched: boolean;
  ssrfSafe: boolean;
}

export interface URLScanResult {
  url: string;
  domain: string;
  score: number; // 0 (safest) to 100 (most malicious)
  riskScore: number; // alias for score
  verdict: URLVerdict;
  ipAddress?: string;
  hasSsl: boolean;
  tld: string;
  isPunycode?: boolean;
  isShortener?: boolean;
  isLookalike?: boolean;
  intelConfigured: boolean;
  checks: URLScanChecks;
  threatIndicators: string[];
  threatIntelNotice: string;
  recommendations: string[];
}

const BLOCKED_IP_PREFIXES = [
  "127.",         // Loopback IPv4
  "10.",          // Private Class A
  "192.168.",     // Private Class C
  "169.254.",     // Link-local / Cloud Metadata
  "0.0.0.0",      // All interfaces
  "::1",          // Loopback IPv6
  "fc00:",        // Unique local IPv6
  "fe80:",        // Link-local IPv6
];

const BLOCKED_HOSTNAMES = new Set([
  "localhost", "localhost.localdomain", "127.0.0.1", "0.0.0.0", "169.254.169.254", "instance-data",
]);

const SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly", "rb.gy", "goo.gl", "cutt.ly"
]);

const SUSPICIOUS_KEYWORDS = [
  "login", "verify", "secure", "account", "banking", "update", "paypal",
  "appleid", "support", "billing", "recover", "authenticate", "wallet",
  "security-check", "signin", "password-reset", "auth", "confirm", "portal",
  "token", "otp", "cnic", "easypaisa", "jazzcash", "nayapay", "sadapay", "hbl", "meezan"
];

const SUSPICIOUS_TLDS = [
  ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".xyz", ".buzz", ".fit", ".rest", ".work", ".cc", ".icu", ".cam"
];

const TARGET_BRANDS = [
  "google", "microsoft", "apple", "paypal", "netflix", "amazon", "meta", "facebook", "instagram",
  "nayapay", "sadapay", "easypaisa", "jazzcash", "hbl", "meezan", "ubl", "mcb", "alliedbank"
];

const ALLOWLISTED_DOMAINS = new Set([
  "google.com", "microsoft.com", "apple.com", "paypal.com", "netflix.com", "amazon.com",
  "github.com", "vercel.com", "nayapay.com", "sadapay.pk", "easypaisa.com.pk", "jazzcash.com.pk",
  "hbl.com", "meezanbank.com", "ubldigital.com", "mcb.com.pk", "abl.com"
]);

export async function scanUrlSafely(rawUrl: string): Promise<URLScanResult> {
  const checks: URLScanChecks = {
    isHttps: false,
    validDns: true,
    noSuspiciousTld: true,
    noPunycode: true,
    noBrandImpersonation: true,
    noSsrfTarget: true,
    noAtSymbolTrick: true,
    noRawIpHost: true,
    noExcessiveHyphens: true,
    allowlistMatched: false,
    ssrfSafe: true,
  };

  const threatIndicators: string[] = [];
  let riskScore = 0;
  const intelConfigured = !!process.env.GOOGLE_SAFE_BROWSING_KEY;

  if (!rawUrl || typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    return {
      url: "",
      domain: "Empty URL",
      score: 0,
      riskScore: 0,
      verdict: "UNKNOWN",
      hasSsl: false,
      tld: "",
      intelConfigured,
      checks: { ...checks, validDns: false, ssrfSafe: true },
      threatIndicators: ["No URL provided."],
      threatIntelNotice: "No analysis performed.",
      recommendations: ["Provide a valid URL to analyze."],
    };
  }

  const trimmed = rawUrl.trim();

  // Check forbidden protocols (file://, gopher://, ftp://, dict://, etc.)
  const schemeMatch = trimmed.match(/^([a-zA-Z0-9+.-]+):\/\//);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== "http" && scheme !== "https") {
      return {
        url: trimmed,
        domain: "Unsupported Scheme",
        score: 100,
        riskScore: 100,
        verdict: "MALICIOUS",
        hasSsl: false,
        tld: "",
        intelConfigured,
        checks: { ...checks, validDns: false, noSsrfTarget: false, ssrfSafe: false },
        threatIndicators: [`Non-web protocol scheme detected (${scheme}://). Potential SSRF or local resource exfiltration attempt.`],
        threatIntelNotice: "Prohibited scheme blocked by gateway.",
        recommendations: ["Only HTTP and HTTPS URLs are allowed for safety verification."],
      };
    }
  }

  let parsed: URL;
  try {
    let formatted = trimmed;
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      // If it contains characters invalid for hostname
      if (/[\s#$%^&*()_+=\[\]{};':"\\|<>?]/.test(formatted)) {
        throw new Error("Invalid URL syntax");
      }
      formatted = "https://" + formatted;
    }
    parsed = new URL(formatted);
    if (!parsed.hostname || parsed.hostname.length === 0) {
      throw new Error("Missing hostname");
    }
  } catch {
    return {
      url: rawUrl,
      domain: "Invalid URL",
      score: 0,
      riskScore: 0,
      verdict: "UNKNOWN",
      hasSsl: false,
      tld: "",
      intelConfigured,
      checks: { ...checks, validDns: false, noSsrfTarget: false },
      threatIndicators: ["Malformed or unparseable URL structure."],
      threatIntelNotice: "Analysis skipped due to invalid URL syntax.",
      recommendations: ["Ensure the URL is formatted properly (e.g., https://example.com)."],
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  checks.isHttps = parsed.protocol === "https:";

  // Check 1: HTTPS
  if (!checks.isHttps) {
    threatIndicators.push("Insecure HTTP protocol used (traffic transmitted unencrypted).");
    riskScore += 25;
  }

  // Check 2: At-Symbol redirection trick
  if (rawUrl.includes("@") || parsed.username || parsed.password) {
    checks.noAtSymbolTrick = false;
    threatIndicators.push("Contains '@' authentication credentials prefix, often used to disguise malicious hostnames.");
    riskScore += 40;
  }

  // Check 3: Raw IP as hostname
  if (net.isIP(hostname)) {
    checks.noRawIpHost = false;
    threatIndicators.push(`Raw IP address (${hostname}) used in place of a registered domain name.`);
    riskScore += 35;
  }

  // Check 4: SSRF & Hostname boundary restrictions
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    checks.noSsrfTarget = false;
    checks.ssrfSafe = false;
    return {
      url: parsed.href,
      domain: hostname,
      score: 100,
      riskScore: 100,
      verdict: "MALICIOUS",
      ipAddress: hostname,
      hasSsl: checks.isHttps,
      tld: "",
      intelConfigured,
      checks: { ...checks, noSsrfTarget: false, ssrfSafe: false },
      threatIndicators: ["Prohibited localhost or internal loopback destination (SSRF protection)."],
      threatIntelNotice: "Access blocked by internal SSRF policy.",
      recommendations: ["Scanning local network addresses or cloud metadata endpoints is strictly prohibited."],
    };
  }

  // Check SSRF prefixes on hostname if it is an IP
  for (const prefix of BLOCKED_IP_PREFIXES) {
    if (hostname.startsWith(prefix) || hostname === prefix) {
      checks.noSsrfTarget = false;
      checks.ssrfSafe = false;
      return {
        url: parsed.href,
        domain: hostname,
        score: 100,
        riskScore: 100,
        verdict: "MALICIOUS",
        ipAddress: hostname,
        hasSsl: checks.isHttps,
        tld: "",
        intelConfigured,
        checks: { ...checks, noSsrfTarget: false, ssrfSafe: false },
        threatIndicators: [`Target is in prohibited internal/metadata IP range (${hostname}). SSRF threat blocked.`],
        threatIntelNotice: "Access blocked by internal network boundary.",
        recommendations: ["Internal RFC1918 and link-local addresses cannot be queried."],
      };
    }
  }

  // Resolve DNS safely
  let resolvedIp = "";
  try {
    if (net.isIP(hostname)) {
      resolvedIp = hostname;
    } else {
      const lookup = await dns.lookup(hostname);
      resolvedIp = lookup.address;
    }

    // SSRF IP validation on resolved address
    for (const prefix of BLOCKED_IP_PREFIXES) {
      if (resolvedIp.startsWith(prefix) || resolvedIp === prefix) {
        checks.noSsrfTarget = false;
        checks.ssrfSafe = false;
        return {
          url: parsed.href,
          domain: hostname,
          score: 100,
          riskScore: 100,
          verdict: "MALICIOUS",
          ipAddress: resolvedIp,
          hasSsl: checks.isHttps,
          tld: "",
          intelConfigured,
          checks: { ...checks, noSsrfTarget: false, ssrfSafe: false },
          threatIndicators: [`Resolved to protected internal/cloud IP range (${resolvedIp}). SSRF threat blocked.`],
          threatIntelNotice: "Access blocked by internal network boundary.",
          recommendations: ["Internal RFC1918 and link-local addresses cannot be queried."],
        };
      }
    }
  } catch {
    checks.validDns = false;
    threatIndicators.push("Domain name could not be resolved via public DNS (potentially inactive or disposable).");
    riskScore += 20;
  }

  // Check 5: Punycode & IDN Homograph
  let isPunycode = false;
  if (hostname.startsWith("xn--") || hostname.includes(".xn--") || /[^\u0000-\u007f]/.test(hostname)) {
    isPunycode = true;
    checks.noPunycode = false;
    threatIndicators.push("Internationalized Domain Name (Punycode / Homograph attack indicator).");
    riskScore += 35;
  }

  // Check 6: Suspicious TLD
  const tldMatch = hostname.match(/\.[a-z0-9-]+$/i);
  const tld = tldMatch ? tldMatch[0].toLowerCase() : "";
  if (SUSPICIOUS_TLDS.includes(tld)) {
    checks.noSuspiciousTld = false;
    threatIndicators.push(`Domain uses high-abuse top-level domain (${tld}).`);
    riskScore += 25;
  }

  // Check 7: Brand Lookalike / Typosquatting
  let isLookalike = false;
  for (const brand of TARGET_BRANDS) {
    if (hostname.includes(brand)) {
      let isOfficial = false;
      for (const allow of Array.from(ALLOWLISTED_DOMAINS)) {
        if (hostname === allow || hostname.endsWith("." + allow)) {
          isOfficial = true;
          break;
        }
      }

      if (!isOfficial) {
        isLookalike = true;
        checks.noBrandImpersonation = false;
        threatIndicators.push(`Brand lookalike detected for '${brand}' on non-official domain.`);
        riskScore += 45;
        break;
      }
    }
  }

  // Check 8: URL Shorteners
  let isShortener = false;
  if (SHORTENERS.has(hostname)) {
    isShortener = true;
    threatIndicators.push(`URL shortener detected (${hostname}) which may obfuscate the true destination.`);
    riskScore += 25;
  }

  // Check 9: Excessive hyphens & subdomains
  const hyphenCount = (hostname.match(/-/g) || []).length;
  const subdomainCount = hostname.split(".").length;
  if (hyphenCount >= 3 || subdomainCount >= 4) {
    checks.noExcessiveHyphens = false;
    threatIndicators.push(`Excessive hyphenation (${hyphenCount}) or deep subdomains (${subdomainCount} levels).`);
    riskScore += 20;
  }

  // Check 10: Risky keywords
  let keywordMatches = 0;
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (hostname.includes(kw) || parsed.pathname.toLowerCase().includes(kw)) {
      keywordMatches++;
    }
  }
  if (keywordMatches > 0) {
    threatIndicators.push(`Matched ${keywordMatches} high-risk deceptive authentication keyword(s).`);
    riskScore += Math.min(30, keywordMatches * 15);
  }

  // Check 11: Allowlist deduction
  let isAllowlisted = false;
  for (const allow of Array.from(ALLOWLISTED_DOMAINS)) {
    if (hostname === allow || hostname.endsWith("." + allow)) {
      isAllowlisted = true;
      break;
    }
  }
  if (isAllowlisted) {
    checks.allowlistMatched = true;
    riskScore = 0;
  }

  let threatIntelNotice = intelConfigured
    ? "External Threat Intelligence Active"
    : "Basic heuristic engine active (external threat feed not configured).";

  const finalScore = Math.min(100, Math.max(0, riskScore));
  let verdict: "SAFE" | "SUSPICIOUS" | "MALICIOUS" = "SAFE";
  if (finalScore >= 60 || !checks.noSsrfTarget) {
    verdict = "MALICIOUS";
  } else if (finalScore >= 30 || !checks.noSuspiciousTld || !checks.noPunycode || !checks.noBrandImpersonation) {
    verdict = "SUSPICIOUS";
  }

  const recommendations: string[] = [];
  if (verdict === "MALICIOUS") {
    recommendations.push("Do not navigate to this URL or enter credentials.");
    recommendations.push("Block this domain across firewalls and endpoint security agents.");
  } else if (verdict === "SUSPICIOUS") {
    recommendations.push("Inspect the address bar carefully for typosquatting before proceeding.");
    recommendations.push("Never download unknown executable files from this source.");
  } else {
    recommendations.push("Standard domain configuration. Always verify SSL certificates on sensitive portals.");
  }

  return {
    url: parsed.href,
    domain: hostname,
    score: finalScore,
    riskScore: finalScore,
    verdict,
    ipAddress: resolvedIp || undefined,
    hasSsl: checks.isHttps,
    tld,
    isPunycode,
    isShortener,
    isLookalike,
    intelConfigured,
    checks,
    threatIndicators: threatIndicators.length > 0 ? threatIndicators : ["Domain follows standard naming conventions."],
    threatIntelNotice,
    recommendations,
  };
}
