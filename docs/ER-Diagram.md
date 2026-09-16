# ER Diagram

## Overview

The database is designed to store users, quiz questions, daily tips, user activity history, and feedback.

## Mermaid ER Diagram

```mermaid
erDiagram
    USERS ||--o{ HISTORY : has
    USERS ||--o{ FEEDBACK : submits

    USERS {
        int id PK
        string name
        string email
        string password_hash
        string role
        datetime created_at
    }

    QUIZ_QUESTIONS {
        int id PK
        text question
        text option_a
        text option_b
        text option_c
        text option_d
        int correct_option
        text explanation
        datetime created_at
    }

    TIPS {
        int id PK
        text text
        datetime created_at
    }

    HISTORY {
        int id PK
        int user_id FK
        string module
        string result
        text details
        datetime created_at
    }

    FEEDBACK {
        int id PK
        int user_id FK
        text message
        int rating
        datetime created_at
    }
```

## Database Explanation

- Users store account information and role.
- Quiz questions store MCQ content and answer explanations.
- Tips store daily cyber security messages.
- History stores what each user checked previously.
- Feedback stores ratings and comments submitted by users.
