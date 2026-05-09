-- ────────────────────────────────────────────────────────
-- Phase 1 Migration
-- Adds: lecturer TOC, saved topics, table-generation flag
-- ────────────────────────────────────────────────────────

-- 1. New columns on pp_projects
ALTER TABLE pp_projects
  ADD COLUMN IF NOT EXISTS lecturer_toc TEXT,        -- supervisor-provided table of contents
  ADD COLUMN IF NOT EXISTS lecturer_notes TEXT,      -- any extra instructions from supervisor
  ADD COLUMN IF NOT EXISTS interests TEXT;           -- student's research interests (kept for AI context)

-- 2. New columns on pp_chapters
ALTER TABLE pp_chapters
  ADD COLUMN IF NOT EXISTS include_tables BOOLEAN DEFAULT FALSE; -- generate tables/charts in this chapter

-- 3. Saved topics table — students can save a batch of suggestions
--    to show their supervisor and come back to pick one
CREATE TABLE IF NOT EXISTS pp_saved_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rationale TEXT,
  department TEXT,
  field TEXT,
  level TEXT,
  source TEXT DEFAULT 'ai',     -- 'ai', 'perplexity', 'user'
  citations JSONB DEFAULT '[]', -- Perplexity source URLs/snippets if any
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'used')),
  supervisor_note TEXT,         -- student can add a note about supervisor's reaction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pp_saved_topics_user_idx ON pp_saved_topics(user_id, created_at DESC);

-- RLS
ALTER TABLE pp_saved_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pp_saved_topics_own" ON pp_saved_topics;
CREATE POLICY "pp_saved_topics_own" ON pp_saved_topics FOR ALL
  USING (auth.uid() = user_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS pp_saved_topics_updated_at ON pp_saved_topics;
CREATE TRIGGER pp_saved_topics_updated_at
  BEFORE UPDATE ON pp_saved_topics
  FOR EACH ROW EXECUTE FUNCTION update_pp_updated_at();
