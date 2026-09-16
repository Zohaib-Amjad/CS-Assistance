from __future__ import annotations

import io
import os
import pickle
import random
import sqlite3
import string
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

from flask import Flask, jsonify, make_response, redirect, render_template, request, session, url_for
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(
    os.environ.get(
        "DB_PATH",
        "/tmp/cyberguard.db" if os.environ.get("VERCEL") else str(BASE_DIR / "cyberguard.db"),
    )
)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "cyberguard-secret-key")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS quiz_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_option INTEGER NOT NULL,
            explanation TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS tips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            module TEXT NOT NULL,
            result TEXT NOT NULL,
            details TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            rating INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )
    conn.commit()
    conn.close()
    seed_data()


def seed_data():
    conn = get_db()

    admin_email = "admin@cyberguard.ai"
    admin_exists = conn.execute(
        "SELECT id FROM users WHERE email = ?", (admin_email,)
    ).fetchone()
    if not admin_exists:
        conn.execute(
            """
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
            """,
            (
                "Admin",
                admin_email,
                generate_password_hash("admin123"),
                "admin",
            ),
        )

    quiz_count = conn.execute("SELECT COUNT(*) FROM quiz_questions").fetchone()[0]
    if quiz_count == 0:
        sample_questions = [
            (
                "What is phishing?",
                "A fake website that only sells products",
                "A cyber attack that tricks users into revealing sensitive information",
                "A virus that destroys operating systems",
                "A type of firewall",
                2,
                "Phishing is a social engineering attack that tricks users into sharing sensitive information through fake emails, messages, or websites.",
            ),
            (
                "Which password is strongest?",
                "password123",
                "Sunshine!2024",
                "Admin123",
                "qwerty",
                2,
                "A long password with uppercase, lowercase, numbers, and symbols is much harder to guess or brute-force.",
            ),
            (
                "Why is HTTPS important?",
                "It speeds up page loading",
                "It encrypts data between your browser and the website",
                "It blocks all malware",
                "It always identifies the author of a website",
                2,
                "HTTPS uses SSL/TLS encryption to protect data while it travels over the network.",
            ),
            (
                "What should you do if you receive a suspicious email asking for OTP?",
                "Reply instantly and share the OTP",
                "Ignore it and verify the sender through an official channel",
                "Forward it to everyone in your contacts",
                "Click the embedded link without checking",
                2,
                "Never share OTPs with unknown or unverified senders. Always verify requests through official company channels.",
            ),
            (
                "What is malware?",
                "Useful software for file management",
                "A type of harmful software designed to damage devices or steal data",
                "A coding language",
                "A secure browser extension",
                2,
                "Malware includes viruses, ransomware, spyware, and trojans that can steal data or disrupt systems.",
            ),
            (
                "Which action improves online safety?",
                "Using the same password everywhere",
                "Downloading files from unknown senders",
                "Enabling two-factor authentication",
                "Skipping software updates",
                3,
                "Two-factor authentication adds an extra layer of protection even if a password is exposed.",
            ),
            (
                "What is social engineering?",
                "A method of fixing hardware issues",
                "A technique of manipulating people into revealing confidential information",
                "A type of wireless connection",
                "An antivirus scanning method",
                2,
                "Social engineering tricks people psychologically rather than relying on technical exploits alone.",
            ),
            (
                "Which URL is more likely to be dangerous?",
                "https://example.com",
                "https://secure-login-check.com",
                "https://www.bankofamerica.com",
                "https://portal.company.com",
                2,
                "URLs that contain suspicious or generic terms such as 'secure-login-check' may be phishing pages aimed at stealing account details.",
            ),
            (
                "What is the best practice for password reuse?",
                "Use one password for all accounts",
                "Reuse weak passwords on secondary accounts",
                "Use unique passwords for each account",
                "Write passwords on paper and store them openly",
                3,
                "Unique passwords reduce the impact of a breach because one compromised account does not expose all others.",
            ),
            (
                "Why should you update software regularly?",
                "To change the language settings",
                "To reduce security vulnerabilities and apply patches",
                "To make the system slower",
                "To avoid using backups",
                2,
                "Regular updates fix vulnerabilities and keep systems protected against newly discovered threats.",
            ),
        ]

        conn.executemany(
            """
            INSERT INTO quiz_questions (
                question, option_a, option_b, option_c, option_d, correct_option, explanation
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            sample_questions,
        )

    tips_count = conn.execute("SELECT COUNT(*) FROM tips").fetchone()[0]
    if tips_count == 0:
        sample_tips = [
            "Never share your OTP or banking password with anyone, even if the message looks urgent.",
            "Enable two-factor authentication on your important accounts for stronger protection.",
            "Before clicking a link, check whether the domain is correct and the website uses HTTPS.",
            "Use password managers to generate and store unique, strong passwords for every account.",
            "Update your operating system and apps regularly to patch security vulnerabilities.",
            "Do not open attachments from unknown senders, especially if they ask you to download files.",
            "Be careful with public Wi-Fi; use a VPN when handling sensitive information.",
            "If an email asks for urgent action, verify it through a trusted official channel first.",
            "Back up important files regularly so you can recover quickly from ransomware or data loss.",
            "Always verify the sender's identity before sharing personal or work-related information.",
        ]
        conn.executemany(
            "INSERT INTO tips (text) VALUES (?)",
            [(tip,) for tip in sample_tips],
        )

    conn.commit()
    conn.close()


def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None

    conn = get_db()
    user = conn.execute(
        "SELECT id, name, email, role FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    conn.close()
    return dict(user) if user else None


def train_or_load_phishing_model():
    model_dir = BASE_DIR / "models"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / "phishing_model.pkl"

    if model_path.exists():
        try:
            with model_path.open("rb") as model_file:
                return pickle.load(model_file)
        except Exception:
            pass

    training_samples = {
        "Safe": [
            "Thanks for your message. Please let me know if you need any help with our meeting schedule.",
            "Hi team, the project update is attached for review tomorrow morning.",
            "Your monthly report has been prepared and is ready for approval.",
            "Please confirm the lecture slot for next week and share your availability.",
            "I have completed the requested document and uploaded it to the shared folder.",
            "We are looking forward to meeting you at the conference next Friday.",
        ],
        "Suspicious": [
            "Your account has unusual activity. Please review the recent security notice.",
            "We have detected a login attempt from a new device. Verify your session now.",
            "Your invoice is ready for review and requires immediate confirmation.",
            "An unknown payment request requires your attention before the deadline.",
            "Action required: your cloud storage license may be suspended if you do not update your settings.",
            "A file from your colleague is waiting for review and approval.",
        ],
        "Phishing": [
            "URGENT: Your bank account has been locked. Verify your identity immediately and update your password now.",
            "Action required: We detected suspicious activity on your account. Click here to secure your account and confirm your OTP.",
            "Claim your reward now by clicking the secure access link and entering your payment details.",
            "Your account will be permanently blocked unless you verify your credentials through the attached link.",
            "Win a free gift voucher by confirming your bank information and resetting your login details.",
            "Security alert: an unauthorized login was detected. Reply with your one time password to verify your identity.",
        ],
    }

    texts = []
    labels = []
    for label, samples in training_samples.items():
        for sample in samples:
            texts.append(sample)
            labels.append(label)

    model = Pipeline(
        steps=[
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            ("classifier", LogisticRegression(max_iter=2000, random_state=42)),
        ]
    )
    model.fit(texts, labels)

    with model_path.open("wb") as model_file:
        pickle.dump(model, model_file)

    return model


def build_user_report_pdf(user, stats, history_rows):
    buffer = io.BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=letter, title="CyberGuard AI Report")
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("CyberGuard AI Security Report", styles["Title"]))
    elements.append(Paragraph(f"Prepared for: {user['name']} ({user['email']})", styles["Normal"]))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
    elements.append(Spacer(1, 18))

    summary_data = [
        ["Metric", "Value"],
        ["Total Checks", str(stats.get("totalChecks", 0))],
        ["Safe", str(stats.get("safeChecks", 0))],
        ["Suspicious", str(stats.get("suspiciousChecks", 0))],
        ["Dangerous", str(stats.get("dangerousChecks", 0))],
        ["Phishing Detected", str(stats.get("phishingChecks", 0))],
    ]

    elements.append(Table(summary_data, colWidths=[180, 120]))
    elements.append(Spacer(1, 18))
    elements.append(Paragraph("Recent Activity", styles["Heading2"]))

    if history_rows:
        table_rows = [["Module", "Result", "Details", "Date"]]
        for row in history_rows[:20]:
            table_rows.append(
                [
                    row["module"],
                    row["result"],
                    (row["details"] or "")[:80],
                    row["created_at"].split(" ")[0],
                ]
            )

        elements.append(
            Table(
                table_rows,
                colWidths=[100, 90, 240, 90],
                repeatRows=1,
            )
        )
    else:
        elements.append(Paragraph("No history available yet.", styles["Normal"]))

    document.build(elements)
    pdf_output = buffer.getvalue()
    buffer.close()
    return pdf_output


def login_required(view):
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"success": False, "message": "Please log in first."}), 401
        return view(*args, **kwargs)

    wrapped.__name__ = view.__name__
    return wrapped


def get_daily_tip():
    conn = get_db()
    tips = conn.execute("SELECT text FROM tips ORDER BY id ASC").fetchall()
    conn.close()

    if not tips:
        return "Never share your OTP with anyone."

    day_index = datetime.now().day % len(tips)
    return tips[day_index]["text"]


def analyze_email(text: str):
    cleaned = (text or "").strip()

    if not cleaned:
        return {
            "success": False,
            "category": "Suspicious",
            "reason": "Please paste an email or message to analyze.",
        }

    lowered = cleaned.lower()

    suspicious_terms = [
        "urgent", "click here", "verify your account", "update your password",
        "limited time", "free prize", "claim your reward", "invoice", "account locked",
        "security alert", "otp", "one time password", "suspicious activity", "bank account",
        "confirm your identity", "payment failed", "attachment", "download now"
    ]

    matched_terms = [term for term in suspicious_terms if term in lowered]

    model = train_or_load_phishing_model()
    predicted_label = model.predict([cleaned])[0]
    confidence = round(max(model.predict_proba([cleaned])[0]) * 100, 1)

    category = predicted_label

    if category == "Phishing":
        reason = (
            "The ML classifier strongly suggests this is phishing content. "
            f"High-risk indicators were detected: {', '.join(matched_terms[:5]) or 'urgent credential request'}"
        )
    elif category == "Suspicious":
        reason = (
            "The message appears suspicious and should be handled carefully. "
            f"Indicators detected: {', '.join(matched_terms[:5]) if matched_terms else 'generic warning language'}"
        )
    else:
        reason = "No suspicious indicators were detected in the email text."

    return {
        "success": True,
        "category": category,
        "reason": reason,
        "matched_terms": matched_terms,
        "confidence": confidence,
    }


def analyze_password(password: str):
    cleaned = password or ""
    common_passwords = {
        "password", "123456", "12345678", "qwerty", "admin", "welcome", "letmein",
        "password123", "abc123", "secret", "passw0rd"
    }

    weaknesses = []
    score = 0

    if len(cleaned) >= 14:
        score += 35
    elif len(cleaned) >= 10:
        score += 25
    elif len(cleaned) >= 8:
        score += 15
    else:
        weaknesses.append("Use at least 8 characters.")

    has_upper = any(char.isupper() for char in cleaned)
    has_lower = any(char.islower() for char in cleaned)
    has_digit = any(char.isdigit() for char in cleaned)
    has_special = any(not char.isalnum() for char in cleaned)

    if has_upper:
        score += 15
    else:
        weaknesses.append("Add uppercase letters.")

    if has_lower:
        score += 15
    else:
        weaknesses.append("Add lowercase letters.")

    if has_digit:
        score += 15
    else:
        weaknesses.append("Include numbers.")

    if has_special:
        score += 20
    else:
        weaknesses.append("Add at least one special character such as !, @, #, or $.")

    if cleaned.lower() in common_passwords:
        weaknesses.append("This password is commonly used and is easy to guess.")
        score -= 20

    sequential = any(
        cleaned[i] == cleaned[i + 1] and cleaned[i + 1] == cleaned[i + 2]
        for i in range(len(cleaned) - 2)
    )
    if sequential:
        weaknesses.append("Avoid repeated characters or predictable patterns.")
        score -= 10

    score = max(0, min(100, score))

    if score >= 80:
        label = "Strong"
    elif score >= 60:
        label = "Moderate"
    else:
        label = "Weak"

    if not weaknesses:
        weaknesses = ["No major weaknesses detected."]

    suggestion = generate_password_suggestion()

    return {
        "success": True,
        "score": score,
        "label": label,
        "weaknesses": weaknesses,
        "suggestion": suggestion,
    }


def generate_password_suggestion():
    adjectives = ["Bright", "Swift", "Night", "Silver", "Atlas", "Mango", "Stone", "Royal"]
    nouns = ["Echo", "Wave", "River", "Map", "Orbit", "Token", "Pixel", "Grove"]
    number = random.randint(12, 99)
    symbol = random.choice(["!", "@", "#", "$", "%", "&"])
    return f"{random.choice(adjectives)}{random.choice(nouns)}{number}{symbol}"


def analyze_url(url: str):
    cleaned = (url or "").strip()

    if not cleaned:
        return {
            "success": False,
            "category": "Dangerous",
            "reason": "Please enter a valid URL.",
        }

    parsed = urlparse(cleaned)
    host = (parsed.hostname or "").lower()
    scheme = parsed.scheme.lower()

    suspicious_keywords = [
        "login", "verify", "secure", "account", "update", "confirm", "bank", "paypal", "reset"
    ]

    dangerous_indicators = []
    if not host or "." not in host:
        dangerous_indicators.append("The URL is missing a valid domain structure.")

    if scheme not in {"http", "https"}:
        dangerous_indicators.append("The URL does not use a valid web scheme.")

    if scheme == "http":
        dangerous_indicators.append("The URL uses HTTP instead of HTTPS.")

    if host.replace(".", "").isdigit():
        dangerous_indicators.append("The domain appears to be an IP address, which is often risky.")

    if any(keyword in host for keyword in suspicious_keywords):
        dangerous_indicators.append("The domain contains login or security-related words that are common in phishing links.")

    if len(host) > 30 and any(keyword in host for keyword in suspicious_keywords):
        dangerous_indicators.append("The hostname is unusually long and resembles a fake website.")

    if dangerous_indicators:
        category = "Dangerous" if len(dangerous_indicators) >= 2 else "Suspicious"
        reason = " ".join(dangerous_indicators)
    else:
        category = "Safe"
        reason = "The URL appears to be a legitimate website and does not show common phishing patterns."

    return {
        "success": True,
        "category": category,
        "reason": reason,
    }


def chatbot_reply(question: str):
    cleaned = (question or "").strip()
    if not cleaned:
        return "Please ask a cyber security question and I will help you."

    lowered = cleaned.lower()

    if "phishing" in lowered:
        return (
            "Phishing is a cyber attack where scammers send fake emails, messages, or websites that try to trick you into sharing passwords, OTPs, or personal information. "
            "Always verify the sender and never click unknown links."
        )

    if "malware" in lowered:
        return (
            "Malware is harmful software such as viruses, trojans, ransomware, or spyware. It can damage devices, steal data, or lock files. "
            "Keep your software updated and avoid downloading files from untrusted sources."
        )

    if "stay safe online" in lowered or "safe online" in lowered or "how to stay safe" in lowered:
        return (
            "To stay safe online, use strong passwords, enable two-factor authentication, update software regularly, avoid suspicious links, and never share OTPs with anyone."
        )

    if "strong password" in lowered or "password" in lowered:
        return (
            "A strong password should be long, unique, and include uppercase letters, lowercase letters, numbers, and special characters. "
            "For example: BrightWave42!"
        )

    if "otp" in lowered:
        return "Never share your OTP with anyone, even if the request seems urgent or comes from someone claiming to be your bank or a company."

    if "two-factor" in lowered or "2fa" in lowered:
        return "Two-factor authentication adds an extra verification step, making it much harder for attackers to access your account even if your password is exposed."

    return (
        "I can help with phishing, malware, online safety, passwords, and general cyber security tips. Try asking: 'What is phishing?' or 'How can I create a strong password?'"
    )


@app.route("/")
def index():
    return render_template("index.html", user=get_current_user())


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/api/auth/login", methods=["POST"])
def login():
    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    conn = get_db()
    user = conn.execute(
        "SELECT id, email, password_hash, role, name FROM users WHERE email = ?",
        (email,),
    ).fetchone()
    conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    session["user_id"] = user["id"]
    return jsonify({"success": True, "message": "Logged in successfully."})


@app.route("/api/auth/signup", methods=["POST"])
def signup():
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email, and password are required."}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password should be at least 6 characters."}), 400

    conn = get_db()
    existing = conn.execute(
        "SELECT id FROM users WHERE email = ?", (email,)
    ).fetchone()

    if existing:
        conn.close()
        return jsonify({"success": False, "message": "User already exists with this email."}), 409

    conn.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        (name, email, generate_password_hash(password), "user"),
    )
    conn.commit()
    user = conn.execute(
        "SELECT id, email, role, name FROM users WHERE email = ?", (email,)
    ).fetchone()
    conn.close()

    session["user_id"] = user["id"]
    return jsonify({"success": True, "message": "Account created successfully."})


@app.route("/api/dashboard")
@login_required
def dashboard():
    user = get_current_user()
    conn = get_db()

    total_history = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ?", (user["id"],)
    ).fetchone()[0]

    safe_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND result = 'Safe'",
        (user["id"],),
    ).fetchone()[0]

    suspicious_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND result = 'Suspicious'",
        (user["id"],),
    ).fetchone()[0]

    dangerous_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND result = 'Dangerous'",
        (user["id"],),
    ).fetchone()[0]

    phishing_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND module = 'Email Detector' AND result = 'Phishing'",
        (user["id"],),
    ).fetchone()[0]

    history_rows = conn.execute(
        """
        SELECT module, result, details, created_at
        FROM history
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 6
        """,
        (user["id"],),
    ).fetchall()

    quiz_rows = conn.execute(
        "SELECT id, question, option_a, option_b, option_c, option_d, correct_option, explanation FROM quiz_questions ORDER BY id ASC"
    ).fetchall()

    tip_rows = conn.execute(
        "SELECT id, text FROM tips ORDER BY id DESC LIMIT 10"
    ).fetchall()

    all_feedback = []
    if user["role"] == "admin":
        all_feedback = conn.execute(
            """
            SELECT f.id, u.name, u.email, f.message, f.rating, f.created_at
            FROM feedback f
            JOIN users u ON u.id = f.user_id
            ORDER BY f.id DESC
            LIMIT 10
            """
        ).fetchall()

    quiz = [dict(row) for row in quiz_rows]
    history = [dict(row) for row in history_rows]
    feedback = [dict(row) for row in all_feedback]
    tips = [dict(row) for row in tip_rows]

    conn.close()

    return jsonify(
        {
            "success": True,
            "user": user,
            "stats": {
                "totalChecks": total_history,
                "safeChecks": safe_checks,
                "suspiciousChecks": suspicious_checks,
                "dangerousChecks": dangerous_checks,
                "phishingChecks": phishing_checks,
            },
            "history": history,
            "quiz": quiz,
            "feedback": feedback,
            "tips": tips,
            "dailyTip": get_daily_tip(),
            "isAdmin": user["role"] == "admin",
        }
    )


@app.route("/api/email-analyze", methods=["POST"])
@login_required
def email_analyze():
    text = request.form.get("emailText", "")
    result = analyze_email(text)
    conn = get_db()
    conn.execute(
        "INSERT INTO history (user_id, module, result, details) VALUES (?, ?, ?, ?)",
        (
            session["user_id"],
            "Email Detector",
            result.get("category", "Safe"),
            result.get("reason", ""),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify(result)


@app.route("/api/password-check", methods=["POST"])
@login_required
def password_check():
    password = request.form.get("password", "")
    result = analyze_password(password)
    conn = get_db()
    conn.execute(
        "INSERT INTO history (user_id, module, result, details) VALUES (?, ?, ?, ?)",
        (
            session["user_id"],
            "Password Checker",
            result["label"],
            f"Score: {result['score']} | Weaknesses: {'; '.join(result['weaknesses'])}",
        ),
    )
    conn.commit()
    conn.close()
    return jsonify(result)


@app.route("/api/url-check", methods=["POST"])
@login_required
def url_check():
    url = request.form.get("url", "")
    result = analyze_url(url)
    conn = get_db()
    conn.execute(
        "INSERT INTO history (user_id, module, result, details) VALUES (?, ?, ?, ?)",
        (
            session["user_id"],
            "URL Safety Checker",
            result.get("category", "Dangerous"),
            result.get("reason", ""),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify(result)


@app.route("/api/chat", methods=["POST"])
@login_required
def chat():
    question = request.form.get("question", "")
    return jsonify({"success": True, "reply": chatbot_reply(question)})


@app.route("/profile")
@login_required
def profile():
    user = get_current_user()
    conn = get_db()

    total_history = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ?", (user["id"],)
    ).fetchone()[0]

    safe_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND result = 'Safe'",
        (user["id"],),
    ).fetchone()[0]

    suspicious_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND result = 'Suspicious'",
        (user["id"],),
    ).fetchone()[0]

    dangerous_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND result = 'Dangerous'",
        (user["id"],),
    ).fetchone()[0]

    phishing_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND module = 'Email Detector' AND result = 'Phishing'",
        (user["id"],),
    ).fetchone()[0]

    history_rows = conn.execute(
        """
        SELECT module, result, details, created_at
        FROM history
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user["id"],),
    ).fetchall()

    conn.close()

    stats = {
        "totalChecks": total_history,
        "safeChecks": safe_checks,
        "suspiciousChecks": suspicious_checks,
        "dangerousChecks": dangerous_checks,
        "phishingChecks": phishing_checks,
    }

    return render_template(
        "profile.html",
        user=user,
        stats=stats,
        history=[dict(row) for row in history_rows],
    )


