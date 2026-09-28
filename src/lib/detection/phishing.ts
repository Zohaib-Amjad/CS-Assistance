export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type PhishingLevel = "Safe" | "Suspicious" | "High Risk" | "Phishing Detected";

export type PhishingAnalysisResult = EmailPhishingResult;

export interface PhishingFinding {
  type: string;
  severity: RiskSeverity;
  evidence: string;
  explanation: string;
}

export interface ExtractedLink {
  href: string;
  text?: string;
  isMismatched: boolean;
  isShortener: boolean;
  isLookalike: boolean;
}

export interface ParsedEmailHeaders {
  from?: string;
  fromName?: string;
  fromDomain?: string;
  replyTo?: string;
  replyToDomain?: string;
  returnPath?: string;
  spfResult?: "pass" | "fail" | "softfail" | "neutral" | "none" | "unknown";
  dkimResult?: "pass" | "fail" | "none" | "unknown";
  dmarcResult?: "pass" | "fail" | "none" | "unknown";
  subject?: string;
}

export interface EmailPhishingResult {
  riskScore: number; // 0 to 100
  score: number; // alias for riskScore
  level: PhishingLevel;
  verdict: "safe" | "suspicious" | "malicious";
  confidence: number;
  findings: PhishingFinding[];
  indicators: string[]; // summary list of indicators
  recommendations: string[];
  headers: ParsedEmailHeaders;
  extractedLinks: ExtractedLink[];
  breakdown: {
    urgencyScore: number;
    credentialScore: number;
    credentialHarvestingScore?: number;
    spoofingScore: number;
    threatScore: number;
    financialThreatScore?: number;
    structuralScore: number;
  };
  summary: string;
}

const SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly", "rb.gy", "goo.gl", "cutt.ly"
]);

const RISKY_ATTACHMENTS = /\.(exe|scr|vbs|bat|cmd|ps1|hta|jar|iso|img|docm|xlsm|pptm|zip|rar|7z|tar\.gz)$/i;

const BRAND_TARGETS = [
  "google", "microsoft", "apple", "paypal", "netflix", "amazon", "chase", "wellsfargo",
  "bankofamerica", "hbl", "meezan", "easypaisa", "jazzcash", "nayapay", "sadapay",
  "ubl", "mcb", "fbr", "nadra", "bisp", "ehsaas", "statebank"
];

const GENERIC_GREETINGS = [
  /dear\s+(customer|user|client|account\s+holder|member|sir|madam|valued\s+customer)/i,
  /hello\s+(user|customer|member)/i,
  /attention\s+(user|customer|subscriber)/i,
];

const URGENCY_TRIGGERS = [
  /urgent(ly)?\b/i,
  /immediate(ly)?\s+action/i,
  /account\s+(will\s+be|has\s+been)\s+(suspended|locked|terminated|disabled|restricted)/i,
  /within\s+\d+\s+hours?/i,
  /24\s+hours?/i,
  /limited\s+time/i,
  /failure\s+to\s+respond/i,
  /security\s+alert/i,
  /unauthorized\s+activity/i,
  /critical\s+warning/i,
  /action\s+required/i,
  /last\s+warning/i,
];

const CREDENTIAL_HARVESTING = [
  /verify\s+your\s+(account|identity|password|credentials|ssn|cnic|otp|pin|email)/i,
  /update\s+your\s+(billing|payment|credit\s+card|login|banking|cnic)/i,
  /click\s+(here|below)\s+to\s+(login|sign\s+in|reactivate|confirm|unlock)/i,
  /enter\s+your\s+(pin|password|passcode|token|otp|cvv|secret\s+code)/i,
  /enter\s+(your\s+)?(.*)?(cnic|atm\s+pin|pin|password|passcode|token|otp)/i,
  /provide\s+your\s+(cnic|national\s+identity|social\s+security|credentials)/i,
  /confirm\s+your\s+(identity|details|passcode|credentials)/i,
  /reset\s+your\s+password/i,
  /password:\s*http/i,
];

const THREAT_LEGAL = [
  /legal\s+action/i,
  /police\s+(warrant|report|complaint)/i,
  /fia\s+cybercrime/i,
  /arrest\s+warrant/i,
  /court\s+summons/i,
  /fbi\s+investigation/i,
  /account\s+seizure/i,
  /lawsuit\s+filed/i,
  /frozen\s+funds/i,
];

