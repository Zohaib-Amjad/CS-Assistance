# Use Case Diagram

## Overview

This project includes multiple actors and use cases. The main user is a registered user, while the admin manages content and reviews feedback.

## Mermaid Diagram

```mermaid
flowchart TD
    A[User] --> U1[Register Account]
    A --> U2[Login]
    A --> U3[Analyze Email]
    A --> U4[Check Password]
    A --> U5[Check URL]
    A --> U6[Use AI Chatbot]
    A --> U7[Attempt Quiz]
    A --> U8[Read Daily Tips]
    A --> U9[Submit Feedback]

    B[Admin] --> A1[Login as Admin]
    B --> A2[Add Quiz Questions]
    B --> A3[Add Daily Tips]
    B --> A4[View User Feedback]
    B --> A5[View Dashboard Stats]

    U3 --> S1[Phishing Detection Results]
    U4 --> S2[Password Strength Results]
    U5 --> S3[URL Safety Results]
    U6 --> S4[Cyber Security Answers]
    U7 --> S5[Quiz Score and Correct Answers]
```

## Use Cases

### User Use Cases
- Create account
- Login/logout
- Paste email for analysis
- Enter password for evaluation
- Enter URL for scanning
- Ask chatbot questions
- Take quiz
- View daily security tips
- Submit feedback

### Admin Use Cases
- Login with admin account
- Add quiz questions
- Add new tips
- View dashboard information
- View user feedback
