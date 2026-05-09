import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getProgressPercent, STAGES } from '@/lib/utils'
import type { Project } from '@/types'

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <span className="text-white text-sm font-bold">PP</span>
          </div>
          <span className="font-semibold">Project Partner</span>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="text-sm px-4 py-2 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)', background: 'var(--muted)' }}>
            Sign Out
          </button>
        </form>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">Hello, {name} 👋</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>What would you like to work on today?</p>
        </div>

        {/* New Project Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Your Projects</h2>
          <Link
            href="/project/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)' }}
          >
            <span>+</span> New Project
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Start your first project and let AI guide you from topic to defense.
            </p>
            <Link href="/project/new" className="px-6 py-3 rounded-xl font-semibold text-white" style={{ background: 'var(--primary)' }}>
              Start a Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => {
              const currentStage = STAGES.find(s => s.number === project.stage) ?? STAGES[0]
              const progress = getProgressPercent(project.stage)
              const isComplete = project.stage >= 6

              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="block p-5 rounded-2xl border transition-all hover:border-violet-500/40"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">{project.title}</h3>
                      <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--muted)' }}>
                          {isComplete ? 'Defense Prep' : currentStage.label}
                        </span>
                        {project.department && <span>{project.department}</span>}
                        <span>Updated {formatDate(project.updated_at)}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, background: isComplete ? '#22c55e' : 'var(--primary)' }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Stage {Math.min(project.stage, 5)}/5
                        </span>
                        <span className="text-xs font-medium" style={{ color: isComplete ? '#22c55e' : 'var(--primary)' }}>
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xl">→</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
