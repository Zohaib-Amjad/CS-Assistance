# AI Cyber Security Assistant

A Flask-based web application that helps users understand common cyber security threats and stay safer online using AI-assisted tools.

## Project Goal

This project provides a beginner-friendly cyber security dashboard where users can:

- analyze phishing emails
- check password strength
- scan URLs for suspicious patterns
- ask simple cyber security questions to an AI chatbot
- attempt a cyber quiz
- read daily security tips
- use an admin panel to manage quiz items and tips

## Features Implemented

### User Modules
- AI Phishing Email Detector with ML-backed classification
- Password Security Checker
- URL Safety Checker
- AI Cyber Chatbot
- Cyber Security Quiz
- Daily Security Tips
- Feedback form
- Profile and activity history page
- PDF report export

### Admin Features
- Add quiz questions
- Add daily tips
- View user feedback
- Dashboard statistics

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python, Flask
- Database: SQLite
- AI support: rule-based reasoning for phishing, password, URL checks, and chatbot responses

## Run the Project

1. Open terminal in the project folder.
2. Activate the virtual environment if available.
3. Run:

```bash
python app.py
```

4. Open in browser:

```text
http://127.0.0.1:5000
```

## Deploy to Vercel

This repository includes a Vercel configuration for the Flask application. Import the GitHub repository into Vercel and add `FLASK_SECRET_KEY` as an environment variable before deploying.

The default Vercel database path uses temporary storage, so user accounts and activity data are not persistent across serverless instances. Use an external PostgreSQL database before production use.

## Admin Login

- Email: admin@cyberguard.ai
- Password: admin123

## Project Structure

```text
AI-Cyber-Security-Assistant/
├── app.py
├── requirements.txt
├── cyberguard.db
├── static/
│   ├── css/
│   └── js/
├── templates/
│   └── index.html
├── docs/
│   ├── SRS.md
│   ├── Use-Case-Diagram.md
│   ├── ER-Diagram.md
│   └── VIVA_GUIDE.md
└── README.md
```

## Verification

The app was verified to load successfully and the dashboard API returned valid JSON data after login.

Recent completed enhancements include:

- ML-backed phishing detection using a trained classifier
- PDF report generation and export
- User profile and history page
- Favicon and dashboard/profile UI polish
- Workspace environment verification for the correct Python interpreter

## Future Improvements

- Optional deployment to a cloud hosting platform
- Additional real-world phishing datasets for model improvement
- Expansion with more cyber security modules

## Viva-Ready Concepts

This project demonstrates:

- AI and machine learning basics
- Cyber security awareness
- Web application development
- Database design and usage
- API development and integration
- Authentication and role-based access

## Suggested FYP Submission Order

1. Problem statement
2. SRS document
3. Use case analysis
4. ER diagram
5. Database schema
6. UI implementation
7. Backend logic
8. Testing and verification
9. Viva preparation
