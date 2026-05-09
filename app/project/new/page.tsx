'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Brain, ArrowLeft, Sparkles, ArrowRight, Loader2, CheckCircle,
  AlertCircle, BookmarkPlus, ExternalLink, FileText,
} from 'lucide-react'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'

const DEPARTMENTS = ['Accounting', 'Banking & Finance', 'Business Administration', 'Computer Science', 'Electrical Engineering', 'Economics', 'Education', 'English', 'Mass Communication', 'Medicine', 'Nursing', 'Political Science', 'Psychology', 'Public Administration', 'Sociology', 'Other']
const LEVELS = ['300 Level', '400 Level', '500 Level', 'PGD', 'M.Sc', 'MBA', 'Ph.D']

type Step = 'info' | 'loading' | 'topics'

interface Topic {
  title: string
  description: string
  rationale: string
  keywords?: string[]
}
interface Citation { url: string; title?: string }

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
  const [department, setDepartment] = useState('')
  const [field, setField] = useState('')
  const [level, setLevel] = useState('')
  const [interests, setInterests] = useState('')

  // NEW Phase-1 fields
  const [lecturerToc, setLecturerToc] = useState('')
  const [lecturerNotes, setLecturerNotes] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [topics, setTopics] = useState<Topic[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [grounded, setGrounded] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [customTopic, setCustomTopic] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [savingAll, setSavingAll] = useState(false)
  const [savedAll, setSavedAll] = useState(false)

  async function discoverTopics() {
    if (!department || !level) { setError('Please select your department and level.'); return }
    setError(''); setStep('loading'); setSavedAll(false)
    try {
      const res = await fetch('/api/ai/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department, field, level, interests }),
      })
      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('application/json')) {
        throw new Error('Server returned non-JSON. Please retry.')
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate topics')
      setTopics(data.topics)
      setCitations(data.citations ?? [])
      setGrounded(!!data.grounded)
      setStep('topics')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('info')
    }
  }

  async function createProject(overrideTopic?: string) {
    const title = overrideTopic ?? selectedTopic ?? customTopic
    if (!title) { setError('Please select or enter a topic.'); return }
    setCreating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error: dbError } = await supabase
      .from('pp_projects')
      .insert({
        user_id: user.id, title, department, field, level,
        stage: 1, stage_name: 'topic_discovery', topic: title,
        lecturer_toc: lecturerToc || null,
        lecturer_notes: lecturerNotes || null,
        interests: interests || null,
      })
      .select()
      .single()

    if (dbError) { setError(dbError.message); setCreating(false); return }
    router.push(`/project/${data.id}`)
  }

  async function saveAllForSupervisor() {
    if (topics.length === 0) return
    setSavingAll(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const rows = topics.map(t => ({
        user_id: user.id,
        title: t.title,
        description: t.description,
        rationale: t.rationale,
        department, field: field || null, level,
        source: grounded ? 'perplexity' : 'ai',
        citations: citations as unknown as object,
        status: 'pending',
      }))
      const { error: dbError } = await supabase.from('pp_saved_topics').insert(rows)
      if (dbError) throw new Error(dbError.message)
      setSavedAll(true)
      setTimeout(() => setSavedAll(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save topics')
    } finally {
      setSavingAll(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      <div className="blob blob-1 w-[400px] h-[400px] top-0 -right-32 opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
      <div className="blob blob-2 w-[300px] h-[300px] bottom-0 -left-20 opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />

      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'rgba(6,6,11,0.8)', backdropFilter: 'blur(20px)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#fff' }}>
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

      <main className="relative z-10 max-w-xl mx-auto px-6 py-12">

        {/* ── Step: Info ────────────────────── */}
        {step === 'info' && (
          <div className="anim-entrance">
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                <Sparkles size={11} color="#fff" /> Topic Discovery — Free
              </div>
              <h1 className="text-2xl font-bold mb-1.5">Start Your Project</h1>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Tell us about your program. We&apos;ll pull current research from Perplexity and suggest 5 supervisor-ready topics.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Department *
                </label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Specific Field <span style={{ color: 'var(--foreground-dim)' }}>(optional)</span>
                </label>
                <input value={field} onChange={e => setField(e.target.value)}
                  placeholder="e.g. Fintech, Public Health, Digital Marketing"
                  className="input-field" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Academic Level *
                </label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Research Interests <span style={{ color: 'var(--foreground-dim)' }}>(optional)</span>
                </label>
                <textarea value={interests} onChange={e => setInterests(e.target.value)}
                  placeholder="e.g. I'm interested in how mobile money affects rural communities..."
                  rows={3} className="input-field resize-none" />
              </div>

              {/* Advanced: lecturer-provided info */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors w-fit"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <FileText size={11} color="#fff" />
                {showAdvanced ? 'Hide' : 'Add'} info from your supervisor (optional)
              </button>

              {showAdvanced && (
                <div className="flex flex-col gap-4 anim-entrance-sm p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                      Lecturer&apos;s Table of Contents
                    </label>
                    <textarea value={lecturerToc} onChange={e => setLecturerToc(e.target.value)}
                      placeholder={'Paste any chapter outline or TOC your supervisor gave you. Example:\n\nCh 1: Introduction\n  1.1 Background\n  1.2 Statement of the Problem\nCh 2: Literature Review\n  ...'}
                      rows={6} className="input-field resize-none text-xs leading-relaxed" />
                    <p className="text-[11px]" style={{ color: 'var(--foreground-dim)' }}>
                      AI will follow this exact structure when building your project.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                      Other Notes from Supervisor
                    </label>
                    <textarea value={lecturerNotes} onChange={e => setLecturerNotes(e.target.value)}
                      placeholder="Any extra requirements: methodology, sample size, citation style, etc."
                      rows={3} className="input-field resize-none text-xs leading-relaxed" />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm anim-entrance-sm"
                  style={{ background: 'var(--error-subtle)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  <AlertCircle size={14} className="flex-shrink-0" color="#fca5a5" /> {error}
                </div>
              )}

              <button onClick={discoverTopics}
                className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 press">
                <Sparkles size={14} color="#fff" /> Discover Topics
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--foreground-dim)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  I Already Have a Topic
                </label>
                <div className="flex gap-2">
                  <input value={customTopic} onChange={e => setCustomTopic(e.target.value)}
                    placeholder="Enter your project title…"
                    className="input-field flex-1" />
                  <button
                    onClick={() => createProject(customTopic)}
                    disabled={!customTopic || creating}
                    className="btn-ghost px-4 rounded-xl text-sm font-medium press disabled:opacity-40 whitespace-nowrap">
                    {creating ? <Loader2 size={14} className="animate-spin" color="#fff" /> : 'Use This'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Loading ────────────────── */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-28 text-center anim-scale">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#fff' }}>
                <Sparkles size={24} color="#000" strokeWidth={1.8} />
              </div>
              <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                style={{ background: '#fff', animationDuration: '1.5s' }} />
            </div>
            <h2 className="text-lg font-semibold mb-2">Researching current trends…</h2>
            <p className="text-sm max-w-xs" style={{ color: 'var(--foreground-muted)' }}>
              Pulling fresh sources from Perplexity, then crafting topics with Claude.
            </p>
            <div className="thinking-dots flex gap-1.5 mt-4">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* ── Step: Topics ─────────────────── */}
        {step === 'topics' && (
          <div className="anim-entrance">
            <div className="mb-6">
              <button onClick={() => setStep('info')}
                className="flex items-center gap-1.5 text-xs mb-5 transition-colors hover:text-white"
                style={{ color: 'var(--foreground-muted)' }}>
                <ArrowLeft size={12} color="#fff" /> Back
              </button>
              <h1 className="text-2xl font-bold mb-1.5">Choose Your Topic</h1>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                AI-generated topics tailored to {department}
                {grounded && <span className="ml-1.5">· grounded with current research</span>}
              </p>
            </div>

            {/* Save all CTA */}
            <div className="mb-5 flex items-center gap-3">
              <button
                onClick={saveAllForSupervisor}
                disabled={savingAll}
                className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium press"
              >
                {savingAll ? <Loader2 size={11} className="animate-spin" color="#fff" /> : <BookmarkPlus size={11} color="#fff" />}
                {savedAll ? 'Saved ✓' : 'Save all for supervisor'}
              </button>
              <button
                onClick={discoverTopics}
                disabled={savingAll}
                className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium press"
              >
                <Sparkles size={11} color="#fff" /> Regenerate
              </button>
            </div>
            {savedAll && (
              <p className="text-[11px] mb-4 anim-entrance-sm" style={{ color: 'var(--foreground-muted)' }}>
                All topics saved. View them anytime from <Link href="/saved-topics" className="underline">Saved Topics</Link> on your dashboard.
              </p>
            )}

            <div className="flex flex-col gap-3 mb-5">
              {topics.map((topic, i) => {
                const isSelected = selectedTopic === topic.title
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedTopic(topic.title)}
                    className="text-left p-4 rounded-2xl border transition-all duration-200 press anim-entrance"
                    style={{
                      animationDelay: `${i * 0.07}s`,
                      background: isSelected ? 'rgba(255,255,255,0.06)' : 'var(--surface)',
                      borderColor: isSelected ? 'rgba(255,255,255,0.4)' : 'var(--border)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{ borderColor: isSelected ? '#fff' : 'var(--foreground-dim)' }}>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#fff' }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm leading-snug mb-1.5">{topic.title}</p>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--foreground-muted)' }}>
                          {topic.description}
                        </p>
                        {topic.rationale && (
                          <p className="text-[11px] italic" style={{ color: 'var(--foreground-dim)' }}>
                            {topic.rationale}
                          </p>
                        )}
                      </div>
                      {isSelected && <CheckCircle size={15} color="#fff" style={{ flexShrink: 0 }} />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Citations from Perplexity */}
            {citations.length > 0 && (
              <div className="mb-5 anim-entrance-sm">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--foreground-dim)' }}>
                  Research Sources
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {citations.slice(0, 8).map((c, i) => (
                    <a
                      key={i}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors hover:bg-white/8 truncate max-w-[200px]"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}
                    >
                      <ExternalLink size={9} color="#fff" />
                      <span className="truncate">{c.title || new URL(c.url).hostname}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4 anim-entrance-sm"
                style={{ background: 'var(--error-subtle)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                <AlertCircle size={14} color="#fca5a5" /> {error}
              </div>
            )}

            <button
              onClick={() => createProject()}
              disabled={!selectedTopic || creating}
              className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 press disabled:opacity-40">
              {creating ? (
                <><Loader2 size={14} className="animate-spin" color="#fff" /> Creating project…</>
              ) : (
                <><Brain size={14} color="#fff" /> Start With This Topic <ArrowRight size={14} color="#fff" /></>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
