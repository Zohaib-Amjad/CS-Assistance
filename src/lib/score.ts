export interface ScoreFactor {
  name: string;
  score: number; // 0 to 20
  maxScore: 20;
  weight: number; // 20%
  description: string;
  status: "good" | "fair" | "poor";
  tips: string[];
}

export interface SecurityScoreResult {
  score: number; // 0 to 100
  label: "Needs Improvement" | "Fair" | "Good" | "Excellent";
  badgeColor: "danger" | "warning" | "info" | "success";
  factors: {
    passwordHygiene: ScoreFactor;
    quizKnowledge: ScoreFactor;
    safeBrowsing: ScoreFactor;
    securityActivity: ScoreFactor;
    accountSecurity: ScoreFactor;
  };
  recommendations: string[];
  lastCalculated: string;
  disclaimer: string;
}

export interface UserSecurityMetrics {
  // Account Security
  twoFaEnabled: boolean;
  hasStrongPassword: boolean;
  failedLoginAttemptsCount?: number;
  emailVerified?: boolean;

  // Password Hygiene
  recentPasswordScansCount?: number;
  lastPasswordScore?: number; // 0 - 100

  // Quiz Knowledge
  quizzesCompleted?: number;
  quizAverageScore?: number; // 0 - 100
  passedQuizzesCount?: number;

  // Safe Browsing Behaviour
  urlScansCount?: number;
  emailScansCount?: number;
  maliciousScansFound?: number;

  // Security Activity
  loginStreakDays?: number;
  scansPast30Days?: number;
  lastActivityDaysAgo?: number;
}

/**
 * Calculates the CyberGuard Security Score (0–100) across five 20-point factors.
 * The score is an educational indicator designed to encourage proactive cyber hygiene.
 */
