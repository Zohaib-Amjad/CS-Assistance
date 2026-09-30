import { db } from "./index";
import {
  users,
  quizzes,
  quizQuestions,
  securityTips,
  achievements,
  userAchievements,
  emailScans,
  urlScans,
  passwordChecks,
  scans,
  quizAttempts,
  activityLogs,
  notifications,
  chatConversations,
  chatMessages,
  blockedDomains,
} from "./schema";
import { initSchema } from "./init-schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  console.log("🌱 Starting complete idempotent database seed...");
  await initSchema();

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash("admin123", saltRounds);
  const userPasswordHash = await bcrypt.hash("user123", saltRounds);

  // ----------------------------------------------------
  // 1. SEED USERS
  // ----------------------------------------------------
  console.log("👤 Seeding system and demo users...");

  const usersList = [
    {
      id: "admin-system-id",
      name: "CyberGuard Administrator",
      email: "admin@cyberguard.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN" as const,
      plan: "PREMIUM" as const,
      status: "ACTIVE" as const,
      securityScore: 98,
      twoFaEnabled: true,
      bio: "Lead Cybersecurity Architect & Platform Administrator",
      phone: "+1 (555) 019-2834",
      country: "United States",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date(),
    },
    {
      id: "admin-ai-id",
      name: "Admin Superuser",
      email: "admin@cyberguard.ai",
      passwordHash: adminPasswordHash,
      role: "ADMIN" as const,
      plan: "PREMIUM" as const,
      status: "ACTIVE" as const,
      securityScore: 96,
      twoFaEnabled: true,
      bio: "Enterprise Security Operations",
      phone: "+1 (555) 014-9988",
      country: "United Kingdom",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date(),
    },
    {
      id: "amna-khan-id",
      name: "Amna Khan",
      email: "amna.khan@example.com",
      passwordHash: userPasswordHash,
      role: "USER" as const,
      plan: "PREMIUM" as const,
      status: "ACTIVE" as const,
      securityScore: 92,
      twoFaEnabled: true,
      loginStreak: 14,
      bio: "Senior Security Analyst & Researcher. Enthusiastic about defensive machine learning.",
      phone: "+92 300 1234567",
      country: "Pakistan",
      createdAt: new Date("2024-05-15T09:30:00Z"),
      updatedAt: new Date(),
    },
    {
      id: "ali-raza-id",
      name: "Ali Raza",
      email: "ali.raza@example.com",
      passwordHash: userPasswordHash,
      role: "USER" as const,
      plan: "FREE" as const,
      status: "ACTIVE" as const,
      securityScore: 84,
      twoFaEnabled: false,
      loginStreak: 5,
      bio: "Software Engineer exploring web application security.",
      phone: "+92 321 9876543",
      country: "Pakistan",
      createdAt: new Date("2024-05-16T11:15:00Z"),
      updatedAt: new Date(),
    },
    {
      id: "sarah-ahmed-id",
      name: "Sarah Ahmed",
      email: "sarah.ahmed@example.com",
      passwordHash: userPasswordHash,
      role: "USER" as const,
      plan: "FREE" as const,
      status: "ACTIVE" as const,
      securityScore: 78,
      twoFaEnabled: false,
      loginStreak: 2,
      bio: "Product Designer passionate about user-centric security warnings.",
      phone: "+92 333 4567890",
      country: "Pakistan",
      createdAt: new Date("2024-05-17T14:45:00Z"),
      updatedAt: new Date(),
    },
    {
      id: "usman-tariq-id",
      name: "Usman Tariq",
      email: "usman.tariq@example.com",
      passwordHash: userPasswordHash,
      role: "USER" as const,
      plan: "FREE" as const,
      status: "INACTIVE" as const,
      securityScore: 65,
      twoFaEnabled: false,
      loginStreak: 0,
      bio: "DevOps specialist.",
      phone: "+92 345 6789012",
      country: "Pakistan",
      createdAt: new Date("2024-05-18T08:20:00Z"),
      updatedAt: new Date(),
    },
    {
      id: "bilal-hassan-id",
      name: "Bilal Hassan",
      email: "bilal.hassan@example.com",
      passwordHash: userPasswordHash,
      role: "USER" as const,
      plan: "PREMIUM" as const,
      status: "ACTIVE" as const,
      securityScore: 88,
      twoFaEnabled: true,
      loginStreak: 8,
      bio: "Network Administrator with 6+ years in firewall and DNS filtering.",
      phone: "+92 301 2345678",
      country: "Pakistan",
      createdAt: new Date("2024-05-19T10:00:00Z"),
      updatedAt: new Date(),
    },
    {
      id: "fatima-noor-id",
      name: "Fatima Noor",
      email: "fatima.noor@example.com",
      passwordHash: userPasswordHash,
      role: "USER" as const,
      plan: "FREE" as const,
      status: "ACTIVE" as const,
      securityScore: 90,
      twoFaEnabled: true,
      loginStreak: 11,
      bio: "Computer Science Undergraduate.",
      phone: "+92 312 3456789",
      country: "Pakistan",
      createdAt: new Date("2024-05-20T16:30:00Z"),
      updatedAt: new Date(),
    },
    {
      id: "user-demo-id",
      name: "Amna Khan",
      email: "user@cyberguard.ai",
      passwordHash: userPasswordHash,
      role: "USER" as const,
      plan: "PREMIUM" as const,
      status: "ACTIVE" as const,
      securityScore: 92,
      twoFaEnabled: true,
      loginStreak: 14,
      bio: "Senior Security Analyst & Researcher.",
      phone: "+92 300 1234567",
      country: "Pakistan",
      createdAt: new Date("2024-05-15T09:30:00Z"),
      updatedAt: new Date(),
    },
  ];

  for (const u of usersList) {
    const existing = await db.select().from(users).where(eq(users.email, u.email)).get();
    if (!existing) {
      await db.insert(users).values(u);
    } else {
      await db.update(users).set(u).where(eq(users.email, u.email));
    }
  }

  // ----------------------------------------------------
  // 2. SEED ACHIEVEMENTS
  // ----------------------------------------------------
  console.log("🏆 Seeding achievements...");

  const achievementsList = [
    {
      id: "ach-first-scan",
      code: "first_scan",
      title: "First Scan",
      description: "Completed your first security inspection on email, URL, or credentials.",
      icon: "ShieldCheck",
      points: 50,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "ach-phishing-master",
      code: "phishing_master",
      title: "Phishing Sleuth",
      description: "Successfully analyzed and neutralized 10 deceptive phishing emails.",
      icon: "MailCheck",
      points: 100,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "ach-password-fortress",
      code: "password_fortress",
      title: "Password Fortress",
      description: "Constructed a 100% entropy breach-resistant password.",
      icon: "KeyRound",
      points: 100,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "ach-url-sleuth",
      code: "url_sleuth",
      title: "URL Investigator",
      description: "Safely inspected 25 unknown web links across domain and SSL layers.",
      icon: "Globe",
      points: 75,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "ach-quiz-champion",
      code: "quiz_champion",
      title: "Quiz Champion",
      description: "Achieved a perfect 100% score on a cyber defense awareness challenge.",
      icon: "Trophy",
      points: 150,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "ach-streak-master",
      code: "streak_master",
      title: "7-Day Defender",
      description: "Maintained an active security streak for 7 consecutive days.",
      icon: "Flame",
      points: 120,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "ach-bug-hunter",
      code: "bug_hunter",
      title: "Vulnerability Scout",
      description: "Identified a critical security risk before potential exploitation.",
      icon: "Crosshair",
      points: 100,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "ach-two-fa-hero",
      code: "two_fa_hero",
      title: "2FA Vanguard",
      description: "Hardened account protection with multi-factor authentication.",
      icon: "Lock",
      points: 80,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "ach-ai-collaborator",
      code: "ai_collaborator",
      title: "AI Sentinel",
      description: "Consulted the defensive AI security assistant for threat mitigation.",
      icon: "BotMessageSquare",
      points: 90,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "ach-cyber-guardian",
      code: "cyber_guardian",
      title: "Grand Cyber Guardian",
      description: "Reached an overall security score above 90.",
      icon: "Award",
      points: 200,
      createdAt: new Date("2024-01-01"),
    },
  ];

  for (const ach of achievementsList) {
    const existing = await db.select().from(achievements).where(eq(achievements.code, ach.code)).get();
    if (!existing) {
      await db.insert(achievements).values(ach);
    }
  }

  // ----------------------------------------------------
  // 3. SEED SECURITY TIPS (12+ Tips)
  // ----------------------------------------------------
  console.log("💡 Seeding 12+ security tips...");

  const tipsList = [
    {
      id: "tip-1",
      title: "Use Strong Passwords",
      category: "Passwords",
      tip: "Generate passwords with 16+ characters combining uppercase, lowercase, numbers, and symbols.",
      text: "Generate passwords with 16+ characters combining uppercase, lowercase, numbers, and symbols.",
      action: "Test Password",
      actionPrompt: "Audit password strength in the Password Checker",
      isFeatured: true,
      isDaily: true,
    },
    {
      id: "tip-2",
      title: "Enable 2FA Authentication",
      category: "Account Security",
      tip: "Turn on two-factor authentication (2FA) via authenticator apps or hardware keys everywhere possible.",
      text: "Turn on two-factor authentication (2FA) via authenticator apps or hardware keys everywhere possible.",
      action: "Enable 2FA",
      actionPrompt: "Configure multi-factor authentication in Settings",
      isFeatured: true,
      isDaily: false,
    },
    {
      id: "tip-3",
      title: "Don't Click Unknown Links",
      category: "Safe Browsing",
      tip: "Hover over URLs to inspect true destination domains and watch out for lookalike typosquatting.",
      text: "Hover over URLs to inspect true destination domains and watch out for lookalike typosquatting.",
      action: "Scan URL",
      actionPrompt: "Scan suspicious links with the URL Checker",
      isFeatured: true,
      isDaily: false,
    },
    {
      id: "tip-4",
      title: "Keep Software Updated",
      category: "Endpoint Security",
      tip: "Apply operating system, browser, and security patches immediately to mitigate zero-day vulnerabilities.",
      text: "Apply operating system, browser, and security patches immediately to mitigate zero-day vulnerabilities.",
      action: "Check Updates",
      actionPrompt: "Ensure automatic security updates are enabled on all devices",
      isFeatured: false,
      isDaily: false,
    },
    {
      id: "tip-5",
      title: "Beware of Urgent Phishing Scams",
      category: "Email Security",
      tip: "Attackers manufacture artificial urgency ('Account suspended in 24 hours') to bypass rational thinking.",
      text: "Attackers manufacture artificial urgency ('Account suspended in 24 hours') to bypass rational thinking.",
      action: "Analyze Email",
      actionPrompt: "Submit suspicious messages to the AI Phishing Analyzer",
      isFeatured: true,
      isDaily: false,
    },
    {
      id: "tip-6",
      title: "Never Reuse Passwords Across Accounts",
      category: "Passwords",
      tip: "Credential stuffing exploits reused passwords across different websites after one breach occurs.",
      text: "Credential stuffing exploits reused passwords across different websites after one breach occurs.",
      action: "Audit Breaches",
      actionPrompt: "Use dedicated password managers to generate unique keys",
      isFeatured: false,
      isDaily: false,
    },
    {
      id: "tip-7",
      title: "Verify SSL and Domain Reputation",
      category: "Safe Browsing",
      tip: "Ensure HTTPS padlock is present, but remember that HTTPS only encrypts traffic; malicious sites can have SSL too.",
      text: "Ensure HTTPS padlock is present, but remember that HTTPS only encrypts traffic; malicious sites can have SSL too.",
      action: "Inspect Certificate",
      actionPrompt: "Review SSL and domain age in the URL scanner",
      isFeatured: false,
      isDaily: false,
    },
    {
      id: "tip-8",
      title: "Disable Macro & Auto-run Attachments",
      category: "Email Security",
      tip: "Never enable macros in received Office files (.docm, .xlsm) unless explicitly verified out-of-band.",
      text: "Never enable macros in received Office files (.docm, .xlsm) unless explicitly verified out-of-band.",
      action: "Safety Guidelines",
      actionPrompt: "Treat unexpected attachments with zero trust",
      isFeatured: false,
      isDaily: false,
    },
    {
      id: "tip-9",
      title: "Audit Connected OAuth Apps",
      category: "Account Security",
      tip: "Periodically revoke third-party app permissions connected to your Google, Microsoft, and GitHub accounts.",
      text: "Periodically revoke third-party app permissions connected to your Google, Microsoft, and GitHub accounts.",
      action: "Review Permissions",
      actionPrompt: "Check third-party OAuth access in account settings",
      isFeatured: false,
      isDaily: false,
    },
    {
      id: "tip-10",
      title: "Maintain Encrypted Offline Backups",
      category: "Data Protection",
      tip: "Follow the 3-2-1 backup rule (3 copies, 2 different media, 1 offsite/offline) to defeat ransomware attacks.",
      text: "Follow the 3-2-1 backup rule (3 copies, 2 different media, 1 offsite/offline) to defeat ransomware attacks.",
      action: "Backup Strategy",
      actionPrompt: "Verify that sensitive documents are backed up securely",
      isFeatured: false,
      isDaily: false,
    },
    {
      id: "tip-11",
      title: "Avoid Public Wi-Fi Without VPN",
      category: "Network Security",
      tip: "Unsecured public networks allow adversary-in-the-middle packet capture and DNS spoofing attacks.",
      text: "Unsecured public networks allow adversary-in-the-middle packet capture and DNS spoofing attacks.",
      action: "Network Security",
      actionPrompt: "Use encrypted tunnels when working on public hotspots",
      isFeatured: false,
      isDaily: false,
    },
    {
      id: "tip-12",
      title: "Verify Sensitive Requests Out-of-Band",
      category: "Social Engineering",
      tip: "If a colleague or executive urgently requests wire transfers or credential sharing, verify via phone call.",
      text: "If a colleague or executive urgently requests wire transfers or credential sharing, verify via phone call.",
      action: "Verification Protocols",
      actionPrompt: "Follow dual-custody verification for high-risk operations",
      isFeatured: false,
      isDaily: false,
    },
  ];

  for (const tip of tipsList) {
    const existing = await db.select().from(securityTips).where(eq(securityTips.id, tip.id)).get();
    if (!existing) {
      await db.insert(securityTips).values({ ...tip, createdAt: new Date() });
    }
  }

  // ----------------------------------------------------
  // 4. SEED 4 PUBLISHED QUIZZES WITH 60+ QUESTIONS
  // ----------------------------------------------------
  console.log("📚 Seeding 4 comprehensive cybersecurity quizzes (60+ questions)...");

  const quizzesList = [
    {
      id: "quiz-phishing",
      title: "Phishing Recognition & Email Spoofing",
      description: "Master the art of detecting spear phishing, display name spoofing, malicious attachments, and credential harvesting emails.",
      difficulty: "BEGINNER" as const,
      category: "Email Security",
      isPublished: true,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "quiz-password",
      title: "Password Security & Credential Hygiene",
      description: "Evaluate entropy, brute-force defenses, credential stuffing, password managers, and zero-knowledge architectures.",
      difficulty: "INTERMEDIATE" as const,
      category: "Authentication",
      isPublished: true,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "quiz-urls",
      title: "Safe Browsing, URLs & Web Exploits",
      description: "Learn how to spot homograph attacks, typosquatted hostnames, malicious redirects, and insecure web connections.",
      difficulty: "BEGINNER" as const,
      category: "Web Security",
      isPublished: true,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "quiz-social",
      title: "Social Engineering, MFA & Zero Trust",
      description: "Understand pretexting, SIM swapping, push notification fatigue, hardware security tokens, and least privilege access.",
      difficulty: "ADVANCED" as const,
      category: "Social Engineering",
      isPublished: true,
      createdAt: new Date("2024-01-01"),
    },
  ];

  for (const q of quizzesList) {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, q.id)).get();
    if (!existing) {
      await db.insert(quizzes).values(q);
    }
  }

  // Define 15 questions for each of the 4 quizzes (60 total)
  const allQuestions = [
    // --- QUIZ 1: Phishing Recognition (15 Questions) ---
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Beginner",
      question: "What is the primary indicator of an email sender being spoofed?",
      options: [
        "The email arrived late at night",
        "The display name says 'PayPal Support' but the actual header domain is '@paypa1-security.com'",
        "The message contains high-resolution brand logos",
        "The sender included their company mailing address in the footer"
      ],
      correctIndex: 1,
      explanation: "Display name spoofing relies on users reading only the friendly name while ignoring the mismatched underlying sender domain."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Beginner",
      question: "Which of the following email subject lines is most typical of an urgent social engineering lure?",
      options: [
        "Monthly Company Newsletter - May Edition",
        "Your weekly scheduled backup completed successfully",
        "URGENT: Your account will be terminated in 24 hours unless you verify identity",
        "Meeting minutes from Tuesday's design sync"
      ],
      correctIndex: 2,
      explanation: "Urgent threats of immediate negative consequences (like account termination) are designed to trigger panic and bypass critical thinking."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Beginner",
      question: "What does DKIM (DomainKeys Identified Mail) verify in an email header?",
      options: [
        "That the recipient has paid their email subscription",
        "That the email content was cryptographically signed and not altered in transit",
        "That the email contains no computer viruses",
        "That the sender is an authorized government entity"
      ],
      correctIndex: 1,
      explanation: "DKIM attaches a digital signature linked to the sender's domain, proving the message wasn't modified after dispatch."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Intermediate",
      question: "What is 'Spear Phishing' compared to regular mass phishing?",
      options: [
        "Phishing that only targets mobile phones",
        "Highly customized attacks using researched personal context about a specific target",
        "Phishing attacks delivered through physical USB drives",
        "Automated spam sent to millions of random email addresses"
      ],
      correctIndex: 1,
      explanation: "Spear phishing uses tailored personal details (colleagues, projects, vendors) to make the deception much more convincing."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Beginner",
      question: "What is the safest immediate action when you receive an email asking you to reset your bank password?",
      options: [
        "Click the link provided in the email immediately",
        "Reply to the email with your current credentials",
        "Open a fresh browser tab and manually navigate to your bank's official bookmark or app",
        "Forward the email to your friends to test if it works for them"
      ],
      correctIndex: 2,
      explanation: "Never follow authentication links in unsolicited emails; always navigate directly via verified bookmarks or apps."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Intermediate",
      question: "What does DMARC do when SPF or DKIM checks fail?",
      options: [
        "It automatically arrests the scammer",
        "It tells the receiving mail server whether to reject, quarantine, or monitor the failing message",
        "It translates the email into plain text",
        "It changes the email font to Comic Sans"
      ],
      correctIndex: 1,
      explanation: "DMARC policies (none, quarantine, reject) tell receiving servers how to treat spoofed emails violating domain authentication."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Beginner",
      question: "Why do attackers often use URL shortening services (like bit.ly) in phishing campaigns?",
      options: [
        "To make the email download faster",
        "To conceal the malicious final destination hostname from visual inspection",
        "Because long URLs cost extra internet bandwidth",
        "To comply with email formatting standards"
      ],
      correctIndex: 1,
      explanation: "Shorteners mask destination domains, preventing recipients and basic email filters from immediately seeing deceptive hostnames."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Intermediate",
      question: "What is a 'Cousin Domain' or 'Typosquatting' attack?",
      options: [
        "Sharing your email account with family members",
        "Registering hostnames like 'micros0ft.com' or 'netf1ix-verify.com' to mimic authentic brands",
        "Using public Wi-Fi in an airport",
        "A DNS server timeout error"
      ],
      correctIndex: 1,
      explanation: "Typosquatting exploits visual similarity and typing slips by registering deceptive permutations of legitimate brand names."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Beginner",
      question: "Which file extension is commonly used to conceal malicious executable scripts in attachments?",
      options: [
        ".txt",
        ".png",
        ".iso or .vbs or .exe hidden inside .zip",
        ".mp3"
      ],
      correctIndex: 2,
      explanation: "Attackers frequently package container formats like .iso or script wrappers (.vbs, .js) inside archives to bypass basic email gateways."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Intermediate",
      question: "What is 'Whaling' in cybersecurity?",
      options: [
        "Phishing attacks directed specifically at high-profile executives or board members",
        "Large-scale distributed denial of service attacks",
        "Deep sea cable vulnerability testing",
        "Harvesting passwords using high-power Wi-Fi antennas"
      ],
      correctIndex: 0,
      explanation: "Whaling targets senior leadership (CEOs, CFOs) to authorize large funds transfers or compromise high-privilege credentials."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Beginner",
      question: "What should you check before downloading a PDF attachment from an unknown sender?",
      options: [
        "Whether you requested the document and verify the sender's identity out-of-band",
        "If the PDF has a colorful cover page",
        "The time zone of the email client",
        "Whether the sender is using an Apple device"
      ],
      correctIndex: 0,
      explanation: "Always verify the necessity and origin of unsolicited attachments before opening them in document readers."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Advanced",
      question: "What is an IDN Homograph Attack?",
      options: [
        "Sending phishing messages via LinkedIn",
        "Using internationalized characters (Cyrillic, Greek) that look identical to Latin letters in browser address bars",
        "Attacking the physical hard drive of a server",
        "Flooding an email inbox with spam"
      ],
      correctIndex: 1,
      explanation: "Homograph attacks replace Latin letters with identical-looking Unicode glyphs (e.g. Cyrillic 'а' vs Latin 'a') to spoof domains."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Beginner",
      question: "How can you safely inspect the hyperlink destination without clicking on it?",
      options: [
        "Click it quickly and close the browser immediately",
        "Hover your mouse pointer over the link to see the preview URL in the bottom status bar",
        "Copy and paste it directly into your primary browser",
        "Disable your monitor"
      ],
      correctIndex: 1,
      explanation: "Hovering over links reveals the actual underlying target URL without executing any HTTP request or JavaScript payload."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Intermediate",
      question: "What is 'BEC' (Business Email Compromise)?",
      options: [
        "A backup error in Microsoft Exchange",
        "Scammers impersonating trusted executives or suppliers to divert payments to fraudulent accounts",
        "Buying business laptops on sale",
        "A virus that turns off computer screens"
      ],
      correctIndex: 1,
      explanation: "BEC scams use legitimate or spoofed business mailboxes to deceive accounting departments into wiring payments to attacker-controlled accounts."
    },
    {
      quizId: "quiz-phishing",
      category: "Email Security",
      difficulty: "Beginner",
      question: "If an email claims your account has suspicious logins and asks you to confirm your password, what is it?",
      options: [
        "A routine system optimization",
        "A credential harvesting phishing attempt",
        "A free account upgrade",
        "An automated speed test"
      ],
      correctIndex: 1,
      explanation: "Legitimate service providers will never ask you to provide your plaintext password to resolve a security alert."
    },

    // --- QUIZ 2: Password Security (15 Questions) ---
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Beginner",
      question: "What makes a passphrase like 'correct-horse-battery-staple' stronger than 'P@ss1'?",
      options: [
        "It contains only numbers",
        "Significantly higher length and entropy making mathematical brute-forcing computationally infeasible",
        "It was created on a Linux machine",
        "It is shorter to type"
      ],
      correctIndex: 1,
      explanation: "Length exponentially increases password search space (entropy), making long multi-word passphrases vastly harder to crack."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Beginner",
      question: "Why should you avoid using common substitutions like 'P@ssw0rd'?",
      options: [
        "Modern cracking dictionaries (like RockYou) pre-compute rule-based transformations including @, 0, and $",
        "Web browsers cannot render the '@' character",
        "It takes up more disk space",
        "It disables keyboard backspace"
      ],
      correctIndex: 0,
      explanation: "Cracking tools like Hashcat apply rule-based permutation masks that systematically test standard character substitutions in seconds."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Intermediate",
      question: "What is 'Credential Stuffing'?",
      options: [
        "Writing passwords on sticky notes",
        "Automated tools injecting billions of leaked username/password pairs into different websites",
        "Increasing the memory allocation of an authentication server",
        "Encrypting a database twice"
      ],
      correctIndex: 1,
      explanation: "Credential stuffing relies on users reusing passwords across multiple services so one data breach compromises accounts everywhere."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Intermediate",
      question: "What is 'k-Anonymity' when checking passwords against breach databases like HaveIBeenPwned?",
      options: [
        "Sending your full password encrypted with AES-256",
        "Sending only the first 5 characters of the SHA-1 hash so the server never knows your full hash or password",
        "Hiding your IP address with a proxy",
        "Generating passwords using random number generators"
      ],
      correctIndex: 1,
      explanation: "k-Anonymity ensures mathematical privacy: the client sends 5 hex characters of the hash; the server returns matching hashes, and local comparison occurs in-browser."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Advanced",
      question: "Which cryptographic hashing algorithm is recommended for password storage due to memory hardness and configurable work factors?",
      options: [
        "MD5",
        "SHA-1",
        "Argon2id or bcrypt",
        "DES"
      ],
      correctIndex: 2,
      explanation: "Argon2id and bcrypt are designed to be computationally and memory expensive, preventing fast GPU/ASIC parallel cracking attacks."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Beginner",
      question: "What is the primary benefit of a dedicated password manager?",
      options: [
        "It stores all your passwords in public cloud pastebins",
        "It generates and securely encrypts unique 20+ character random passwords for every single site",
        "It slows down your computer",
        "It makes all passwords 123456"
      ],
      correctIndex: 1,
      explanation: "Password managers eliminate password reuse and complexity fatigue by generating and auto-filling unique high-entropy credentials."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Intermediate",
      question: "What is a 'Salt' in password hashing?",
      options: [
        "A physical security key",
        "A unique cryptographically random string appended to each password before hashing to defeat Rainbow Tables",
        "An encrypted SSL cookie",
        "A backup file"
      ],
      correctIndex: 1,
      explanation: "Salting ensures identical passwords produce completely different hash outputs, making precomputed rainbow table attacks impossible."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Beginner",
      question: "How frequently should you change your master password or strong passwords according to modern NIST guidelines?",
      options: [
        "Every 30 days without exception",
        "Only when there is evidence or suspicion of a compromise or breach",
        "Every 24 hours",
        "Never create a strong password in the first place"
      ],
      correctIndex: 1,
      explanation: "NIST Special Publication 800-63B advises against arbitrary periodic rotation, which often leads to predictable weak patterns."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Intermediate",
      question: "What is a 'Dictionary Attack' against password hashes?",
      options: [
        "Throwing books at a computer",
        "Testing a list of hundreds of thousands of common words, leaked passwords, and known combinations against a hash",
        "Searching for words in Wikipedia",
        "Checking spelling in an email"
      ],
      correctIndex: 1,
      explanation: "Dictionary attacks systematically hash words from wordlists to find matching digests in breach datasets."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Beginner",
      question: "Which of the following is considered personal identifiable information (PII) that should NEVER be used in a password?",
      options: [
        "A random sequence of dictionary words",
        "Your birthdate, child's name, pet's name, or phone number",
        "Special symbols like $#%",
        "A 20-character passphrase"
      ],
      correctIndex: 1,
      explanation: "Personal details are easily harvested from social media and included in targeted attacker wordlists."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Intermediate",
      question: "What is 'Zero-Knowledge Encryption' in password managers?",
      options: [
        "The password manager knows nothing about cybersecurity",
        "The vault is encrypted/decrypted only on your local device using your master key; the provider never sees your plaintext",
        "No encryption is used at all",
        "The master password is saved in a text file on the server"
      ],
      correctIndex: 1,
      explanation: "Zero-knowledge ensures that even if the password manager's servers are compromised, the attackers only obtain ciphertext."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Advanced",
      question: "Why is SHA-256 alone considered insufficient for storing user password hashes?",
      options: [
        "Because it produces only 4 characters",
        "Because SHA-256 is designed to be fast, allowing modern GPUs to calculate billions of hashes per second",
        "Because SHA-256 is not open source",
        "Because it only works on Windows"
      ],
      correctIndex: 1,
      explanation: "General cryptographic hashes like SHA-256 are fast, which benefits verification of large files but makes offline cracking trivial."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Beginner",
      question: "If a web application emails you your exact plaintext password after you forgot it, what does that indicate?",
      options: [
        "The system has excellent security features",
        "The system stored your password in unhashed or reversibly encrypted plaintext, violating basic security standards",
        "The email was sent by your operating system",
        "The website is utilizing quantum encryption"
      ],
      correctIndex: 1,
      explanation: "Websites should only store one-way cryptographic hashes. Being able to email plaintext proves insecure plaintext storage."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Intermediate",
      question: "What happens when you use SMS-based 2FA instead of an authenticator app (TOTP)?",
      options: [
        "SMS is completely immune to hacking",
        "SMS messages are vulnerable to SIM swapping, SS7 interception, and cellular carrier social engineering",
        "SMS requires hardware encryption keys",
        "Authenticator apps cost $50 per login"
      ],
      correctIndex: 1,
      explanation: "SMS can be intercepted via SIM-swapping or SS7 attacks; app-based TOTP or FIDO2 keys provide superior cryptographic protection."
    },
    {
      quizId: "quiz-password",
      category: "Authentication",
      difficulty: "Beginner",
      question: "What is the recommended minimum length for a standard complex password?",
      options: [
        "4 characters",
        "8 characters",
        "12 to 16+ characters",
        "1 character"
      ],
      correctIndex: 2,
      explanation: "At 14-16+ characters, brute-force complexity rises to centuries of compute time even on dedicated GPU cracking clusters."
    },

    // --- QUIZ 3: Safe Browsing & URLs (15 Questions) ---
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Beginner",
      question: "What does the 'HTTPS' protocol guarantee about your connection to a website?",
      options: [
        "The website is 100% trustworthy and free of scams",
        "Communication between your browser and the web server is encrypted and protected against eavesdropping",
        "The website has no advertisements",
        "The website cannot crash"
      ],
      correctIndex: 1,
      explanation: "HTTPS encrypts the transit pipe using TLS; however, malicious websites can also obtain valid TLS certificates."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Beginner",
      question: "In the URL 'https://login.microsoft.com.attacker-domain.com/auth', what is the actual apex domain hosting the content?",
      options: [
        "microsoft.com",
        "login.microsoft.com",
        "attacker-domain.com",
        "auth.com"
      ],
      correctIndex: 2,
      explanation: "Domains are evaluated right to left: 'attacker-domain.com' is the registered domain, while 'login.microsoft.com' is merely a subdomain prefix."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Intermediate",
      question: "What is SSRF (Server-Side Request Forgery) in web security?",
      options: [
        "A user reloading a page too fast",
        "An attack where the backend server is tricked into fetching internal, private, or loopback network resources (e.g., 127.0.0.1 or cloud metadata 169.254.169.254)",
        "A broken CSS layout",
        "A slow database query"
      ],
      correctIndex: 1,
      explanation: "SSRF exploits server-side fetching features to probe internal microservices, loopback adapters, or cloud instance metadata."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Beginner",
      question: "What is an 'Open Redirect' vulnerability?",
      options: [
        "A website that opens external links in a new tab",
        "A parameter on a trusted site (e.g. example.com/redirect?url=evil.com) that forwards unsuspecting users to malicious endpoints",
        "A public Wi-Fi hotspot",
        "An expired SSL certificate"
      ],
      correctIndex: 1,
      explanation: "Open redirects allow attackers to craft phishing links using a legitimate brand's URL to bypass security filters before redirecting to malicious payloads."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Intermediate",
      question: "What does a DNS TTL (Time To Live) signify?",
      options: [
        "How long a computer can stay turned on",
        "The duration in seconds that a DNS resolver or client is allowed to cache a resolved domain record",
        "The speed of an internet connection",
        "The age of the website owner"
      ],
      correctIndex: 1,
      explanation: "DNS TTL dictates how long records stay cached before resolvers must query authoritative nameservers for updates."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Beginner",
      question: "What is a 'Drive-by Download'?",
      options: [
        "Downloading files while in a moving vehicle",
        "Unintended download and execution of malicious code initiated simply by visiting a compromised web page without explicit user consent",
        "Downloading an app from an official store",
        "Watching a video on YouTube"
      ],
      correctIndex: 1,
      explanation: "Drive-by downloads exploit unpatched browser vulnerabilities or malicious ad scripts to install malware silently."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Intermediate",
      question: "What is the purpose of HSTS (HTTP Strict Transport Security)?",
      options: [
        "To speed up CSS downloads",
        "To instruct web browsers to ALWAYS connect using HTTPS and reject any insecure HTTP downgrade attempts",
        "To block popup windows",
        "To translate foreign websites"
      ],
      correctIndex: 1,
      explanation: "HSTS header prevents SSL stripping attacks by enforcing HTTPS connections at the browser level."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Beginner",
      question: "Why should you be cautious when clicking QR codes displayed in public spaces (Quishing)?",
      options: [
        "QR codes can emit radiation",
        "Adversaries can paste malicious QR stickers over legitimate posters to redirect mobile users to credential harvesting portals",
        "QR codes only work once",
        "Cameras can overheat scanning QR codes"
      ],
      correctIndex: 1,
      explanation: "Quishing replaces legitimate QR codes with malicious redirects that bypass desktop email inspection gateways."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Intermediate",
      question: "What is 'DNS Spoofing' or 'DNS Cache Poisoning'?",
      options: [
        "Buying too many domain names",
        "Corrupting a DNS resolver's cache so requests for legitimate websites resolve to an attacker-controlled IP address",
        "Deleting a domain's homepage",
        "Changing your computer's time"
      ],
      correctIndex: 1,
      explanation: "DNS poisoning tricks resolvers into redirecting legitimate user traffic to deceptive clone servers."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Advanced",
      question: "Why is the IP range 169.254.169.254 critical in cloud security audits?",
      options: [
        "It is the default IP address of Google",
        "It is the Link-Local Instance Metadata Service (IMDS) endpoint for AWS/GCP/Azure VMs containing temporary IAM credentials",
        "It is used for home routers",
        "It is the universal printer IP"
      ],
      correctIndex: 1,
      explanation: "Cloud IMDS endpoints return instance identity credentials; SSRF attacks querying 169.254.169.254 can compromise cloud infrastructure."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Beginner",
      question: "What does an SSL certificate mismatch error ('Your connection is not private') typically mean?",
      options: [
        "The computer needs to be restarted",
        "The domain in the browser doesn't match the Common Name/SAN on the certificate, or an attacker is intercepting the connection",
        "The website is out of disk space",
        "Your keyboard is disconnected"
      ],
      correctIndex: 1,
      explanation: "Certificate mismatches indicate misconfiguration, domain spoofing, or an active adversary-in-the-middle interception attempt."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Intermediate",
      question: "What is a 'Subdomain Takeover'?",
      options: [
        "Buying a domain name on auction",
        "Claiming a DNS record that points to a decommissioned or deleted third-party cloud service (like GitHub Pages or S3)",
        "Logging in as an admin",
        "Renaming a folder on your server"
      ],
      correctIndex: 1,
      explanation: "Dangling DNS pointers allow attackers to register the abandoned cloud bucket and host arbitrary content on the victim's subdomain."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Beginner",
      question: "What is the primary risk of using unencrypted public Wi-Fi without a VPN?",
      options: [
        "Your laptop battery will drain faster",
        "Other devices on the network can sniff plaintext packets, perform ARP spoofing, and intercept unencrypted HTTP traffic",
        "The Wi-Fi router will delete your files",
        "Your operating system will downgrade"
      ],
      correctIndex: 1,
      explanation: "Public Wi-Fi allows local network eavesdropping and traffic manipulation without proper cryptographic encapsulation."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Intermediate",
      question: "What is 'Clickjacking'?",
      options: [
        "Clicking links very fast to win prizes",
        "Overlaying transparent malicious iframes over legitimate buttons to trick users into unintended clicks",
        "A physical mouse malfunction",
        "A keyboard macro"
      ],
      correctIndex: 1,
      explanation: "Clickjacking lures users into clicking invisible UI elements to trigger sensitive actions (like money transfers or permission grants)."
    },
    {
      quizId: "quiz-urls",
      category: "Web Security",
      difficulty: "Beginner",
      question: "Why should web browsers disable third-party cookies by default?",
      options: [
        "To save hard drive space",
        "To prevent cross-site tracking and reduce attack vectors like Cross-Site Request Forgery (CSRF)",
        "Because cookies taste bad in computers",
        "To prevent computer screens from dimming"
      ],
      correctIndex: 1,
      explanation: "Restricting third-party cookies strengthens user privacy and prevents unauthorized cross-origin ambient credential delivery."
    },

    // --- QUIZ 4: Social Engineering, MFA & Zero Trust (15 Questions) ---
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Advanced",
      question: "What is 'MFA Fatigue' or 'Push Bombing'?",
      options: [
        "Getting tired of entering passwords",
        "Attackers repeatedly triggering continuous 2FA push notifications on a victim's phone until they accidentally or out of frustration accept one",
        "A battery drain issue in mobile authenticators",
        "An expired security token"
      ],
      correctIndex: 1,
      explanation: "Push bombing floods the user with authenticator prompts at odd hours hoping they will tap 'Approve' to stop the notification storm."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Intermediate",
      question: "What is the core principle of a 'Zero Trust' architecture?",
      options: [
        "Never trust anyone on your team",
        "'Never trust, always verify' — treat all internal and external network traffic as potentially hostile with strict identity and device validation",
        "Disable all internet connections permanently",
        "Delete all user accounts every night"
      ],
      correctIndex: 1,
      explanation: "Zero Trust removes perimeter assumptions: every request must be authenticated, authorized, and encrypted regardless of network location."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Beginner",
      question: "What is 'Tailgating' or 'Piggybacking' in physical security?",
      options: [
        "Following someone closely on the highway",
        "An unauthorized person following closely behind an authorized employee through a secure door or turnstile without badging in",
        "Connecting two laptops together",
        "Playing computer games at work"
      ],
      correctIndex: 1,
      explanation: "Tailgating exploits social politeness (holding the door open) to breach physical security perimeters."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Intermediate",
      question: "What is 'Pretexting' in social engineering attacks?",
      options: [
        "Formatting text before sending an email",
        "Creating an invented scenario (e.g. posing as IT support or HR) to manipulate a victim into releasing sensitive data",
        "Testing a software feature before deployment",
        "A spelling check algorithm"
      ],
      correctIndex: 1,
      explanation: "Pretexting establishes a believable false scenario and authority role to compel the target to comply with security violations."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Advanced",
      question: "Why are FIDO2/WebAuthn hardware security keys (like YubiKeys) immune to real-time phishing proxies (like Evilginx)?",
      options: [
        "They are made of heavy metal",
        "The cryptographic challenge is bound directly to the browser's origin domain (Origin Binding), so a proxy's fake domain causes the signature check to fail",
        "They use quantum encryption satellites",
        "They require typing a 100-character code"
      ],
      correctIndex: 1,
      explanation: "FIDO2 cryptographically validates the exact web origin; if the user is on a phishing proxy domain, the hardware key refuses to sign the authentic domain token."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Beginner",
      question: "What is 'Vishing' in cybersecurity?",
      options: [
        "Virtual reality fishing games",
        "Voice Phishing — phone calls impersonating banks, tech support, or government agencies to extract credentials or OTP codes",
        "Visiting a website twice",
        "Video editing software"
      ],
      correctIndex: 1,
      explanation: "Vishing uses voice telephony and spoofed caller IDs to pressure victims into divulging sensitive codes."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Intermediate",
      question: "What is 'Smishing'?",
      options: [
        "Compressing images",
        "SMS Phishing — fraudulent text messages with deceptive links claiming missed deliveries, bank locks, or tax refunds",
        "A physical keyboard failure",
        "A slow database index"
      ],
      correctIndex: 1,
      explanation: "Smishing delivers deceptive phishing links directly to mobile text messages, often imitating parcel carriers or banking alerts."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Advanced",
      question: "What is the 'Principle of Least Privilege' (PoLP)?",
      options: [
        "Giving all employees administrator rights to save time",
        "Granting users and service accounts only the minimum access permissions necessary to perform their specific job functions",
        "Refusing to give computers to junior staff",
        "Deleting old files every week"
      ],
      correctIndex: 1,
      explanation: "Least privilege limits blast radius: if an account is compromised, the attacker cannot access unrelated systems or escalate privileges."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Beginner",
      question: "What is 'Baiting' in social engineering?",
      options: [
        "Setting up computer servers in the ocean",
        "Leaving malware-infected USB drives in parking lots or lobbies labeled 'Executive Salaries Q3' to tempt employees into plugging them in",
        "Fishing online for compliments",
        "Testing high-speed internet cables"
      ],
      correctIndex: 1,
      explanation: "Baiting exploits human curiosity and greed by offering physical or digital media that execute payloads upon insertion."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Intermediate",
      question: "What is 'Shoulder Surfing'?",
      options: [
        "A posture exercise for computer workers",
        "Directly looking over someone's shoulder to observe passwords, PINs, or confidential documents on screen",
        "Wearing a camera on your shoulder",
        "Using two monitors side by side"
      ],
      correctIndex: 1,
      explanation: "Shoulder surfing gathers sensitive authentication material through direct visual observation in public or office spaces."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Advanced",
      question: "How does 'SIM Swapping' allow attackers to hijack accounts?",
      options: [
        "By stealing the physical SIM card out of your pocket",
        "By tricking the cellular carrier into transferring the victim's phone number to an attacker-controlled SIM card, intercepting SMS 2FA codes",
        "By turning on airplane mode",
        "By downloading an app from the App Store"
      ],
      correctIndex: 1,
      explanation: "SIM swapping bypasses SMS-based verification by moving phone service to the attacker's hardware through telecom social engineering."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Beginner",
      question: "What should you do if an urgent caller claiming to be your IT department asks for your two-factor code?",
      options: [
        "Read it aloud quickly",
        "Hang up and independently call your company's official IT helpdesk number to verify the request",
        "Email them your password as well",
        "Share your screen"
      ],
      correctIndex: 1,
      explanation: "Never share 2FA OTP codes over the phone; legitimate support personnel will never request your one-time passwords."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Intermediate",
      question: "What is 'Watering Hole' attack?",
      options: [
        "Spilling water on server racks",
        "Compromising a specific legitimate website known to be frequently visited by a targeted organization or group",
        "Drinking water while coding",
        "A cooling system error in data centers"
      ],
      correctIndex: 1,
      explanation: "Watering hole attacks infect websites trusted by targets, delivering exploits specifically when targeted IP blocks visit."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Advanced",
      question: "What is 'Number Matching' in modern Microsoft Authenticator / MFA setups?",
      options: [
        "A math game for security analysts",
        "Requiring the user to type a 2-digit number displayed on the login screen into the authenticator app, defeating blind push approval fatigue",
        "Matching IP addresses manually",
        "Generating phone numbers"
      ],
      correctIndex: 1,
      explanation: "Number matching ensures the person holding the authenticator device is actively looking at the login terminal, mitigating push notification fatigue."
    },
    {
      quizId: "quiz-social",
      category: "Social Engineering",
      difficulty: "Beginner",
      question: "What is 'Clean Desk Policy' in corporate security?",
      options: [
        "Wiping dust off desks every Friday",
        "Ensuring no sensitive documents, sticky notes with passwords, or unencrypted storage drives are left in plain sight when leaving your workstation",
        "Using only transparent glass desks",
        "Having no computer monitors on the desk"
      ],
      correctIndex: 1,
      explanation: "Clean desk policies prevent unauthorized visual inspection of sensitive papers, keys, and credentials by visitors or cleaners."
    }
  ];

  // Insert questions into database
  for (const q of allQuestions) {
    const existing = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.question, q.question))
      .get();

    if (!existing) {
      await db.insert(quizQuestions).values({
        id: crypto.randomUUID(),
        quizId: q.quizId,
        category: q.category,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        optionA: q.options[0],
        optionB: q.options[1],
        optionC: q.options[2],
        optionD: q.options[3],
        correctIndex: q.correctIndex,
        correctOption: q.correctIndex + 1,
        explanation: q.explanation,
        createdAt: new Date("2024-01-01"),
      });
    }
  }

  // ----------------------------------------------------
  // 5. SEED AMNA KHAN REALISTIC 30-DAY SCANS & ACTIVITY
  // ----------------------------------------------------
  console.log("📊 Seeding realistic 30-day scans, threats, quiz attempts, chats and logs for Amna Khan...");

  const amnaId = "amna-khan-id";
  const userDemoId = "user-demo-id";

  const targetUserIds = [amnaId, userDemoId];

  for (const uid of targetUserIds) {
    // Unlock achievements for Amna / Demo User
    for (const ach of achievementsList.slice(0, 6)) {
      const existing = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.achievementId, ach.id))
        .get();

      if (!existing) {
        await db.insert(userAchievements).values({
          id: crypto.randomUUID(),
          userId: uid,
          achievementId: ach.id,
          badgeKey: ach.code,
          title: ach.title,
          description: ach.description,
          icon: ach.icon,
          unlockedAt: new Date("2024-05-20T10:00:00Z"),
        });
      }
    }

    // Seed Realistic Scans (136 total scans across 30 days: 8 threats, 5 phishing, 3 unsafe URLs)
    // 18 scans today (3 threats today)
    const now = new Date();
    
    // Scans Today (18 scans: 3 threats, 15 clean)
    const todayScans = [
      {
        type: "EMAIL" as const,
        sender: "urgent-alert@secure-paypa1-update.com",
        subject: "Action Required: Your PayPal account has been restricted",
        verdict: "MALICIOUS" as const,
        score: 15,
        confidence: 98,
        preview: "Dear customer, we detected unusual login activity from Moscow, Russia. Please click here to verify...",
        findings: ["Lookalike domain 'paypa1-update.com'", "Urgent pressure phrasing", "Deceptive credential harvesting link"],
        recs: ["Do not click links", "Report to bank abuse desk", "Quarantine message"],
      },
      {
        type: "URL" as const,
        url: "http://micros0ft-support-live.top/session-verify",
        hostname: "micros0ft-support-live.top",
        verdict: "MALICIOUS" as const,
        score: 10,
        ssl: false,
        findings: ["Typosquatted Microsoft brand", "Insecure HTTP connection", "High risk TLD .top"],
      },
      {
        type: "EMAIL" as const,
        sender: "support@netflix-billing-update.xyz",
        subject: "Your subscription payment failed - update immediately",
        verdict: "SUSPICIOUS" as const,
        score: 35,
        confidence: 92,
        preview: "We couldn't process your renewal payment. Click the button to re-enter your credit card...",
        findings: ["Unverified sender SPF", "Generic customer greeting", "External billing form"],
        recs: ["Verify billing on legitimate netflix.com website"],
      },
      // Clean scans today (15 scans)
      ...Array.from({ length: 15 }).map((_, i) => ({
        type: (i % 3 === 0 ? "EMAIL" : i % 3 === 1 ? "URL" : "PASSWORD") as "EMAIL" | "URL" | "PASSWORD",
        sender: "notifications@github.com",
        subject: `Security digest for repository #${i + 1}`,
        url: `https://github.com/project/repo-${i + 1}`,
        hostname: "github.com",
        verdict: "SAFE" as const,
        score: 95,
        confidence: 99,
        preview: "All security checks and dependencies verified safe.",
        findings: ["Valid DKIM/SPF signatures", "Valid EV SSL certificate", "High reputation domain"],
        recs: ["No action required"],
      }))
    ];

    for (const s of todayScans) {
      const scanDate = new Date(now.getTime() - Math.random() * 8 * 3600 * 1000);

      if (s.type === "EMAIL") {
        await db.insert(emailScans).values({
          id: crypto.randomUUID(),
          userId: uid,
          sender: s.sender || "support@verified.com",
          subject: s.subject || "Security alert",
          contentPreview: s.preview || "Preview content",
          verdict: s.verdict,
          riskScore: s.score,
          confidence: s.confidence || 95,
          findings: s.findings,
          recommendations: s.recs || ["Maintain standard vigilance"],
          aiUsed: true,
          createdAt: scanDate,
        });
      } else if (s.type === "URL") {
        await db.insert(urlScans).values({
          id: crypto.randomUUID(),
          userId: uid,
          url: s.url || "https://example.com",
          hostname: s.hostname || "example.com",
          verdict: s.verdict,
          riskScore: s.score,
          sslValid: (s as any).ssl !== false,
          domainValid: true,
          checks: { suspiciousWords: s.findings },
          intelConfigured: true,
          createdAt: scanDate,
        });
      } else {
        await db.insert(passwordChecks).values({
          id: crypto.randomUUID(),
          userId: uid,
          strengthScore: s.score,
          strengthLabel: "Strong",
          length: 16,
          hasUpper: true,
          hasLower: true,
          hasNumber: true,
          hasSymbol: true,
          breached: false,
          createdAt: scanDate,
        });
      }

      // Unified scan table entry
      await db.insert(scans).values({
        id: crypto.randomUUID(),
        userId: uid,
        type: s.type,
        inputSummary: s.subject || s.url || "Password entropy test",
        resultScore: s.score,
        verdict: s.verdict.toLowerCase(),
        detailsJson: JSON.stringify(s.findings || {}),
        threatIndicators: s.verdict !== "SAFE" ? "Suspicious indicators found" : null,
        createdAt: scanDate,
      });
    }

    // Historical scans over past 30 days (118 additional scans: 5 threats, 113 safe)
    for (let day = 1; day <= 29; day++) {
      const dayDate = new Date(now.getTime() - day * 24 * 3600 * 1000);
      const isThreatDay = day === 5 || day === 12 || day === 19 || day === 24 || day === 28;

      const scansInDay = isThreatDay ? 5 : 4;
      for (let j = 0; j < scansInDay; j++) {
        const isMalicious = isThreatDay && j === 0;
        const isPhishing = isMalicious && day % 2 === 1;

        const scanType = isPhishing ? "EMAIL" : isMalicious ? "URL" : j % 2 === 0 ? "EMAIL" : "URL";
        const verdict = isMalicious ? (day > 15 ? "MALICIOUS" : "SUSPICIOUS") : "SAFE";
        const score = isMalicious ? 20 : 92;

        if (scanType === "EMAIL") {
          await db.insert(emailScans).values({
            id: crypto.randomUUID(),
            userId: uid,
            sender: isMalicious ? "support@apple-id-verify.tk" : "billing@slack.com",
            subject: isMalicious ? "Apple ID Suspended - Verify Identity" : "Your Monthly Slack Invoice",
            contentPreview: isMalicious ? "Your cloud backup was halted. Please re-authenticate." : "Attached is your standard statement.",
            verdict: verdict as any,
            riskScore: score,
            confidence: 94,
            findings: isMalicious ? ["Spoofed sender header", "Domain registered yesterday"] : ["SPF Pass", "DKIM Pass"],
            recommendations: ["Always check the sender header"],
            aiUsed: true,
            createdAt: dayDate,
          });
        } else {
          await db.insert(urlScans).values({
            id: crypto.randomUUID(),
            userId: uid,
            url: isMalicious ? "http://chase-bank-logon-portal.info/login" : "https://docs.github.com/en",
            hostname: isMalicious ? "chase-bank-logon-portal.info" : "docs.github.com",
            verdict: verdict as any,
            riskScore: score,
            sslValid: !isMalicious,
            domainValid: true,
            checks: { status: "Inspected" },
            intelConfigured: true,
            createdAt: dayDate,
          });
        }

        await db.insert(scans).values({
          id: crypto.randomUUID(),
          userId: uid,
          type: scanType,
          inputSummary: isMalicious ? "Suspicious portal scan" : "Routine verified lookup",
          resultScore: score,
          verdict: verdict.toLowerCase(),
          detailsJson: JSON.stringify({ verified: !isMalicious }),
          threatIndicators: isMalicious ? "High-risk domain attributes" : null,
          createdAt: dayDate,
        });
      }
    }

    // Seed 7 Quiz Attempts for Amna
    const quizAttemptsList = [
      { quizId: "quiz-phishing", score: 10, total: 10, pct: 100, sec: 145 },
      { quizId: "quiz-password", score: 9, total: 10, pct: 90, sec: 180 },
      { quizId: "quiz-urls", score: 10, total: 10, pct: 100, sec: 130 },
      { quizId: "quiz-social", score: 8, total: 10, pct: 80, sec: 210 },
      { quizId: "quiz-phishing", score: 10, total: 10, pct: 100, sec: 115 },
      { quizId: "quiz-urls", score: 9, total: 10, pct: 90, sec: 120 },
      { quizId: "quiz-password", score: 10, total: 10, pct: 100, sec: 150 },
    ];

    for (let i = 0; i < quizAttemptsList.length; i++) {
      const qa = quizAttemptsList[i];
      const attemptDate = new Date(now.getTime() - (i * 4 + 1) * 24 * 3600 * 1000);
      await db.insert(quizAttempts).values({
        id: crypto.randomUUID(),
        userId: uid,
        quizId: qa.quizId,
        score: qa.score,
        total: qa.total,
        totalQuestions: qa.total,
        percentage: qa.pct,
        durationSeconds: qa.sec,
        timeTakenSec: qa.sec,
        passed: qa.pct >= 70,
        answers: { completed: true },
        answersJson: JSON.stringify({ completed: true }),
        createdAt: attemptDate,
      });
    }

    // Seed Activity Logs
    const activities = [
      { type: "LOGIN" as const, title: "Secure Login", desc: "Logged in via Multi-Factor Authentication" },
      { type: "EMAIL_SCAN" as const, title: "Phishing Scanned", desc: "Analyzed suspicious PayPal invoice lure (Malicious)" },
      { type: "URL_SCAN" as const, title: "URL Inspected", desc: "Verified https://github.com/security/advisories (Safe)" },
      { type: "PASSWORD_CHECK" as const, title: "Password Evaluated", desc: "Audited master password entropy (100% Strong)" },
      { type: "QUIZ_COMPLETED" as const, title: "Quiz Completed", desc: "Scored 100% on Phishing Recognition Challenge" },
      { type: "REPORT_GENERATED" as const, title: "Security Report Exported", desc: "Downloaded signed PDF cybersecurity audit" },
    ];

    for (let i = 0; i < activities.length; i++) {
      const act = activities[i];
      await db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: uid,
        type: act.type,
        title: act.title,
        description: act.desc,
        metadata: { client: "Web Dashboard" },
        createdAt: new Date(now.getTime() - i * 3600 * 1000 * 4),
      });
    }

    // Seed Notifications
    const notifs = [
      {
        title: "AI Phishing Defense Active",
        message: "Your heuristic and neural email inspector is active and monitoring.",
        type: "SUCCESS" as const,
        isRead: false,
      },
      {
        title: "Zero Breaches Detected",
        message: "None of your tested credentials appeared in public breach databases.",
        type: "INFO" as const,
        isRead: false,
      },
      {
        title: "Weekly Security Digest Ready",
        message: "Your weekly posture score increased by +4% to 92/100.",
        type: "INFO" as const,
        isRead: true,
      },
    ];

    for (const n of notifs) {
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: uid,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: new Date(now.getTime() - Math.random() * 24 * 3600 * 1000),
      });
    }

    // Seed AI Chat Conversation
    const convId = crypto.randomUUID();
    await db.insert(chatConversations).values({
      id: convId,
      userId: uid,
      title: "Phishing Mitigation & 2FA Guidance",
      createdAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000),
      updatedAt: new Date(),
    });

    const messages = [
      {
        role: "USER" as const,
        content: "How do I recognize a homograph domain attack in my browser address bar?",
      },
      {
        role: "ASSISTANT" as const,
        content: "Homograph attacks replace standard Latin characters with identical-looking Unicode characters from Cyrillic or Greek scripts (e.g. Cyrillic 'а' vs Latin 'a'). Modern browsers display these as Punycode (e.g. `xn--...`) in the address bar. Always look for the `xn--` prefix or use CyberGuard's URL Checker to inspect the raw Punycode decoding.",
      },
    ];

    for (const m of messages) {
      await db.insert(chatMessages).values({
        id: crypto.randomUUID(),
        conversationId: convId,
        userId: uid,
        sessionId: convId,
        role: m.role,
        content: m.content,
        guardrailFlagged: false,
        createdAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000),
      });
    }
  }

  // ----------------------------------------------------
  // 6. SEED BLOCKED DOMAINS
  // ----------------------------------------------------
  console.log("🛡️ Seeding blocked domains threat intelligence...");
  const maliciousDomainList = [
    { domain: "paypa1-security-update.com", reason: "Credential harvesting phishing campaign" },
    { domain: "micros0ft-support-live.top", reason: "Tech support scam lure" },
    { domain: "netflix-billing-update.xyz", reason: "Credit card fraud form" },
    { domain: "apple-id-verify.tk", reason: "Apple ID credential phishing" },
    { domain: "chase-bank-logon-portal.info", reason: "Banking credential harvesting" },
    { domain: "secure-wellsfargo-auth.club", reason: "Impersonation fraud" },
  ];

  for (const b of maliciousDomainList) {
    const existing = await db.select().from(blockedDomains).where(eq(blockedDomains.domain, b.domain)).get();
    if (!existing) {
      await db.insert(blockedDomains).values({
        id: crypto.randomUUID(),
        domain: b.domain,
        reason: b.reason,
        addedBy: "Automated Threat Feed",
        createdAt: new Date("2024-01-01"),
      });
    }
  }

  console.log("🎉 Database seeding completed successfully!");
}

// Auto-run if executed directly via `tsx src/db/seed.ts`
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seed process exited normally.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed process failed with error:", err);
      process.exit(1);
    });
}
