import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { STAGES, getProgressPercent } from '@/lib/utils'
import type { Project, Chapter, ProjectStageData } from '@/types'
import StageContent from './StageContent'

async function getProjectData(id: string, userId: string) {
  const supabase = await createClient()
  const [{ data: project }, { data: stages }, { data: chapters }] = await Promise.all([
    supabase.from('pp_projects').select('*').eq('id', id).eq('user_id', userId).single(),
    supabase.from('pp_project_stages').select('*').eq('project_id', id).order('stage_number'),
    supabase.from('pp_chapters').select('*').eq('project_id', id).order('chapter_number'),
  ])
  return { project: project as Project | null, stages: (stages ?? []) as ProjectStageData[], chapters: (chapters ?? []) as Chapter[] }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { project, stages, chapters } = await getProjectData(id, user.id)
  if (!project) notFound()

  const progress = getProgressPercent(project.stage)
  const isComplete = project.stage >= 6

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <span className="text-white text-sm font-bold">PP</span>
          </div>
          <span className="font-semibold">Project Partner</span>
        </Link>
        <Link href="/dashboard" className="text-sm" style={{ color: 'var(--muted-foreground)' }}>← Dashboard</Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Project Title + Progress */}
        <div className="mb-8">
          <h1 className="text-xl font-bold leading-snug mb-4">{project.title}</h1>
          <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {project.department && <span className="px-2 py-1 rounded-full" style={{ background: 'var(--muted)' }}>{project.department}</span>}
            {project.level && <span className="px-2 py-1 rounded-full" style={{ background: 'var(--muted)' }}>{project.level}</span>}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: isComplete ? '#22c55e' : 'var(--primary)' }} />
          </div>
          <div className="flex justify-between mt-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span>Stage {Math.min(project.stage, 5)}/5</span>
            <span style={{ color: isComplete ? '#22c55e' : 'var(--primary)' }}>{progress}% complete</span>
          </div>
        </div>

        {/* Stage Tracker */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STAGES.map((stage, i) => {
            const isDone = project.stage > stage.number
            const isCurrent = project.stage === stage.number
            return (
              <div key={stage.number} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium" style={{
                  background: isDone ? '#22c55e20' : isCurrent ? '#7c3aed20' : 'var(--muted)',
                  color: isDone ? '#22c55e' : isCurrent ? '#a78bfa' : 'var(--muted-foreground)',
                  border: `1px solid ${isDone ? '#22c55e40' : isCurrent ? '#7c3aed40' : 'transparent'}`,
                }}>
                  <span>{isDone ? '✓' : stage.number}</span>
                  <span className="hidden sm:block">{stage.label}</span>
                </div>
                {i < STAGES.length - 1 && (
                  <div className="w-4 h-px flex-shrink-0" style={{ background: isDone ? '#22c55e40' : 'var(--border)' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Stage Content (client component) */}
        <StageContent project={project} stages={stages} chapters={chapters} />
      </main>
    </div>
  )
}
