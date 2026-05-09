'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const DEPARTMENTS = ['Accounting', 'Banking & Finance', 'Business Administration', 'Computer Science', 'Electrical Engineering', 'Economics', 'Education', 'English', 'Mass Communication', 'Medicine', 'Nursing', 'Political Science', 'Psychology', 'Public Administration', 'Sociology', 'Other']
const LEVELS = ['300 Level', '400 Level', '500 Level', 'PGD', 'M.Sc', 'MBA', 'Ph.D']

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'topics' | 'loading'>('info')
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
    if (!department || !level) {
      setError('Please fill in your department and level.')
      return
    }
    setError('')
    setStep('loading')
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

  async function createProject() {
    const title = selectedTopic ?? customTopic
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
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <span className="text-white text-sm font-bold">PP</span>
          </div>
          <span className="font-semibold">Project Partner</span>
        </Link>
        <Link href="/dashboard" className="text-sm" style={{ color: 'var(--muted-foreground)' }}>← Back</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {step === 'info' && (
          <>
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs mb-4" style={{ background: '#7c3aed20', color: '#a78bfa' }}>
                ✨ Topic Discovery — Free
              </div>
              <h1 className="text-3xl font-bold mb-2">Start Your Project</h1>
              <p style={{ color: 'var(--muted-foreground)' }}>Tell us about your program and we&apos;ll suggest research-worthy topics.</p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Department *</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)', color: department ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                >
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Specific Field / Concentration <span style={{ color: 'var(--muted-foreground)' }}>(optional)</span></label>
                <input
                  value={field}
                  onChange={e => setField(e.target.value)}
                  placeholder="e.g. Fintech, Public Health, Digital Marketing"
                  className="px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Academic Level *</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)', color: level ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                >
                  <option value="">Select your level</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Research Interests <span style={{ color: 'var(--muted-foreground)' }}>(optional)</span></label>
                <textarea
                  value={interests}
                  onChange={e => setInterests(e.target.value)}
                  placeholder="e.g. I'm interested in how mobile money affects rural communities..."
                  rows={3}
                  className="px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              {error && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#ef444420', color: '#f87171' }}>{error}</div>}

              <button
                onClick={discoverTopics}
                className="py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--primary)' }}
              >
                Discover Topics ✨
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">I Already Have a Topic</label>
                <div className="flex gap-2">
                  <input
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    placeholder="Enter your project title..."
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                  <button
                    onClick={() => { setSelectedTopic(null); createProject() }}
                    disabled={!customTopic || creating}
                    className="px-4 py-3 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    {creating ? '...' : 'Use This'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 animate-pulse" style={{ background: 'var(--primary)' }}>
              <span className="text-white text-2xl">✨</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Generating Topics...</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>AI is finding research-worthy topics for your program.</p>
          </div>
        )}

        {step === 'topics' && (
          <>
            <div className="mb-8">
              <button onClick={() => setStep('info')} className="text-sm mb-4 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                ← Back
              </button>
              <h1 className="text-3xl font-bold mb-2">Choose Your Topic</h1>
              <p style={{ color: 'var(--muted-foreground)' }}>AI-generated topics tailored to your {department} program.</p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {topics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTopic(topic.title)}
                  className="text-left p-4 rounded-2xl border transition-all"
                  style={{
                    background: selectedTopic === topic.title ? '#7c3aed15' : 'var(--card)',
                    borderColor: selectedTopic === topic.title ? '#7c3aed' : 'var(--border)',
                  }}
                >
                  <p className="font-medium mb-1 text-sm leading-snug">{topic.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{topic.description}</p>
                </button>
              ))}
            </div>

            {error && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ background: '#ef444420', color: '#f87171' }}>{error}</div>}

            <button
              onClick={createProject}
              disabled={!selectedTopic || creating}
              className="w-full py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--primary)' }}
            >
              {creating ? 'Creating project...' : 'Start With This Topic →'}
            </button>
          </>
        )}
      </main>
    </div>
  )
}
