import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import {
  Brain, ArrowLeft, Bookmark, ExternalLink, Sparkles,
} from 'lucide-react'
import SavedTopicsClient from './SavedTopicsClient'

interface SavedTopic {
  id: string
  user_id: string
  title: string
  description: string | null
  rationale: string | null
  department: string | null
  field: string | null
  level: string | null
  source: string
  citations: { url: string; title?: string }[]
  status: 'pending' | 'approved' | 'rejected' | 'used'
  supervisor_note: string | null
  created_at: string
}

export default async function SavedTopicsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('pp_saved_topics')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const topics = (data ?? []) as SavedTopic[]

  // Group by created_at date (same generation batch)
  const grouped = topics.reduce<Record<string, SavedTopic[]>>((acc, t) => {
    const day = formatDate(t.created_at)
    ;(acc[day] = acc[day] ?? []).push(t)
    return acc
  }, {})

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      <div className="blob blob-1 w-[400px] h-[400px] top-0 -right-32 opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />

      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'rgba(6,6,11,0.8)', backdropFilter: 'blur(20px)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#fff' }}>
            <Brain size={14} color="#000" strokeWidth={2.2} />
          </div>
          <span className="font-semibold text-sm">Project Partner</span>
        </Link>
        <Link href="/dashboard"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'var(--foreground-muted)' }}>
          <ArrowLeft size={12} color="#fff" /> Dashboard
        </Link>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8 anim-entrance">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
            <Bookmark size={11} color="#fff" /> Saved for supervisor
          </div>
          <h1 className="text-2xl font-bold mb-1.5">Saved Topics</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Topics you saved while exploring. Show them to your supervisor and come back to start the project with whichever they approve.
          </p>
        </div>

        {topics.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-20 text-center rounded-3xl anim-entrance stagger-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Sparkles size={22} color="#fff" strokeWidth={1.6} />
            </div>
            <h3 className="text-base font-semibold mb-2">No saved topics yet</h3>
            <p className="text-sm mb-7 max-w-sm" style={{ color: 'var(--foreground-muted)' }}>
              When you generate topic suggestions, click &quot;Save all for supervisor&quot; to keep them here.
            </p>
            <Link href="/project/new" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold press">
              <Sparkles size={13} color="#fff" /> Generate topics
            </Link>
          </div>
        ) : (
          <SavedTopicsClient initial={topics} grouped={grouped} />
        )}
      </main>
    </div>
  )
}