export function calculateCyberGuardScore(metrics: UserSecurityMetrics): SecurityScoreResult {
  // 1. Password Hygiene (0 - 20 pts)
  let passwordPoints = 0;
  const passwordTips: string[] = [];
  if (metrics.lastPasswordScore !== undefined) {
    if (metrics.lastPasswordScore >= 80) {
      passwordPoints += 15;
    } else if (metrics.lastPasswordScore >= 50) {
      passwordPoints += 10;
      passwordTips.push("Improve your master password strength to 16+ characters.");
    } else {
      passwordPoints += 4;
      passwordTips.push("Your analyzed password is weak. Use a passphrase with mixed characters.");
    }
  } else {
    passwordPoints += 8; // Default baseline if not tested yet
    passwordTips.push("Run a password analysis in the Password Strength Checker.");
  }

  if ((metrics.recentPasswordScansCount ?? 0) > 0) {
    passwordPoints += 5;
  } else {
    passwordTips.push("Regularly test your credentials against leak databases.");
  }
  passwordPoints = Math.min(20, Math.max(0, passwordPoints));

  // 2. Quiz Knowledge (0 - 20 pts)
  let quizPoints = 0;
  const quizTips: string[] = [];
  const completed = metrics.quizzesCompleted ?? 0;
  const avg = metrics.quizAverageScore ?? 0;

  if (completed >= 3 && avg >= 80) {
    quizPoints = 20;
  } else if (completed >= 2 && avg >= 70) {
    quizPoints = 16;
  } else if (completed >= 1) {
    quizPoints = Math.round(Math.min(14, (avg / 100) * 12 + 4));
    if (avg < 70) quizTips.push("Retake cyber awareness quizzes to boost threat recognition.");
  } else {
    quizPoints = 5;
    quizTips.push("Complete interactive cyber quizzes to test your defensive knowledge.");
  }
  quizPoints = Math.min(20, Math.max(0, quizPoints));

  // 3. Safe Browsing Behaviour (0 - 20 pts)
  let safeBrowsingPoints = 0;
  const safeTips: string[] = [];
  const urlScans = metrics.urlScansCount ?? 0;
  const emailScans = metrics.emailScansCount ?? 0;
  const totalScans = urlScans + emailScans;

  if (totalScans >= 10) {
    safeBrowsingPoints = 20;
  } else if (totalScans >= 5) {
    safeBrowsingPoints = 15;
    safeTips.push("Continue scanning unknown links and emails before opening.");
  } else if (totalScans >= 1) {
    safeBrowsingPoints = 10;
    safeTips.push("Make it a habit to check suspicious URLs with the URL Safety Checker.");
  } else {
    safeBrowsingPoints = 4;
    safeTips.push("Scan suspicious emails and links using CyberGuard inspection tools.");
  }
  safeBrowsingPoints = Math.min(20, Math.max(0, safeBrowsingPoints));

  // 4. Security Activity (0 - 20 pts)
  let activityPoints = 0;
  const activityTips: string[] = [];
  const streak = metrics.loginStreakDays ?? 0;
  const recent30 = metrics.scansPast30Days ?? 0;

  if (streak >= 7 || recent30 >= 15) {
    activityPoints = 20;
  } else if (streak >= 3 || recent30 >= 5) {
    activityPoints = 14;
    activityTips.push("Maintain your daily security streak to earn defensive achievements.");
  } else if (streak >= 1 || recent30 >= 1) {
    activityPoints = 9;
    activityTips.push("Check the security dashboard regularly for fresh cyber intelligence.");
  } else {
    activityPoints = 4;
    activityTips.push("Log in regularly to stay informed on emerging zero-day vulnerabilities.");
  }
  activityPoints = Math.min(20, Math.max(0, activityPoints));

  // 5. Account Security (0 - 20 pts)
  let accountPoints = 0;
  const accountTips: string[] = [];
  if (metrics.twoFaEnabled) {
    accountPoints += 10;
  } else {
    accountTips.push("Enable Two-Factor Authentication (2FA) for hardware/app MFA.");
  }

  if (metrics.hasStrongPassword) {
    accountPoints += 6;
  } else {
    accountTips.push("Set a unique, high-entropy password on your CyberGuard account.");
  }

  if ((metrics.failedLoginAttemptsCount ?? 0) === 0) {
    accountPoints += 4;
  } else {
    accountTips.push("Review recent login attempts to monitor for unauthorized access.");
  }
  accountPoints = Math.min(20, Math.max(0, accountPoints));

  // Aggregate composite score
  const totalScore = passwordPoints + quizPoints + safeBrowsingPoints + activityPoints + accountPoints;

  let label: "Needs Improvement" | "Fair" | "Good" | "Excellent" = "Needs Improvement";
  let badgeColor: "danger" | "warning" | "info" | "success" = "danger";

  if (totalScore >= 80) {
    label = "Excellent";
    badgeColor = "success";
  } else if (totalScore >= 60) {
    label = "Good";
    badgeColor = "info";
  } else if (totalScore >= 40) {
    label = "Fair";
    badgeColor = "warning";
  } else {
    label = "Needs Improvement";
    badgeColor = "danger";
  }

  const helperStatus = (pts: number): "good" | "fair" | "poor" => {
    if (pts >= 16) return "good";
    if (pts >= 10) return "fair";
    return "poor";
  };

  const allRecommendations = [
    ...accountTips,
    ...passwordTips,
    ...quizTips,
    ...safeTips,
    ...activityTips,
  ].slice(0, 4);

  return {
    score: totalScore,
    label,
    badgeColor,
    factors: {
      passwordHygiene: {
        name: "Password Hygiene",
        score: passwordPoints,
        maxScore: 20,
        weight: 0.2,
        description: "Evaluates entropy, length, uniqueness, and breach history checks.",
        status: helperStatus(passwordPoints),
        tips: passwordTips,
      },
      quizKnowledge: {
        name: "Quiz Knowledge",
        score: quizPoints,
        maxScore: 20,
        weight: 0.2,
        description: "Measures threat awareness and security concept mastery.",
        status: helperStatus(quizPoints),
        tips: quizTips,
      },
      safeBrowsing: {
        name: "Safe Browsing",
        score: safeBrowsingPoints,
        maxScore: 20,
        weight: 0.2,
        description: "Tracks inspection of suspicious URLs and phishing email payloads.",
        status: helperStatus(safeBrowsingPoints),
        tips: safeTips,
      },
      securityActivity: {
        name: "Security Activity",
        score: activityPoints,
        maxScore: 20,
        weight: 0.2,
        description: "Rewards regular defensive practice, streaks, and platform engagement.",
        status: helperStatus(activityPoints),
        tips: activityTips,
      },
      accountSecurity: {
        name: "Account Security",
        score: accountPoints,
        maxScore: 20,
        weight: 0.2,
        description: "Reflects account protection posture including 2FA and credential hygiene.",
        status: helperStatus(accountPoints),
        tips: accountTips,
      },
    },
    recommendations: allRecommendations.length > 0 ? allRecommendations : ["Your security posture is exemplary! Keep up the good habits."],
    lastCalculated: new Date().toISOString(),
    disclaimer: "CyberGuard Security Score is an educational indicator designed to guide defensive hygiene. It does not guarantee immunity from cyber threats.",
  };
}
