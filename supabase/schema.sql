-- Project Partner Schema
-- Run this in your Supabase SQL editor (existing Wadescribe project)
-- All tables are prefixed with pp_ to avoid conflicts

-- Profiles table for Project Partner users
CREATE TABLE IF NOT EXISTS pp_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS pp_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  department TEXT,
  field TEXT,
  level TEXT DEFAULT '400', -- e.g. 300, 400, PGD, MSc, PhD
  stage INTEGER DEFAULT 1 CHECK (stage BETWEEN 1 AND 6),
  stage_name TEXT DEFAULT 'topic_discovery',
  topic TEXT,
  abstract TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage data (flexible JSON storage per stage)
CREATE TABLE IF NOT EXISTS pp_project_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES pp_projects(id) ON DELETE CASCADE NOT NULL,
  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 5),
  stage_name TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, stage_number)
);

-- Chapters table
CREATE TABLE IF NOT EXISTS pp_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES pp_projects(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, chapter_number)
);

-- Lecturer feedback
CREATE TABLE IF NOT EXISTS pp_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES pp_projects(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES pp_chapters(id) ON DELETE SET NULL,
  feedback_text TEXT NOT NULL,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_pp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pp_projects_updated_at
  BEFORE UPDATE ON pp_projects
  FOR EACH ROW EXECUTE FUNCTION update_pp_updated_at();

CREATE TRIGGER pp_project_stages_updated_at
  BEFORE UPDATE ON pp_project_stages
  FOR EACH ROW EXECUTE FUNCTION update_pp_updated_at();

CREATE TRIGGER pp_chapters_updated_at
  BEFORE UPDATE ON pp_chapters
  FOR EACH ROW EXECUTE FUNCTION update_pp_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_pp_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pp_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if not already exists (won't conflict with Wadescribe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_pp'
  ) THEN
    CREATE TRIGGER on_auth_user_created_pp
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_pp_new_user();
  END IF;
END $$;

-- Row Level Security
ALTER TABLE pp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pp_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pp_project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pp_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pp_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users only see their own data
CREATE POLICY "pp_profiles_own" ON pp_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "pp_projects_own" ON pp_projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "pp_stages_own" ON pp_project_stages FOR ALL
  USING (auth.uid() = (SELECT user_id FROM pp_projects WHERE id = project_id));

CREATE POLICY "pp_chapters_own" ON pp_chapters FOR ALL
  USING (auth.uid() = (SELECT user_id FROM pp_projects WHERE id = project_id));

CREATE POLICY "pp_feedback_own" ON pp_feedback FOR ALL
  USING (auth.uid() = (SELECT user_id FROM pp_projects WHERE id = project_id));
