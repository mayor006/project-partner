'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Brain, ArrowLeft, Sparkles, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const DEPARTMENTS = ['Accounting', 'Banking & Finance', 'Business Administration', 'Computer Science', 'Electrical Engineering', 'Economics', 'Education', 'English', 'Mass Communication', 'Medicine', 'Nursing', 'Political Science', 'Psychology', 'Public Administration', 'Sociology', 'Other']
const LEVELS = ['300 Level', '400 Level', '500 Level', 'PGD', 'M.Sc', 'MBA', 'Ph.D']

type Step = 'info' | 'loading' | 'topics'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
  const [department, setDepartment] = useState('')
  const [field, setField] = useState('')
  const [level, setLevel] = useState('')
  const [interests, setInterests] = useState('')
  const [topics, setTopics] = useState<{ title: string; description: string; rationale: string }[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [customTopic, setCustomTopic] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  async function discoverTopics() {
    if (!department || !level) { setError('Please select your department and level.'); return }
    setError(''); setStep('loading')
    try {
      const res = await fetch('/api/ai/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department, field, level, interests }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate topics')
      setTopics(data.topics)
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
      .insert({ user_id: user.id, title, department, field, level, stage: 1, stage_name: 'topic_discovery', topic: title })
      .select()
      .single()

    if (dbError) { setError(dbError.message); setCreating(false); return }
    router.push(`/project/${data.id}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Ambient blobs */}
      <div className="blob blob-1 w-[400px] h-[400px] top-0 -right-32 opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
      <div className="blob blob-2 w-[300px] h-[300px] bottom-0 -left-20 opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'rgba(6,6,11,0.8)', backdropFilter: 'blur(20px)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <Brain size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm">Project Partner</span>
        </Link>
        <Link href="/dashboard"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'var(--foreground-muted)' }}>
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </header>

      <main className="relative z-10 max-w-xl mx-auto px-6 py-12">

        {/* ── Step: Info ────────────────────── */}
        {step === 'info' && (
          <div className="anim-entrance">
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                <Sparkles size={11} /> Topic Discovery — Free
              </div>
              <h1 className="text-2xl font-bold mb-1.5">Start Your Project</h1>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Tell us about your program and we&apos;ll suggest research-worthy topics.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Department *
                </label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="input-field">
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
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
                <select value={level} onChange={e => setLevel(e.target.value)} className="input-field">
                  <option value="">Select your level</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Research Interests <span style={{ color: 'var(--foreground-dim)' }}>(optional)</span>
                </label>
                <textarea value={interests} onChange={e => setInterests(e.target.value)}
                  placeholder="e.g. I'm interested in how mobile money affects rural communities..."
                  rows={3} className="input-field resize-none" />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm anim-entrance-sm"
                  style={{ background: 'var(--error-subtle)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  <AlertCircle size={14} className="flex-shrink-0" /> {error}
                </div>
              )}

              <button onClick={discoverTopics}
                className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 press">
                <Sparkles size={14} /> Discover Topics
              </button>

              {/* Divider */}
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
                    {creating ? <Loader2 size={14} className="animate-spin" /> : 'Use This'}
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
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                style={{ background: 'var(--accent)', animationDuration: '1.5s' }} />
            </div>
            <h2 className="text-lg font-semibold mb-2">Finding your topics…</h2>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              AI is generating research-worthy topics for your program.
            </p>
            <div className="thinking-dots flex gap-1.5 mt-4">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--foreground-dim)' }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--foreground-dim)' }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--foreground-dim)' }} />
            </div>
          </div>
        )}

        {/* ── Step: Topics ─────────────────── */}
        {step === 'topics' && (
          <div className="anim-entrance">
            <div className="mb-8">
              <button onClick={() => setStep('info')}
                className="flex items-center gap-1.5 text-xs mb-5 transition-colors hover:text-white"
                style={{ color: 'var(--foreground-muted)' }}>
                <ArrowLeft size={12} /> Back
              </button>
              <h1 className="text-2xl font-bold mb-1.5">Choose Your Topic</h1>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                AI-generated topics tailored to {department}.
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {topics.map((topic, i) => {
                const isSelected = selectedTopic === topic.title
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedTopic(topic.title)}
                    className="text-left p-4 rounded-2xl border transition-all duration-200 press anim-entrance"
                    style={{
                      animationDelay: `${i * 0.07}s`,
                      background: isSelected ? 'rgba(124,58,237,0.1)' : 'var(--surface)',
                      borderColor: isSelected ? 'rgba(124,58,237,0.5)' : 'var(--border)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{ borderColor: isSelected ? 'var(--accent)' : 'var(--foreground-dim)' }}>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm leading-snug mb-1">{topic.title}</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                          {topic.description}
                        </p>
                      </div>
                      {isSelected && <CheckCircle size={15} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />}
                    </div>
                  </button>
                )
              })}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4 anim-entrance-sm"
                style={{ background: 'var(--error-subtle)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button
              onClick={() => createProject()}
              disabled={!selectedTopic || creating}
              className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 press disabled:opacity-40">
              {creating ? (
                <><Loader2 size={14} className="animate-spin" /> Creating project…</>
              ) : (
                <><Brain size={14} /> Start With This Topic <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