const FINANCIAL_LURES = [
  /lottery\s+winner/i,
  /bisp\s+(grant|payment|benazir)/i,
  /ehsaas\s+(program|grant|cash)/i,
  /claim\s+your\s+(bonus|reward|refund|prize|cashback)/i,
  /wire\s+transfer\s+of\s+\$?[\d,]+/i,
  /invoice\s+attached/i,
  /overdue\s+invoice/i,
  /cryptocurrency\s+deposit/i,
  /bitcoin\s+payout/i,
];

/**
 * Extracts and parses email headers from raw text if present.
 */
export function parseEmailHeaders(content: string): ParsedEmailHeaders {
  const headers: ParsedEmailHeaders = {};

  const fromMatch = content.match(/^From:\s*(.+)$/im);
  if (fromMatch) {
    const rawFrom = fromMatch[1].trim();
    headers.from = rawFrom;
    const nameMatch = rawFrom.match(/^"?([^"<]+)"?\s*<([^>]+)>/);
    if (nameMatch) {
      headers.fromName = nameMatch[1].trim();
      const email = nameMatch[2].trim();
      const domain = email.split("@")[1];
      if (domain) headers.fromDomain = domain.toLowerCase();
    } else {
      const emailMatch = rawFrom.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        const domain = emailMatch[1].split("@")[1];
        if (domain) headers.fromDomain = domain.toLowerCase();
      }
    }
  }

  const replyToMatch = content.match(/^Reply-To:\s*(.+)$/im);
  if (replyToMatch) {
    const rawReply = replyToMatch[1].trim();
    headers.replyTo = rawReply;
    const emailMatch = rawReply.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      headers.replyToDomain = emailMatch[1].split("@")[1]?.toLowerCase();
    }
  }

  const returnPathMatch = content.match(/^Return-Path:\s*<?([^>\r\n]+)>?/im);
  if (returnPathMatch) {
    headers.returnPath = returnPathMatch[1].trim();
  }

  const subjectMatch = content.match(/^Subject:\s*(.+)$/im);
  if (subjectMatch) {
    headers.subject = subjectMatch[1].trim();
  }

  // SPF / DKIM / DMARC lines
  if (/spf=(pass|success)/i.test(content) || /Received-SPF:\s*pass/i.test(content)) {
    headers.spfResult = "pass";
  } else if (/spf=(fail|softfail|temperror|permerror)/i.test(content) || /Received-SPF:\s*(fail|softfail)/i.test(content)) {
    headers.spfResult = "fail";
  }

  if (/dkim=(pass|success)/i.test(content) || /DKIM-Signature:/i.test(content)) {
    headers.dkimResult = /dkim=fail/i.test(content) ? "fail" : "pass";
  }

  if (/dmarc=(pass|success)/i.test(content)) {
    headers.dmarcResult = "pass";
  } else if (/dmarc=fail/i.test(content)) {
    headers.dmarcResult = "fail";
  }

  return headers;
}

/**
 * Extracts links from plain text, HTML, and Markdown.
 */
export function extractAndAnalyzeLinks(content: string): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  const seenHrefs = new Set<string>();
  let sanitized = content;

  // 1. Markdown links [text](url)
  const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let mdMatch;
  while ((mdMatch = mdRegex.exec(content)) !== null) {
    const text = mdMatch[1].trim();
    const href = mdMatch[2].trim();
    if (!seenHrefs.has(href)) {
      seenHrefs.add(href);
      const isShortener = isUrlShortener(href);
      const isLookalike = isLookalikeUrl(href);
      const isMismatched = isLinkTextMismatched(text, href);
      links.push({ href, text, isMismatched, isShortener, isLookalike });
    }
  }
  sanitized = sanitized.replace(mdRegex, " ");

  // 2. HTML links <a href="...">text</a>
  const htmlRegex = /<a\s+(?:[^>]*?\s+)?href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let htmlMatch;
  while ((htmlMatch = htmlRegex.exec(sanitized)) !== null) {
    const href = htmlMatch[1].trim();
    const text = htmlMatch[2].replace(/<[^>]*>/g, "").trim();
    if (!seenHrefs.has(href)) {
      seenHrefs.add(href);
      const isShortener = isUrlShortener(href);
      const isLookalike = isLookalikeUrl(href);
      const isMismatched = isLinkTextMismatched(text, href);
      links.push({ href, text, isMismatched, isShortener, isLookalike });
    }
  }
  sanitized = sanitized.replace(htmlRegex, " ");

  // 3. Raw URLs
  const rawRegex = /(https?:\/\/[^\s<>"'\)]+)/g;
  let rawMatch;
  while ((rawMatch = rawRegex.exec(sanitized)) !== null) {
    const href = rawMatch[1].trim();
    if (!seenHrefs.has(href)) {
      seenHrefs.add(href);
      links.push({
        href,
        text: href,
        isMismatched: false,
        isShortener: isUrlShortener(href),
        isLookalike: isLookalikeUrl(href),
      });
    }
  }

  return links;
}

function isUrlShortener(urlStr: string): boolean {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return SHORTENERS.has(host);
  } catch {
    return false;
  }
}

