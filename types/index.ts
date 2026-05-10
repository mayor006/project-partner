export type ProjectStage = 1 | 2 | 3 | 4 | 5 | 6

export type StageName =
  | 'topic_discovery'
  | 'project_structure'
  | 'chapter_writing'
  | 'lecturer_feedback'
  | 'defense_prep'
  | 'completed'

export interface Project {
  id: string
  user_id: string
  title: string
  department: string
  field: string
  level: string
  stage: ProjectStage
  stage_name: StageName
  topic?: string
  abstract?: string
  // Phase 1 additions
  lecturer_toc?: string | null
  lecturer_notes?: string | null
  interests?: string | null
  created_at: string
  updated_at: string
}

export type ApprovalStatus = 'pending_review' | 'in_revision' | 'approved'

export interface ProjectStageData {
  id: string
  project_id: string
  stage_number: number
  stage_name: StageName
  content: Record<string, unknown>
  status: 'pending' | 'in_progress' | 'completed'
  approval_status?: ApprovalStatus
  approved_at?: string | null
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  project_id: string
  chapter_number: number
  title: string
  content: string
  word_count: number
  status: 'pending' | 'in_progress' | 'completed'
  approval_status?: ApprovalStatus
  approved_at?: string | null
  revision_count?: number
  created_at: string
  updated_at: string
}

export interface ChapterFeedback {
  id: string
  project_id: string
  chapter_id: string | null
  stage_number: number | null
  feedback_text: string
  attachments: Array<{ kind: 'image' | 'audio' | 'file'; url?: string; name: string }>
  audio_transcript: string | null
  before_content: string | null
  after_content: string | null
  created_at: string
}

export interface LecturerFeedback {
  id: string
  project_id: string
  chapter_id: string | null
  feedback_text: string
  ai_response: string
  created_at: string
}

export interface TopicSuggestion {
  title: string
  description: string
  rationale: string
  keywords: string[]
}

export interface ProjectStructure {
  chapters: {
    number: number
    title: string
    sections: string[]
    description: string
  }[]
  estimated_pages: number
}

export interface DefenseQA {
  question: string
  suggested_answer: string
  category: 'methodology' | 'literature' | 'findings' | 'contribution' | 'general'
}
