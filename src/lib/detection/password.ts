export interface PasswordAnalysisResult {
  score: number; // 0 to 100
  percentage?: number; // alias for score
  levelScore: number; // 0 to 4
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  crackTimeDisplay: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasNoRepeats: boolean;
  hasNoSequences: boolean;
  hasNoCommonWords: boolean;
  hasNoDates: boolean;
  entropyBits: number;
  suggestions: string[];
}

const COMMON_PASSWORDS = new Set([
  "password", "123456", "12345678", "123456789", "12345", "1234", "qwerty",
  "admin", "welcome", "login", "secret", "iloveyou", "princess", "rockyou",
  "football", "monkey", "dragon", "master", "shadow", "abc123", "password1",
  "trustno1", "letmein", "sunshine", "starwars", "chelsea", "arsenal", "liverpool",
  "pakistan", "lahore", "karachi", "islamabad", "superman", "batman", "pokemon"
]);

const KEYBOARD_PATTERNS = [
  "qwerty", "asdfgh", "zxcvbn", "qwertz", "azerty",
  "123456", "234567", "345678", "456789", "567890",
  "abcdef", "bcdefg", "cdefgh", "defghi",
  "1qaz", "2wsx", "3edc", "4rfv", "5tgb", "6yhn", "7ujm", "8ik,", "9ol.", "0p;/"
];

export function evaluatePasswordStrength(password: string): PasswordAnalysisResult {
  if (!password) {
    return {
      score: 0,
      percentage: 0,
      levelScore: 0,
      label: "Very Weak",
      crackTimeDisplay: "Instant",
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false,
      hasSymbols: false,
      hasNoRepeats: true,
      hasNoSequences: true,
      hasNoCommonWords: true,
      hasNoDates: true,
      entropyBits: 0,
      suggestions: ["Enter a password to evaluate its resilience."],
    };
  }

  const length = password.length;
  const hasMinLength = length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  // Pool size calculation for Shannon Entropy
  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 33;

  const entropyBits = poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0;

  // Penalty / Pattern Checks
  let penalty = 0;
  const lower = password.toLowerCase();

  // 1. Repeated characters (e.g. "aaa", "111")
  const hasRepeats = /(.)\1{2,}/.test(password);
  if (hasRepeats) penalty += 18;

  // 2. Sequential characters (e.g. "1234", "abcd")
  let hasSequences = false;
  for (let i = 0; i < password.length - 2; i++) {
    const c1 = password.charCodeAt(i);
    const c2 = password.charCodeAt(i + 1);
    const c3 = password.charCodeAt(i + 2);
    if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) {
      hasSequences = true;
      break;
    }
  }
  for (const pat of KEYBOARD_PATTERNS) {
    if (lower.includes(pat)) {
      hasSequences = true;
      break;
    }
  }
  if (hasSequences) penalty += 20;

  // 3. Common password / dictionary match
  let hasCommonWords = false;
  if (COMMON_PASSWORDS.has(lower)) {
    hasCommonWords = true;
    penalty += 45;
  } else {
    for (const common of Array.from(COMMON_PASSWORDS)) {
      if (lower.length > 5 && lower.includes(common)) {
        hasCommonWords = true;
        penalty += 25;
        break;
      }
    }
  }

  // 4. Dates & Years (1950 - 2035)
  const hasDates = /(19[5-9]\d|20[0-3]\d)/.test(password);
  if (hasDates) penalty += 15;

  // 5. Length deductions
  if (length < 8) penalty += 30;
  if (length < 6) penalty += 40;

  // Base raw score computation (0 - 100)
  let rawScore = Math.max(0, Math.min(100, Math.round(entropyBits * 1.15) - penalty));

  // Determine Level Score (0..4) and Label
  let levelScore = 0;
  let label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong" = "Very Weak";
  let crackTimeDisplay = "Instant";

  if (rawScore < 25 || length < 6 || hasCommonWords) {
    levelScore = 0;
    label = "Very Weak";
    crackTimeDisplay = "Instant (< 1 ms)";
  } else if (rawScore < 45 || length < 8) {
    levelScore = 1;
    label = "Weak";
    crackTimeDisplay = "A few seconds to minutes";
  } else if (rawScore < 65 || length < 10) {
    levelScore = 2;
    label = "Fair";
    crackTimeDisplay = "Hours to days";
  } else if (rawScore < 85 || length < 12) {
    levelScore = 3;
    label = "Strong";
    crackTimeDisplay = "Months to years";
  } else {
    levelScore = 4;
    label = "Very Strong";
    crackTimeDisplay = "Centuries / Mathematically Infeasible";
  }

  const suggestions: string[] = [];
  if (length < 12) {
    suggestions.push("Increase length to at least 12–16 characters for exponentially higher entropy.");
  }
  if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSymbols) {
    suggestions.push("Use a diverse mix of uppercase, lowercase, numbers, and symbols.");
  }
  if (hasCommonWords) {
    suggestions.push("Avoid using dictionary words, brand names, or common dictionary substitutions.");
  }
  if (hasDates) {
    suggestions.push("Avoid using personal birth years, dates, or recognizable year numbers.");
  }
  if (hasSequences || hasRepeats) {
    suggestions.push("Avoid sequential patterns (e.g. 1234, qwerty) and repeated characters.");
  }

  return {
    score: rawScore,
    percentage: rawScore,
    levelScore,
    label,
    crackTimeDisplay,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    hasNoRepeats: !hasRepeats,
    hasNoSequences: !hasSequences,
    hasNoCommonWords: !hasCommonWords,
    hasNoDates: !hasDates,
    entropyBits,
    suggestions: suggestions.length > 0 ? suggestions : ["Excellent entropy! Your password is very resilient."],
  };
}

