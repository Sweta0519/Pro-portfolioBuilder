-- 🏗️ ProPortfolio Builder Schema Migration
-- Initial Database Structure, RLS Policies, and Storage Bucket configuration

-- 1. Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_json JSONB NOT NULL, -- personalInfo, work, education, projects, skills
  raw_text TEXT,              -- raw extracted text from PDF/Word for search indexing
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  selected_theme VARCHAR(50) DEFAULT 'minimal-slate',
  accent_color VARCHAR(30) DEFAULT 'violet',
  typography VARCHAR(30) DEFAULT 'sans',
  avatar_url TEXT, -- Link to storage bucket image
  custom_domain VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create mock_interviews table
CREATE TABLE IF NOT EXISTS mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_company VARCHAR(100) NOT NULL,
  target_role VARCHAR(100) NOT NULL,
  qa_history JSONB NOT NULL, -- array of {questionId, question, userAnswer, score, feedback}
  overall_score INT NOT NULL,
  overall_grade VARCHAR(10) NOT NULL,
  practiced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;

-- 5. Set up RLS Policies for resumes
CREATE POLICY "Users can only edit their own resumes"
  ON resumes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Set up RLS Policies for portfolios
-- Owner has full access to view/edit their portfolio
CREATE POLICY "Users can edit their own portfolios"
  ON portfolios FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can view portfolios (publicly accessible websites)
CREATE POLICY "Anyone can view portfolios"
  ON portfolios FOR SELECT
  USING (true);

-- 7. Set up RLS Policies for mock_interviews
CREATE POLICY "Users can view/edit their own mock interviews"
  ON mock_interviews FOR ALL
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
