-- 🏗️ ProPortfolio Builder Schema Migration
-- Initial Database Structure, RLS Policies, and Storage Bucket configuration

-- 1. Create resumes table matching the app code schema
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  resume_json JSONB NOT NULL,    -- personalInfo, work, education, projects, skills
  theme_settings JSONB,          -- active theme styles/layout configurations
  raw_text TEXT,                 -- raw extracted text from PDF/Word for search indexing
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create portfolios table (for public-facing pages)
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  selected_theme VARCHAR(50) DEFAULT 'minimal-slate',
  accent_color VARCHAR(30) DEFAULT 'violet',
  typography VARCHAR(30) DEFAULT 'sans',
  avatar_url TEXT,               -- Link to storage bucket image
  custom_domain VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create interview_sessions table (matching the exact fields read/written by App.tsx)
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name VARCHAR(150),
  position_name VARCHAR(150),
  job_description TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  plan JSONB,
  gemini_data JSONB,
  mock_answers JSONB,
  mock_scores JSONB,
  ideal_answers JSONB,
  recruiter_persona_id VARCHAR(50),
  recruiter_replies JSONB,
  session_summary_feedback TEXT,
  recruiter_questions JSONB,
  interface_mode VARCHAR(50) DEFAULT 'standard',
  is_completed BOOLEAN DEFAULT false,
  mock_round VARCHAR(50),
  mock_question_idx INT DEFAULT 0,
  mock_mode VARCHAR(50)
);

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Set up RLS Policies for resumes
CREATE POLICY "Users can only edit their own resumes"
  ON resumes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Set up RLS Policies for portfolios
CREATE POLICY "Users can edit their own portfolios"
  ON portfolios FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view portfolios"
  ON portfolios FOR SELECT
  USING (true);

-- 7. Set up RLS Policies for interview_sessions
CREATE POLICY "Users can view/edit their own sessions"
  ON interview_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- 8. Create Public Avatars Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Set up storage security policies for avatars bucket
-- Anyone can view uploaded avatars
CREATE POLICY "Avatar uploads are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Authenticated users can insert avatars into their own folder (folder named after user ID)
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Users can update/delete their own avatars
CREATE POLICY "Users can update/delete their own avatars"
  ON storage.objects FOR ALL
  TO authenticated
  USING ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
