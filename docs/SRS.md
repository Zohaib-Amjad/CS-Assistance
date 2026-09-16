# Software Requirements Specification (SRS)

## 1. Introduction

The AI Cyber Security Assistant is a web application designed to help users understand and respond to common cyber security threats. The system uses a simple AI-assisted approach to classify suspicious emails, analyze password strength, scan URLs, answer basic cyber questions, and provide security guidance.

## 2. Purpose

The purpose of the system is to raise cyber security awareness and provide students with a practical FYP project that combines web development, Python programming, AI concepts, and database usage.

## 3. Scope

The system covers the following core modules:

- Phishing Email Detector
- Password Security Checker
- URL Safety Checker
- AI Cyber Chatbot
- Cyber Security Quiz
- Daily Cyber Security Tips

The system also includes:

- login/signup
- dashboard
- admin panel
- feedback module

## 4. Functional Requirements

### 4.1 User Registration and Login
- User can create an account with name, email, and password.
- User can log in to access dashboard features.
- Admin account is pre-seeded in the system.

### 4.2 Email Detector
- User pastes an email or message text.
- System classifies it as Safe, Suspicious, or Phishing.
- System explains the reason behind the decision.

### 4.3 Password Checker
- User enters a password.
- System evaluates the password strength.
- System lists weaknesses.
- System suggests a stronger password.

### 4.4 URL Safety Checker
- User enters a URL.
- System checks for suspicious or dangerous indicators.
- System returns Safe, Suspicious, or Dangerous.

### 4.5 AI Cyber Chatbot
- User can ask common cyber security questions.
- System responds in simple language.
- Responses are based on predefined rules.

### 4.6 Quiz Module
- System displays multiple-choice questions.
- User answers all questions.
- System calculates score.
- System shows correct answers and explanations.

### 4.7 Daily Security Tips
- System displays a daily tip from the database.
- Admin can add more tips.

### 4.8 Admin Panel
- Admin can add new quiz questions.
- Admin can add new daily tips.
- Admin can view feedback from users.

### 4.9 Feedback Module
- Logged-in users can submit feedback and rating.

## 5. Non-Functional Requirements

- User-friendly interface
- Responsive layout for desktop and smaller screens
- Fast response time for local use
- Secure password hashing
- SQLite-based local storage
- Basic error handling and validation

## 6. Constraints

- The phishing detection is rule-based in the current version.
- AI chatbot replies are predefined, not trained with a large language model.
- The application is designed for local/demo deployment.

## 7. Assumptions

- Users will access the system through a browser.
- Admin credentials are pre-created for demonstration purposes.
- SQLite is sufficient for the project scope.

## 8. Success Criteria

The system is considered successful if it can:

- detect suspicious email patterns
- assess password strength
- classify websites safely
- respond to basic cyber security questions
- provide a quiz and score result
- support admin tasks easily