/**
 * Generates a cryptographically strong random password using browser-safe Web Crypto API.
 */
export function generateSecurePassword(options: {
  length?: number;
  useUpper?: boolean;
  useLower?: boolean;
  useNumbers?: boolean;
  useSymbols?: boolean;
} = {}): string {
  const length = options.length ?? 16;
  const useUpper = options.useUpper ?? true;
  const useLower = options.useLower ?? true;
  const useNumbers = options.useNumbers ?? true;
  const useSymbols = options.useSymbols ?? true;

  let chars = "";
  if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useNumbers) chars += "0123456789";
  if (useSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (!chars) chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  const array = new Uint32Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * chars.length);
    }
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Generates an easy-to-remember multi-word passphrase.
 */
export function generatePassphrase(wordCount = 4): string {
  const words = [
    "galaxy", "fortress", "shield", "beacon", "crypto", "quantum", "horizon",
    "velocity", "sentinel", "nebula", "glacier", "starlight", "matrix", "falcon",
    "timber", "vanguard", "cascade", "orbit", "thunder", "pyramid", "phoenix",
    "cobalt", "granite", "solitude", "zenith", "vertex", "dynamo", "spectral"
  ];

  const selected: string[] = [];
  const array = new Uint32Array(wordCount);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < wordCount; i++) array[i] = Math.floor(Math.random() * words.length);
  }

  for (let i = 0; i < wordCount; i++) {
    selected.push(words[array[i] % words.length]);
  }

  return selected.join("-") + "-" + (10 + (array[0] % 90));
}

/**
 * Checks HIBP Pwned Passwords API using SHA-1 k-Anonymity model.
 * Only the first 5 characters of the SHA-1 hash ever leave the client.
 */
export async function checkPwnedPasswordClient(sha1Hash: string): Promise<{ breached: boolean; count: number }> {
  try {
    const hash = sha1Hash.toUpperCase();
    if (hash.length !== 40) return { breached: false, count: 0 };

    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });

    if (!res.ok) return { breached: false, count: 0 };
    const text = await res.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const [lineSuffix, countStr] = line.trim().split(":");
      if (lineSuffix === suffix) {
        return {
          breached: true,
          count: parseInt(countStr, 10) || 1,
        };
      }
    }
    return { breached: false, count: 0 };
  } catch {
    return { breached: false, count: 0 };
  }
}
