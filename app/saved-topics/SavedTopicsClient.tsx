'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Check, X, Trash2, Sparkles, ArrowRight, ExternalLink, Loader2,
  Bookmark, MessageSquare,
} from 'lucide-react'

interface SavedTopic {
  id: string
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

interface Props {
  initial: SavedTopic[]
  grouped: Record<string, SavedTopic[]>
}

export default function SavedTopicsClient({ initial }: Props) {
  const router = useRouter()
  const [topics, setTopics] = useState<SavedTopic[]>(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [noteEditing, setNoteEditing] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  const filterCount = (status: SavedTopic['status']) => topics.filter(t => t.status === status).length

  async function updateStatus(id: string, status: SavedTopic['status']) {
    setBusy(id)
    const supabase = createClient()
    await supabase.from('pp_saved_topics').update({ status }).eq('id', id)
    setTopics(prev => prev.map(t => (t.id === id ? { ...t, status } : t)))
    setBusy(null)
  }

  async function deleteTopic(id: string) {
    if (!confirm('Delete this saved topic?')) return
    setBusy(id)
    const supabase = createClient()
    await supabase.from('pp_saved_topics').delete().eq('id', id)
    setTopics(prev => prev.filter(t => t.id !== id))
    setBusy(null)
  }

  async function saveNote(id: string) {
    setBusy(id)
    const supabase = createClient()
    await supabase.from('pp_saved_topics').update({ supervisor_note: noteDraft }).eq('id', id)
    setTopics(prev => prev.map(t => (t.id === id ? { ...t, supervisor_note: noteDraft } : t)))
    setNoteEditing(null)
    setNoteDraft('')
    setBusy(null)
  }

  async function startProjectFromTopic(topic: SavedTopic) {
    setBusy(topic.id)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('pp_projects')
      .insert({
        user_id: user.id,
        title: topic.title,
        topic: topic.title,
        department: topic.department ?? '',
        field: topic.field ?? '',
        level: topic.level ?? '400 Level',
        stage: 1,
        stage_name: 'topic_discovery',
      })
      .select()
      .single()

    if (error) { alert(error.message); setBusy(null); return }

    // Mark this saved topic as 'used'
    await supabase.from('pp_saved_topics').update({ status: 'used' }).eq('id', topic.id)

    router.push(`/project/${data.id}`)
  }

  const filters: { label: string; status: SavedTopic['status'] | 'all' }[] = [
    { label: `All (${topics.length})`,        status: 'all' },
    { label: `Pending (${filterCount('pending')})`,   status: 'pending' },
    { label: `Approved (${filterCount('approved')})`, status: 'approved' },
    { label: `Rejected (${filterCount('rejected')})`, status: 'rejected' },
    { label: `Used (${filterCount('used')})`,         status: 'used' },
  ]

  const [filter, setFilter] = useState<SavedTopic['status'] | 'all'>('all')
  const visible = filter === 'all' ? topics : topics.filter(t => t.status === filter)

  const statusColor = (s: SavedTopic['status']) => {
    switch (s) {
      case 'approved': return { bg: 'rgba(255,255,255,0.18)', text: '#fff' }
      case 'rejected': return { bg: 'rgba(239,68,68,0.15)', text: '#fca5a5' }
      case 'used':     return { bg: 'rgba(255,255,255,0.08)', text: '#fff' }
      default:         return { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.55)' }
    }
  }

  return (
    <div className="anim-entrance">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => {
          const active = filter === f.status
          return (
            <button
              key={f.status}
              onClick={() => setFilter(f.status)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all press"
              style={{
                background: active ? '#fff' : 'rgba(255,255,255,0.05)',
                color: active ? '#000' : 'var(--foreground-muted)',
                border: active ? 'none' : '1px solid var(--border)',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Topics list */}
      <div className="flex flex-col gap-3">
        {visible.map((t, i) => {
          const sc = statusColor(t.status)
          const isEditing = noteEditing === t.id

          return (
            <div
              key={t.id}
              className="glass rounded-2xl p-5 anim-entrance"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <Bookmark size={14} color="#fff" className="mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug mb-1.5">{t.title}</p>
                  {t.description && (
                    <p className="text-xs leading-relaxed mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                      {t.description}
                    </p>
                  )}
                  {t.rationale && (
                    <p className="text-[11px] italic leading-relaxed" style={{ color: 'var(--foreground-dim)' }}>
                      {t.rationale}
                    </p>
                  )}
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  {t.status}
                </span>
              </div>

              {/* Meta + citations */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {t.department && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--foreground-muted)' }}>
                    {t.department}
                  </span>
                )}
                {t.level && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--foreground-muted)' }}>
                    {t.level}
                  </span>
                )}
                {t.source === 'perplexity' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
                    research-grounded
                  </span>
                )}
                {Array.isArray(t.citations) && t.citations.slice(0, 3).map((c, j) => (
                  <a key={j} href={c.url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors hover:bg-white/8"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--foreground-muted)' }}>
                    <ExternalLink size={9} color="#fff" />
                    {c.title || new URL(c.url).hostname}
                  </a>
                ))}
              </div>

              {/* Supervisor note */}
              {(t.supervisor_note || isEditing) && (
                <div className="mb-3">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={noteDraft}
                        onChange={e => setNoteDraft(e.target.value)}
                        rows={2}
                        placeholder="Note from supervisor (e.g. 'approved on 12 May')"
                        className="input-field text-xs"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveNote(t.id)}
                          className="btn-primary text-xs px-3 py-1.5 rounded-lg press">Save</button>
                        <button onClick={() => { setNoteEditing(null); setNoteDraft('') }}
                          className="btn-ghost text-xs px-3 py-1.5 rounded-lg press">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                      <MessageSquare size={11} color="#fff" className="mt-0.5 flex-shrink-0" />
                      <p className="text-xs italic flex-1" style={{ color: 'var(--foreground-muted)' }}>
                        {t.supervisor_note}
                      </p>
                      <button onClick={() => { setNoteEditing(t.id); setNoteDraft(t.supervisor_note ?? '') }}
                        className="text-[10px] underline" style={{ color: 'var(--foreground-dim)' }}>
                        edit
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {t.status !== 'approved' && t.status !== 'used' && (
                  <button
                    onClick={() => updateStatus(t.id, 'approved')}
                    disabled={busy === t.id}
                    className="btn-ghost text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 press"
                  >
                    <Check size={11} color="#fff" /> Approved
                  </button>
                )}
                {t.status !== 'rejected' && t.status !== 'used' && (
                  <button
                    onClick={() => updateStatus(t.id, 'rejected')}
                    disabled={busy === t.id}
                    className="btn-ghost text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 press"
                  >
                    <X size={11} color="#fff" /> Reject
                  </button>
                )}
                {!t.supervisor_note && !isEditing && (
                  <button
                    onClick={() => { setNoteEditing(t.id); setNoteDraft('') }}
                    className="btn-ghost text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 press"
                  >
                    <MessageSquare size={11} color="#fff" /> Add note
                  </button>
                )}

                <div className="flex-1" />

                <button
                  onClick={() => deleteTopic(t.id)}
                  disabled={busy === t.id}
                  className="btn-ghost text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 press"
                  style={{ color: '#fca5a5' }}
                >
                  <Trash2 size={11} color="#fca5a5" /> Delete
                </button>

                {t.status !== 'used' && (
                  <button
                    onClick={() => startProjectFromTopic(t)}
                    disabled={busy === t.id}
                    className="btn-primary text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 press"
                  >
                    {busy === t.id ? <Loader2 size={11} className="animate-spin" color="#fff" /> : <Sparkles size={11} color="#fff" />}
                    Start Project
                    <ArrowRight size={10} color="#fff" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          No topics with this status.
        </div>
      )}
    </div>
  )
}
