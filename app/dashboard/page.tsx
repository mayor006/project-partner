import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getProgressPercent, STAGES } from '@/lib/utils'
import type { Project } from '@/types'
import {
  Brain, Plus, LogOut, FolderOpen, ChevronRight, Sparkles, Bookmark,
} from 'lucide-react'
import { AppShell } from '@/components/ui/app-shell'

async function getProjects(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pp_projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  return (data ?? []) as Project[]
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projects = await getProjects(user.id)
  const name = user.user_metadata?.full_name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  /* ── Sidebar content (shared between desktop + mobile drawer) ── */
  const sidebar = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#fff' }}>
            <Brain size={14} color="#000" strokeWidth={2.2} />
          </div>
          <span className="font-semibold text-sm tracking-tight">Project Partner</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
        >
          <FolderOpen size={14} color="#fff" />
          Dashboard
        </Link>

        <Link
          href="/saved-topics"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors hover:bg-white/5"
          style={{ color: 'var(--foreground-muted)' }}
        >
          <Bookmark size={14} color="#fff" />
          Saved Topics
        </Link>

        {projects.length > 0 && (
          <div className="mt-4">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--foreground-dim)' }}>
              Projects
            </p>
            <div className="flex flex-col gap-0.5">
              {projects.slice(0, 8).map(p => (
                <Link
                  key={p.id}
                  href={`/project/${p.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors hover:bg-white/5 group"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: p.stage >= 6 ? '#fff' : 'rgba(255,255,255,0.5)' }}
                  />
                  <span className="truncate flex-1">{p.title}</span>
                  <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User area */}
      <div className="px-3 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5 mb-3 px-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: '#fff', color: '#000' }}
          >
            {name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{name}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--foreground-dim)' }}>
              {user.email}
            </p>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
            style={{ color: 'var(--foreground-dim)' }}
          >
            <LogOut size={12} />
            Sign out
          </button>
        </form>
      </div>
    </>
  )

  return (
    <AppShell sidebar={sidebar}>
      {/* Ambient blob */}
      <div
        className="blob blob-2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] -top-20 right-0 opacity-[0.05] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #7c3aed, transparent 70%)',
          position: 'absolute', zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Greeting */}
        <div className="mb-8 sm:mb-10 anim-entrance">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--foreground-dim)' }}>
            {greeting},
          </p>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
            <span>{name}</span>
            <span className="text-base sm:text-lg">👋</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            What would you like to work on today?
          </p>
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-5 anim-entrance stagger-1">
          <h2 className="text-xs sm:text-sm font-semibold tracking-wide flex-1 min-w-0 truncate" style={{ color: 'var(--foreground-muted)' }}>
            YOUR PROJECTS
          </h2>
          <Link
            href="/project/new"
            className="btn-primary flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold press flex-shrink-0"
          >
            <Plus size={13} color="#fff" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>

        {/* Empty state */}
        {projects.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center rounded-3xl anim-entrance stagger-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Sparkles size={22} color="#fff" strokeWidth={1.6} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-sm mb-7 max-w-xs" style={{ color: 'var(--foreground-muted)' }}>
              Start your first project and let AI guide you from topic to defense.
            </p>
            <Link
              href="/project/new"
              className="btn-primary px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
            >
              <Sparkles size={13} color="#fff" />
              Start a Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project, i) => {
              const progress = getProgressPercent(project.stage)
              const isComplete = project.stage >= 6
              const currentStage = STAGES.find(s => s.number === project.stage)
              const stageLabel = isComplete ? 'Complete' : (currentStage?.label ?? 'In Progress')

              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="glass group flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl transition-all duration-200 hover:bg-white/5 hover:border-white/12 anim-entrance w-full max-w-full overflow-hidden"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {/* Stage indicator */}
                  <div
                    className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{
                      background: isComplete ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                    }}
                  >
                    {isComplete ? '✓' : project.stage}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1.5 truncate">{project.title}</p>
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span
                        className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}
                      >
                        {stageLabel}
                      </span>
                      {project.department && (
                        <span className="text-[10px] sm:text-[11px] truncate max-w-[120px] sm:max-w-none" style={{ color: 'var(--foreground-dim)' }}>
                          {project.department}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-[11px] hidden sm:inline" style={{ color: 'var(--foreground-dim)' }}>
                        · {formatDate(project.updated_at)}
                      </span>
                    </div>
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <div
                        className={`progress-bar-fill ${isComplete ? 'complete' : ''}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: 'var(--foreground-dim)' }}
                  />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