function isLookalikeUrl(urlStr: string): boolean {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    for (const brand of BRAND_TARGETS) {
      if (host.includes(brand) && !host.endsWith(`.${brand}.com`) && host !== `${brand}.com` && host !== `${brand}.pk`) {
        return true;
      }
    }
    if (/micros0ft|paypa1|amaz0n|g00gle|easypa1sa/i.test(host)) return true;
    return false;
  } catch {
    return false;
  }
}

function isLinkTextMismatched(text: string, href: string): boolean {
  try {
    const textUrlMatch = text.match(/https?:\/\/([^\s/]+)/i);
    if (textUrlMatch) {
      const textHost = textUrlMatch[1].toLowerCase().replace(/^www\./, "");
      const hrefHost = new URL(href).hostname.toLowerCase().replace(/^www\./, "");
      if (textHost !== hrefHost && !hrefHost.endsWith("." + textHost)) {
        return true;
      }
    }
    for (const brand of BRAND_TARGETS) {
      if (text.toLowerCase().includes(brand) && !href.toLowerCase().includes(brand)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Comprehensive Phishing Detection Engine (Rule-based heuristics).
 */
export function analyzeEmailHeuristics(emailText: string, senderHeader?: string): EmailPhishingResult {
  if (!emailText || emailText.trim().length === 0) {
    return {
      riskScore: 0,
      score: 0,
      level: "Safe",
      verdict: "safe",
      confidence: 1,
      findings: [],
      indicators: ["No content provided for analysis."],
      recommendations: ["Paste full email headers and body text for an accurate multi-layered inspection."],
      headers: {},
      extractedLinks: [],
      breakdown: {
        urgencyScore: 0,
        credentialScore: 0,
        credentialHarvestingScore: 0,
        spoofingScore: 0,
        threatScore: 0,
        financialThreatScore: 0,
        structuralScore: 0,
      },
      summary: "No content provided for analysis.",
    };
  }

  const findings: PhishingFinding[] = [];
  const parsedHeaders = parseEmailHeaders(emailText);
  if (senderHeader && !parsedHeaders.from) {
    parsedHeaders.from = senderHeader;
    const emailMatch = senderHeader.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) parsedHeaders.fromDomain = emailMatch[1].split("@")[1]?.toLowerCase();
  }

  const links = extractAndAnalyzeLinks(emailText);

  let urgencyScore = 0;
  let credentialScore = 0;
  let spoofingScore = 0;
  let threatScore = 0;
  let structuralScore = 0;

  // 1. Header Spoofing & Mismatch Checks
  if (parsedHeaders.fromName && parsedHeaders.fromDomain) {
    const lowerName = parsedHeaders.fromName.toLowerCase();
    for (const brand of BRAND_TARGETS) {
      if (lowerName.includes(brand) && !parsedHeaders.fromDomain.includes(brand)) {
        spoofingScore += 40;
        findings.push({
          type: "Display Name Spoofing",
          severity: "critical",
          evidence: `Display name claims "${parsedHeaders.fromName}" but actual domain is "${parsedHeaders.fromDomain}"`,
          explanation: "Attackers commonly set display names to reputable brand names while sending from free or compromised foreign domains.",
        });
        break;
      }
    }
  }

  if (parsedHeaders.replyToDomain && parsedHeaders.fromDomain && parsedHeaders.replyToDomain !== parsedHeaders.fromDomain) {
    spoofingScore += 35;
    findings.push({
      type: "Reply-To Mismatch",
      severity: "high",
      evidence: `From: ${parsedHeaders.fromDomain} vs Reply-To: ${parsedHeaders.replyToDomain}`,
      explanation: "Directing replies to a different domain than the sender is a classic tactic used to divert credential/payment responses.",
    });
  }

  if (parsedHeaders.spfResult === "fail") {
    spoofingScore += 30;
    findings.push({
      type: "SPF Authentication Failure",
      severity: "high",
      evidence: "Received-SPF: fail / softfail",
      explanation: "The sending server is not authorized by the domain owner's SPF record to transmit emails on its behalf.",
    });
  }

  if (parsedHeaders.dmarcResult === "fail") {
    spoofingScore += 30;
    findings.push({
      type: "DMARC Alignment Failure",
      severity: "high",
      evidence: "DMARC: fail",
      explanation: "The email failed DMARC policy validation, indicating probable domain spoofing.",
    });
  }

  // 2. Link Deception & Shorteners
  for (const link of links) {
    if (link.isMismatched) {
      structuralScore += 45;
      findings.push({
        type: "Deceptive Link Target",
        severity: "critical",
        evidence: `Text: "${link.text}" -> Actual Destination: "${link.href}"`,
        explanation: "The link's anchor text visually displays a trusted entity but points to a completely different domain.",
      });
    }
    if (link.isLookalike) {
      structuralScore += 40;
      findings.push({
        type: "Look-Alike / Typosquatted Domain Link",
        severity: "critical",
        evidence: link.href,
        explanation: "The URL incorporates a brand name in a sub-domain or typosquatted pattern mimicking official login portals.",
      });
    }
    if (link.isShortener) {
      structuralScore += 20;
      findings.push({
        type: "URL Shortener Cloaking",
        severity: "medium",
        evidence: link.href,
        explanation: "URL shorteners hide the final destination to bypass security gateway filters.",
      });
    }
  }

  // 3. Urgency & Time Pressure
  let urgencyHits = 0;
  for (const pat of URGENCY_TRIGGERS) {
    const match = emailText.match(pat);
    if (match) {
      urgencyHits++;
      if (urgencyHits <= 2) {
        findings.push({
          type: "Urgency Pressure Tactic",
          severity: "high",
          evidence: match[0],
          explanation: "High urgency cues are designed to induce panic and bypass logical scrutiny.",
        });
      }
    }
  }
  urgencyScore = Math.min(100, urgencyHits * 35);

  // 4. Credential / Sensitive Data Solicitation
  let credHits = 0;
  for (const pat of CREDENTIAL_HARVESTING) {
    const match = emailText.match(pat);
    if (match) {
      credHits++;
      if (credHits <= 2) {
        findings.push({
          type: "Credential / Sensitive Data Solicitation",
          severity: "critical",
          evidence: match[0],
          explanation: "Legitimate organizations rarely request passwords, PINs, or CNIC numbers via unauthenticated email links.",
        });
      }
    }
  }
  credentialScore = Math.min(100, credHits * 40);

  // 5. Threat & Legal Extortion
  let threatHits = 0;
  for (const pat of THREAT_LEGAL) {
    const match = emailText.match(pat);
    if (match) {
      threatHits++;
      findings.push({
        type: "Extortion / Threat Phrasing",
        severity: "critical",
        evidence: match[0],
        explanation: "Threatening law enforcement, FIA, or legal seizures is an extortion technique to force compliance.",
      });
    }
  }
  for (const pat of FINANCIAL_LURES) {
    const match = emailText.match(pat);
    if (match) {
      threatHits++;
      findings.push({
        type: "Financial / Lottery Lure",
        severity: "high",
        evidence: match[0],
        explanation: "Unsolicited cash grants, lottery prizes, or tax refunds are hallmarks of advance-fee fraud.",
      });
    }
  }
  threatScore = Math.min(100, threatHits * 35);

  // 6. Generic Greetings & Structural Red Flags
  for (const pat of GENERIC_GREETINGS) {
    const match = emailText.match(pat);
    if (match) {
      structuralScore += 10;
      findings.push({
        type: "Generic Impersonal Greeting",
        severity: "low",
        evidence: match[0],
        explanation: "Mass-campaign phishing emails lack personalized recipient names.",
      });
      break;
    }
  }

  // Risky attachments
  const attachmentMatch = emailText.match(RISKY_ATTACHMENTS);
  if (attachmentMatch || /attachment:\s*.*\.(exe|scr|vbs|zip|iso)/i.test(emailText)) {
    structuralScore += 35;
    findings.push({
      type: "Executable or Risky Archive Attachment",
      severity: "critical",
      evidence: attachmentMatch ? attachmentMatch[0] : "Embedded risky attachment",
      explanation: "Email contains or references executable or macro-enabled attachments often used to deliver trojans.",
    });
  }

  // Embedded HTML Form / Password Input
  if (/<form/i.test(emailText) || /type=["']password["']/i.test(emailText)) {
    structuralScore += 45;
    findings.push({
      type: "Embedded HTML Form / Password Field",
      severity: "critical",
      evidence: "<form> or password input tag",
      explanation: "Emails containing embedded credential forms directly harvest credentials in-client.",
    });
  }

  // ALL CAPS excessive subject
  if (parsedHeaders.subject && parsedHeaders.subject === parsedHeaders.subject.toUpperCase() && parsedHeaders.subject.length > 15) {
    structuralScore += 15;
    findings.push({
      type: "Aggressive ALL CAPS Subject",
      severity: "low",
      evidence: parsedHeaders.subject,
      explanation: "Full-capitalization headers are typical of aggressive scam outreach.",
    });
  }

  // Calculate composite risk score directly from findings severity
  let calculatedRisk = 0;
  for (const f of findings) {
    if (f.severity === "critical") calculatedRisk += 35;
    else if (f.severity === "high") calculatedRisk += 25;
    else if (f.severity === "medium") calculatedRisk += 15;
    else calculatedRisk += 5;
  }

  // Add bonus for links present with urgency or credential solicitations
  if (links.length > 0 && (urgencyHits > 0 || credHits > 0)) {
    calculatedRisk += 20;
  }

  const finalScore = Math.min(100, Math.max(0, calculatedRisk));
  const criticalCount = findings.filter(f => f.severity === "critical").length;

  let level: PhishingLevel = "Safe";
  let verdict: "safe" | "suspicious" | "malicious" = "safe";

  if (finalScore >= 65 || criticalCount >= 2) {
    level = "Phishing Detected";
    verdict = "malicious";
  } else if (finalScore >= 40 || criticalCount === 1) {
    level = "High Risk";
    verdict = "malicious";
  } else if (finalScore >= 15 || findings.length > 0) {
    level = "Suspicious";
    verdict = "suspicious";
  } else {
    level = "Safe";
    verdict = "safe";
  }

  const recommendations: string[] = [];
  if (level === "Phishing Detected" || level === "High Risk") {
    recommendations.push("Do NOT click any links, download attachments, or reply to this email.");
    recommendations.push("Report this email immediately to your IT / Security Operations team.");
    recommendations.push("If you entered login credentials, change your password immediately and revoke active sessions.");
    recommendations.push("Verify communications by visiting official portals directly through a known bookmark.");
  } else if (level === "Suspicious") {
    recommendations.push("Exercise caution. Verify the sender domain and inspect destination URLs before clicking.");
    recommendations.push("Avoid submitting sensitive credentials or financial details via email links.");
  } else {
    recommendations.push("No acute phishing threats identified in this message.");
    recommendations.push("Continue maintaining good cyber hygiene by checking sender details.");
  }

  const indicatorSummaries = findings.map(f => `${f.type}: ${f.evidence}`);

  return {
    riskScore: finalScore,
    score: finalScore,
    level,
    verdict,
    confidence: 0.92,
    findings,
    indicators: indicatorSummaries.length > 0 ? indicatorSummaries : ["Standard email communication patterns."],
    recommendations,
    headers: parsedHeaders,
    extractedLinks: links,
    breakdown: {
      urgencyScore: Math.min(100, urgencyScore),
      credentialScore: Math.min(100, credentialScore),
      credentialHarvestingScore: Math.min(100, credentialScore),
      spoofingScore: Math.min(100, spoofingScore),
      threatScore: Math.min(100, threatScore),
      financialThreatScore: Math.min(100, threatScore),
      structuralScore: Math.min(100, structuralScore),
    },
    summary:
      verdict === "malicious"
        ? `High-confidence phishing campaign detected with ${findings.length} threat indicator(s). Key factors include deceptive links or credential harvesting.`
        : verdict === "suspicious"
        ? `Potential social engineering signals identified (${findings.length} indicator(s)). Review carefully before interacting.`
        : "Email heuristics indicate low risk. Standard communication profile detected.",
  };
}