@app.route("/api/report/export")
@login_required
def export_report():
    user = get_current_user()
    conn = get_db()

    total_history = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ?", (user["id"],)
    ).fetchone()[0]

    safe_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND result = 'Safe'",
        (user["id"],),
    ).fetchone()[0]

    suspicious_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND result = 'Suspicious'",
        (user["id"],),
    ).fetchone()[0]

    dangerous_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND result = 'Dangerous'",
        (user["id"],),
    ).fetchone()[0]

    phishing_checks = conn.execute(
        "SELECT COUNT(*) FROM history WHERE user_id = ? AND module = 'Email Detector' AND result = 'Phishing'",
        (user["id"],),
    ).fetchone()[0]

    history_rows = conn.execute(
        """
        SELECT module, result, details, created_at
        FROM history
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 20
        """,
        (user["id"],),
    ).fetchall()

    conn.close()

    stats = {
        "totalChecks": total_history,
        "safeChecks": safe_checks,
        "suspiciousChecks": suspicious_checks,
        "dangerousChecks": dangerous_checks,
        "phishingChecks": phishing_checks,
    }

    pdf_bytes = build_user_report_pdf(
        user,
        stats,
        [dict(row) for row in history_rows],
    )

    response = make_response(pdf_bytes)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = (
        f'attachment; filename="{user["name"].replace(" ", "_")}_cyberguard_report.pdf"'
    )
    return response


