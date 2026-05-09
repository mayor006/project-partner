import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { STAGES, getProgressPercent } from '@/lib/utils'
import type { Project, Chapter, ProjectStageData } from '@/types'
import StageContent from './StageContent'
import { Brain, ArrowLeft, CheckCircle, Circle, Loader } from 'lucide-react'
import { AppShell } from '@/components/ui/app-shell'

async function getProjectData(id: string, userId: string) {
  const supabase = await createClient()
  const [{ data: project }, { data: stages }, { data: chapters }] = await Promise.all([
    supabase.from('pp_projects').select('*').eq('id', id).eq('user_id', userId).single(),
    supabase.from('pp_project_stages').select('*').eq('project_id', id).order('stage_number'),
    supabase.from('pp_chapters').select('*').eq('project_id', id).order('chapter_number'),
  ])
  return {
    project: project as Project | null,
    stages: (stages ?? []) as ProjectStageData[],
    chapters: (chapters ?? []) as Chapter[],
  }
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

  /* ── Sidebar (shared between desktop + mobile drawer) ── */
  const sidebar = (
    <>
      {/* Logo + back */}
      <div className="px-4 py-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#fff' }}>
            <Brain size={12} color="#000" strokeWidth={2.2} />
          </div>
          <span className="font-semibold text-sm">Project Partner</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5 w-fit"
          style={{ color: 'var(--foreground-muted)' }}
        >
          <ArrowLeft size={12} color="#fff" />
          Dashboard
        </Link>
      </div>

      {/* Project info */}
      <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <p className="font-semibold text-sm leading-snug mb-2 line-clamp-3">
          {project.title}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.department && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}
            >
              {project.department}
            </span>
          )}
          {project.level && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}
            >
              {project.level}
            </span>
          )}
        </div>
        <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className={`progress-bar-fill ${isComplete ? 'complete' : ''}`} style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[10px]" style={{ color: 'var(--foreground-dim)' }}>
          {isComplete ? 'Project Complete ✓' : `Stage ${Math.min(project.stage, 5)} of 5 · ${progress}%`}
        </p>
      </div>

      {/* Stage navigator */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--foreground-dim)' }}>
          Stages
        </p>
        <div className="flex flex-col gap-0.5">
          {STAGES.map(stage => {
            const isDone = project.stage > stage.number
            const isCurrent = project.stage === stage.number
            return (
              <div
                key={stage.number}
                className="stage-pill"
                style={{
                  background: isDone
                    ? 'rgba(255,255,255,0.08)'
                    : isCurrent
                    ? 'rgba(255,255,255,0.12)'
                    : 'transparent',
                  color: isDone || isCurrent ? '#fff' : 'rgba(255,255,255,0.35)',
                }}
              >
                {isDone ? (
                  <CheckCircle size={13} color="#fff" />
                ) : isCurrent ? (
                  <Loader size={13} className="animate-spin" color="#fff" />
                ) : (
                  <Circle size={13} color="rgba(255,255,255,0.35)" />
                )}
                <span className="text-[12px] font-medium">{stage.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

  return (
    <AppShell sidebar={sidebar} mobileTitle={project.title}>
      {/* Ambient blob */}
      <div
        className="blob blob-1 w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] top-20 -right-20 opacity-[0.06] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #7c3aed, transparent 70%)',
          position: 'absolute', zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <StageContent project={project} stages={stages} chapters={chapters} />
      </div>
    </AppShell>
  )
}
