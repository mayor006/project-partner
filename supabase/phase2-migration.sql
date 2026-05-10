-- ────────────────────────────────────────────────────────
-- Phase 2 Migration
-- Approval gates per chapter and per project stage
-- ────────────────────────────────────────────────────────

-- 1. Add approval_status to chapters
ALTER TABLE pp_chapters
  ADD COLUMN IF NOT EXISTS approval_status TEXT
    DEFAULT 'pending_review'
    CHECK (approval_status IN ('pending_review', 'in_revision', 'approved')),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;

-- Existing completed chapters: mark as approved (per user's decision)
UPDATE pp_chapters
SET approval_status = 'approved', approved_at = updated_at
WHERE status = 'completed' AND approval_status = 'pending_review';

-- 2. Add approval_status to project stages
ALTER TABLE pp_project_stages
  ADD COLUMN IF NOT EXISTS approval_status TEXT
    DEFAULT 'pending_review'
    CHECK (approval_status IN ('pending_review', 'in_revision', 'approved')),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Existing completed stages: mark as approved
UPDATE pp_project_stages
SET approval_status = 'approved', approved_at = updated_at
WHERE status = 'completed' AND approval_status = 'pending_review';

-- 3. Feedback rounds — per-chapter conversation thread
CREATE TABLE IF NOT EXISTS pp_chapter_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES pp_projects(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES pp_chapters(id) ON DELETE CASCADE,
  stage_number INTEGER,           -- nullable; for stage-level feedback (e.g. structure)
  feedback_text TEXT NOT NULL,
  attachments JSONB DEFAULT '[]', -- array of { kind: 'image'|'audio'|'file', url, name }
  audio_transcript TEXT,          -- transcribed Whisper output if audio attached
  before_content TEXT,            -- snapshot of content before this revision
  after_content TEXT,             -- snapshot of content after this revision
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pp_chapter_feedback_chapter_idx
  ON pp_chapter_feedback(chapter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS pp_chapter_feedback_stage_idx
  ON pp_chapter_feedback(project_id, stage_number, created_at DESC);

ALTER TABLE pp_chapter_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pp_chapter_feedback_own" ON pp_chapter_feedback;
CREATE POLICY "pp_chapter_feedback_own" ON pp_chapter_feedback FOR ALL
  USING (auth.uid() = (SELECT user_id FROM pp_projects WHERE id = project_id));

-- 4. Storage bucket for feedback attachments
-- Run this in the Supabase Storage dashboard if it doesn't auto-create:
--   Storage → New bucket → name: "pp-feedback" → public: false
-- Then policies:
INSERT INTO storage.buckets (id, name, public)
  VALUES ('pp-feedback', 'pp-feedback', false)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies — allow authenticated users to upload/read their own files
DROP POLICY IF EXISTS "pp_feedback_upload" ON storage.objects;
CREATE POLICY "pp_feedback_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pp-feedback' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "pp_feedback_read" ON storage.objects;
CREATE POLICY "pp_feedback_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pp-feedback' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "pp_feedback_delete" ON storage.objects;
CREATE POLICY "pp_feedback_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pp-feedback' AND (storage.foldername(name))[1] = auth.uid()::text);