@app.route("/api/feedback", methods=["POST"])
@login_required
def feedback():
    message = request.form.get("message", "").strip()
    rating = request.form.get("rating", "5")

    if not message:
        return jsonify({"success": False, "message": "Please enter feedback."}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO feedback (user_id, message, rating) VALUES (?, ?, ?)",
        (session["user_id"], message, int(rating)),
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Feedback submitted successfully."})


@app.route("/api/admin/quiz", methods=["POST"])
@login_required
def add_quiz():
    user = get_current_user()
    if user["role"] != "admin":
        return jsonify({"success": False, "message": "Admin access required."}), 403

    question = request.form.get("question", "").strip()
    option_a = request.form.get("option_a", "").strip()
    option_b = request.form.get("option_b", "").strip()
    option_c = request.form.get("option_c", "").strip()
    option_d = request.form.get("option_d", "").strip()
    correct_option = request.form.get("correct_option", "1")
    explanation = request.form.get("explanation", "").strip()

    if not all([question, option_a, option_b, option_c, option_d, explanation]):
        return jsonify({"success": False, "message": "All quiz fields are required."}), 400

    conn = get_db()
    conn.execute(
        """
        INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_option, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (question, option_a, option_b, option_c, option_d, int(correct_option), explanation),
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Quiz question added successfully."})


@app.route("/api/admin/tip", methods=["POST"])
@login_required
def add_tip():
    user = get_current_user()
    if user["role"] != "admin":
        return jsonify({"success": False, "message": "Admin access required."}), 403

    text = request.form.get("text", "").strip()
    if not text:
        return jsonify({"success": False, "message": "Tip text is required."}), 400

    conn = get_db()
    conn.execute("INSERT INTO tips (text) VALUES (?)", (text,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Tip added successfully."})


@app.route("/api/admin/feedback", methods=["GET"])
@login_required
def admin_feedback():
    user = get_current_user()
    if user["role"] != "admin":
        return jsonify({"success": False, "message": "Admin access required."}), 403

    conn = get_db()
    rows = conn.execute(
        """
        SELECT f.id, u.name, u.email, f.message, f.rating, f.created_at
        FROM feedback f
        JOIN users u ON u.id = f.user_id
        ORDER BY f.id DESC
        LIMIT 20
        """
    ).fetchall()
    conn.close()

    return jsonify({"success": True, "feedback": [dict(row) for row in rows]})


init_db()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
