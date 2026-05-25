# 🏗️ ProPortfolio Builder: Backend Architecture & Database Design Plan

This document outlines the roadmap to transition the ProPortfolio Builder from a client-side only (localStorage-based) application into a full-stack application. It details what data needs to be stored, the database schema layout, and the setup steps for two primary backend options: **Supabase (Recommended)** and a **Node.js/Express Server**.

---

## 1. What Needs to be Stored?

Currently, all user modifications and configurations are saved in the browser's `localStorage`. If the user clears their browser cache or changes browsers, their data is lost. A backend will store:

1. **User Authentication**: Email/password credentials or social logins (Google, GitHub) to secure portfolios.
2. **Resume Data**: The JSON resume schema (Work Experience, Skills, Projects, Education, etc.).
3. **Uploaded Avatars**: Binary images (JPEG/PNG) stored in a storage bucket rather than as massive Base64 strings.
4. **Mock Interview Analytics**: Scores, grades, and text transcripts for past practice sessions.
5. **Secure Keys**: Securely proxying AI connections so Groq or Gemini API keys do not need to be exposed in the client code.

---

## 2. Recommended Backend Architecture: Supabase

For a developer who is learning, **Supabase** is highly recommended. It is an open-source Firebase alternative built on **PostgreSQL**.

### Why Supabase?
- **Auth Included**: Built-in User sign-ups and logins (JWT tokens) out-of-the-box.
- **Auto-API**: Instantly generates REST and GraphQL APIs based on your database tables.
- **Row-Level Security (RLS)**: Enforces rules in the database directly (e.g. *"Users can only view/edit their own resume data"*).
- **Storage Buckets**: Built-in cloud storage for uploading profile images.
- **Free Tier**: Very generous free tier, perfect for launching portfolios.

---

## 3. Database Schema Design (PostgreSQL)

Below is the proposed entity-relationship database schema:

```
┌──────────────┐          ┌──────────────┐
│    users     │          │   resumes    │
├──────────────┤          ├──────────────┤
│ id (PK)      │ ─── 1:N ─│ id (PK)      │
│ email        │          │ user_id (FK) │
│ created_at   │          │ resume_json  │
└──────────────┘          │ raw_text     │
        │                 │ updated_at   │
        │                 └──────────────┘
        │
        │                 ┌───────────────┐
        ├───────── 1:N ── │portfolios     │
        │                 ├───────────────┤
        │                 │ id (PK)       │
        │                 │ user_id (FK)  │
        │                 │ selected_theme│
        │                 │ accent_color  │
        │                 │ typography    │
        │                 │ avatar_url    │
        │                 │ custom_domain │
        │                 └───────────────┘
        │
        │                 ┌──────────────────┐
        └───────── 1:N ── │ mock_interviews  │
                          ├──────────────────┤
                          │ id (PK)          │
                          │ user_id (FK)     │
                          │ target_company   │
                          │ target_role      │
                          │ qa_history (JSON)│
                          │ overall_score    │
                          │ overall_grade    │
                          │ practiced_at     │
                          └──────────────────┘
```

### Table Definitions

#### 1. `resumes`
Stores the extracted JSON data from parsed resumes.
```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_json JSONB NOT NULL, -- personalInfo, work, education, projects, skills
  raw_text TEXT,              -- raw extracted text from PDF/Word for search indexing
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 2. `portfolios`
Stores customization details for the generated portfolio.
```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  selected_theme VARCHAR(50) DEFAULT 'minimal-slate',
  accent_color VARCHAR(30) DEFAULT 'violet',
  typography VARCHAR(30) DEFAULT 'sans',
  avatar_url TEXT, -- Link to storage bucket image
  custom_domain VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 3. `mock_interviews`
Tracks candidate progress through interview rounds.
```sql
CREATE TABLE mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_company VARCHAR(100) NOT NULL,
  target_role VARCHAR(100) NOT NULL,
  qa_history JSONB NOT NULL, -- array of {questionId, question, userAnswer, score, feedback}
  overall_score INT NOT NULL,
  overall_grade VARCHAR(10) NOT NULL,
  practiced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 4. Alternative: Custom Node.js / Express Server

If you want to write the backend code yourself to learn the server side:

```
Vite React Client (Port 5173)
        │ (fetch API requests)
        ▼
Express Node Server (Port 3000)
        │ (SQL queries / pg pool)
        ▼
PostgreSQL / MongoDB Database
```

### Stack Components:
1. **Runtime**: Node.js
2. **Server Framework**: Express.js
3. **Database Driver**: `pg` (for PostgreSQL) or `mongoose` (for MongoDB)
4. **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` for password hashing.
5. **Image Hosting**: Cloudinary or Amazon S3 API.

---

## 5. Step-by-Step Backend Setup Roadmap (Supabase Integration)

If we proceed with Supabase, here are the steps we will take:

1. **Create Supabase Account & Project**: Set up a project at supabase.com.
2. **Setup Database Tables & Row-Level Security**: Write SQL tables and protect them.
3. **Install Client SDK**: Add `@supabase/supabase-js` to your Vite React workspace.
4. **Build Sign-Up / Log-In Interface**: Create components inside the app to handle session states.
5. **Sync Data**: Save state variables in the PostgreSQL database rather than just `localStorage`.

### Phase 1: Supabase Console Configuration
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the **SQL Editor**, run the database table creation scripts (see Section 3).
3. Enable Row-Level Security (RLS) and set policy:
   ```sql
   ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can only edit their own resumes"
     ON resumes FOR ALL
     TO authenticated
     USING (auth.uid() = user_id);
   ```

### Phase 2: React App Integration
1. Install Supabase client SDK:
   ```bash
   npm install @supabase/supabase-js
   ```
2. Create `src/supabaseClient.ts` to initialize connection:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```
3. Add signup/login state handling in `src/App.tsx`.
