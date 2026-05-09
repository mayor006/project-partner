import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ProjectStage, StageName } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STAGES: { number: ProjectStage; name: StageName; label: string; description: string }[] = [
  { number: 1, name: 'topic_discovery', label: 'Topic Discovery', description: 'Find your perfect research topic' },
  { number: 2, name: 'project_structure', label: 'Project Structure', description: 'Build your chapter outline' },
  { number: 3, name: 'chapter_writing', label: 'Chapter Writing', description: 'AI writes your full chapters' },
  { number: 4, name: 'lecturer_feedback', label: 'Lecturer Feedback', description: 'Incorporate supervisor comments' },
  { number: 5, name: 'defense_prep', label: 'Defense Prep', description: 'Prepare for your presentation' },
]

export function getStageByNumber(stage: ProjectStage) {
  return STAGES.find(s => s.number === stage) ?? STAGES[0]
}

export function getProgressPercent(stage: ProjectStage): number {
  if (stage >= 6) return 100
  return Math.round(((stage - 1) / 5) * 100)
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
