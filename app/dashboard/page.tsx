import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getProgressPercent, STAGES } from '@/lib/utils'
import type { Project } from '@/types'
import { Brain, Plus, LogOut, FolderOpen, ChevronRight, Sparkles } from 'lucide-react'

async function getProjects(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pp_projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  return (data ?? []) as Project[]
}

const stageColors: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', label: 'Topic Discovery' },
  2: { bg: 'rgba(59,130,246,0.12)',  text: '#3b82f6', label: 'Structure' },
  3: { bg: 'rgba(124,58,237,0.12)', text: '#a78bfa', label: 'Chapter Writing' },
  4: { bg: 'rgba(249,115,22,0.12)', text: '#f97316', label: 'Feedback Loop' },
  5: { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e', label: 'Defense Prep' },
  6: { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e', label: 'Complete ✓' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projects = await getProjects(user.id)
  const name = user.user_metadata?.full_name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Ambient blob (behind sidebar) */}
      <div
        className="blob blob-1 w-[300px] h-[300px] -bottom-20 -left-20 opacity-[0.07] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)', position: 'fixed', zIndex: 0 }}
      />

      {/* ── Sidebar ───────────────────────────── */}
      <aside
        className="glass-sidebar w-60 flex-shrink-0 flex flex-col relative z-10"
        style={{ height: '100vh' }}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Project Partner</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Dashboard link (active) */}
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium"
            style={{
              background: 'var(--accent-subtle)',
              color: 'var(--accent-light)',
            }}
          >
            <FolderOpen size={14} />
            Dashboard
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mt-4">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--foreground-dim)' }}>
                Projects
              </p>
              <div className="flex flex-col gap-0.5">
                {projects.slice(0, 6).map(p => (
                  <Link
                    key={p.id}
                    href={`/project/${p.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors hover:bg-white/5 group"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: p.stage >= 6 ? 'var(--success)' : 'var(--accent)' }}
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
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5 mb-3 px-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent-light)' }}
            >
              {name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
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
      </aside>

      {/* ── Main ──────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Ambient blob */}
        <div
          className="blob blob-2 w-[400px] h-[400px] -top-20 right-0 opacity-[0.05] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)', position: 'absolute', zIndex: 0 }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-8 py-10">
          {/* Greeting */}
          <div className="mb-10 anim-entrance">
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--foreground-dim)' }}>
              {greeting},
            </p>
            <h1 className="text-2xl font-bold">{name} 👋</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
              What would you like to work on today?
            </p>
          </div>

          {/* Header row */}
          <div className="flex items-center justify-between mb-5 anim-entrance stagger-1">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>
              YOUR PROJECTS
            </h2>
            <Link
              href="/project/new"
              className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold press"
            >
              <Plus size={13} />
              New Project
            </Link>
          </div>

          {/* Empty state */}
          {projects.length === 0 ? (
            <div
              className="glass flex flex-col items-center justify-center py-20 text-center rounded-3xl anim-entrance stagger-2"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'var(--accent-subtle)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <Sparkles size={22} style={{ color: 'var(--accent-light)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-sm mb-7 max-w-xs" style={{ color: 'var(--foreground-muted)' }}>
                Start your first project and let AI guide you from topic to defense.
              </p>
              <Link
                href="/project/new"
                className="btn-primary px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
              >
                <Sparkles size={13} />
                Start a Project
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map((project, i) => {
                const progress = getProgressPercent(project.stage)
                const isComplete = project.stage >= 6
                const stageInfo = stageColors[project.stage] ?? stageColors[1]
                const currentStage = STAGES.find(s => s.number === project.stage)

                return (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    className="glass group flex items-center gap-5 p-5 rounded-2xl transition-all duration-200 hover:bg-white/5 hover:border-white/12 anim-entrance"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    {/* Stage indicator dot */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ background: stageInfo.bg, color: stageInfo.text }}
                    >
                      {isComplete ? '✓' : project.stage}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1.5 truncate">{project.title}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: stageInfo.bg, color: stageInfo.text }}
                        >
                          {isComplete ? 'Complete' : (currentStage?.label ?? stageInfo.label)}
                        </span>
                        {project.department && (
                          <span className="text-[11px]" style={{ color: 'var(--foreground-dim)' }}>
                            {project.department}
                          </span>
                        )}
                        <span className="text-[11px]" style={{ color: 'var(--foreground-dim)' }}>
                          · {formatDate(project.updated_at)}
                        </span>
                      </div>
                      {/* Progress bar */}
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

                    {/* Arrow */}
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
      </main>
    </div>
  )
}
