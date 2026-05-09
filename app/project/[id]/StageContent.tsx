'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project, Chapter, ProjectStageData, ProjectStructure, DefenseQA } from '@/types'

interface Props {
  project: Project
  stages: ProjectStageData[]
  chapters: Chapter[]
}

export default function StageContent({ project, stages, chapters }: Props) {
  const router = useRouter()
  const stage = project.stage

  async function advanceStage(newStage: number, newStageName: string) {
    const supabase = createClient()
    await supabase.from('pp_projects').update({ stage: newStage, stage_name: newStageName, updated_at: new Date().toISOString() }).eq('id', project.id)
    router.refresh()
  }

  if (stage === 1) return <Stage1TopicDiscovery project={project} advance={() => advanceStage(2, 'project_structure')} />
  if (stage === 2) return <Stage2Structure project={project} advance={() => advanceStage(3, 'chapter_writing')} />
  if (stage === 3) return <Stage3Chapters project={project} chapters={chapters} advance={() => advanceStage(4, 'lecturer_feedback')} />
  if (stage === 4) return <Stage4Feedback project={project} chapters={chapters} advance={() => advanceStage(5, 'defense_prep')} />
  if (stage >= 5) return <Stage5Defense project={project} stages={stages} />
  return null
}

/* ──────────────────────────────────────────────
   Stage 1: Topic Discovery
────────────────────────────────────────────── */
function Stage1TopicDiscovery({ project, advance }: { project: Project; advance: () => void }) {
  return (
    <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: '#eab30820' }}>💡</div>
        <div>
          <h2 className="font-semibold">Topic Discovery</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Your topic has been selected</p>
        </div>
      </div>
      <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--muted)' }}>
        <p className="text-sm font-medium leading-relaxed">{project.topic ?? project.title}</p>
        {project.department && <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{project.department} · {project.level}</p>}
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
        Great choice! Next we&apos;ll build a full chapter structure and outline for your project.
      </p>
      <button onClick={advance} className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-90" style={{ background: 'var(--primary)' }}>
        Build Project Structure →
      </button>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Stage 2: Project Structure
────────────────────────────────────────────── */
function Stage2Structure({ project, advance }: { project: Project; advance: () => void }) {
  const [loading, setLoading] = useState(false)
  const [structure, setStructure] = useState<ProjectStructure | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function generate() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/ai/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: project.title, department: project.department, field: project.field, level: project.level }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStructure(data.structure)

      // Save to DB
      const supabase = createClient()
      await supabase.from('pp_project_stages').upsert({
        project_id: project.id, stage_number: 2, stage_name: 'project_structure',
        content: { structure: data.structure }, status: 'completed',
      }, { onConflict: 'project_id,stage_number' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate structure')
    } finally { setLoading(false) }
  }

  async function confirmAndAdvance() {
    await advance()
    router.refresh()
  }

  return (
    <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: '#3b82f620' }}>📋</div>
        <div>
          <h2 className="font-semibold">Project Structure</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>AI builds your chapter outline</p>
        </div>
      </div>

      {!structure && !loading && (
        <>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            We&apos;ll generate a full chapter-by-chapter outline with sections, objectives, and methodology tailored to your topic.
          </p>
          {error && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ background: '#ef444420', color: '#f87171' }}>{error}</div>}
          <button onClick={generate} className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-90" style={{ background: 'var(--primary)' }}>
            ✨ Generate Structure
          </button>
        </>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 animate-pulse" style={{ background: 'var(--primary)' }}>
            <span className="text-white">📋</span>
          </div>
          <p className="font-medium">Building your structure...</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>This takes about 20 seconds</p>
        </div>
      )}

      {structure && (
        <>
          <div className="flex flex-col gap-3 mb-6">
            {structure.chapters.map((ch) => (
              <div key={ch.number} className="p-4 rounded-xl border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                <p className="font-medium text-sm mb-1">Chapter {ch.number}: {ch.title}</p>
                <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{ch.description}</p>
                <div className="flex flex-wrap gap-1">
                  {ch.sections.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Estimated: ~{structure.estimated_pages} pages
          </p>
          <div className="flex gap-3">
            <button onClick={generate} className="flex-1 py-3 rounded-xl font-medium border transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              Regenerate
            </button>
            <button onClick={confirmAndAdvance} className="flex-1 py-3 rounded-xl font-semibold text-white hover:opacity-90" style={{ background: 'var(--primary)' }}>
              Approve & Write Chapters →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────
   Stage 3: Chapter Writing
────────────────────────────────────────────── */
function Stage3Chapters({ project, chapters: initialChapters, advance }: { project: Project; chapters: Chapter[]; advance: () => void }) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const [writing, setWriting] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const chapterTitles = [
    'Introduction',
    'Literature Review',
    'Research Methodology',
    'Data Presentation and Analysis',
    'Summary, Conclusion and Recommendations',
  ]

  async function writeChapter(chapterNum: number) {
    setWriting(chapterNum); setError('')
    try {
      const res = await fetch('/api/ai/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: project.title,
          department: project.department,
          level: project.level,
          chapterNumber: chapterNum,
          chapterTitle: chapterTitles[chapterNum - 1],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const supabase = createClient()
      const wordCount = data.content.split(/\s+/).length
      const { data: saved } = await supabase.from('pp_chapters').upsert({
        project_id: project.id, chapter_number: chapterNum,
        title: chapterTitles[chapterNum - 1], content: data.content,
        word_count: wordCount, status: 'completed',
      }, { onConflict: 'project_id,chapter_number' }).select().single()

      if (saved) setChapters(prev => {
        const filtered = prev.filter(c => c.chapter_number !== chapterNum)
        return [...filtered, saved as Chapter].sort((a, b) => a.chapter_number - b.chapter_number)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write chapter')
    } finally { setWriting(null) }
  }

  const allDone = chapterTitles.every((_, i) => chapters.find(c => c.chapter_number === i + 1 && c.status === 'completed'))

  return (
    <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: '#22c55e20' }}>📝</div>
        <div>
          <h2 className="font-semibold">Chapter Writing</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>AI writes each chapter — 65–80 pages total</p>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ background: '#ef444420', color: '#f87171' }}>{error}</div>}

      <div className="flex flex-col gap-3 mb-6">
        {chapterTitles.map((title, i) => {
          const chNum = i + 1
          const chapter = chapters.find(c => c.chapter_number === chNum)
          const isDone = chapter?.status === 'completed'
          const isWriting = writing === chNum

          return (
            <div key={chNum} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between p-4" style={{ background: isDone ? '#22c55e08' : 'var(--muted)' }}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: isDone ? '#22c55e' : 'var(--secondary)', color: isDone ? 'white' : 'var(--muted-foreground)' }}>
                    {isDone ? '✓' : chNum}
                  </span>
                  <div>
                    <p className="text-sm font-medium">Chapter {chNum}: {title}</p>
                    {isDone && chapter && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{chapter.word_count.toLocaleString()} words</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDone && (
                    <button onClick={() => setExpanded(expanded === chNum ? null : chNum)} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                      {expanded === chNum ? 'Hide' : 'Preview'}
                    </button>
                  )}
                  {!isDone && !isWriting && (
                    <button onClick={() => writeChapter(chNum)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ background: 'var(--primary)' }}>
                      ✨ Write
                    </button>
                  )}
                  {isWriting && (
                    <span className="text-xs animate-pulse" style={{ color: 'var(--primary)' }}>Writing...</span>
                  )}
                </div>
              </div>
              {expanded === chNum && chapter?.content && (
                <div className="p-4 border-t text-sm leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--background)' }}>
                  {chapter.content}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allDone && (
        <button onClick={() => { advance(); router.refresh() }} className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-90" style={{ background: 'var(--primary)' }}>
          All Chapters Done — Add Lecturer Feedback →
        </button>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────
   Stage 4: Lecturer Feedback
────────────────────────────────────────────── */
function Stage4Feedback({ project, chapters, advance }: { project: Project; chapters: Chapter[]; advance: () => void }) {
  const [feedback, setFeedback] = useState('')
  const [selectedChapter, setSelectedChapter] = useState<string>('general')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function processFeedback() {
    if (!feedback.trim()) return
    setLoading(true); setError(''); setResponse('')
    try {
      const res = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectTitle: project.title, feedback, chapterId: selectedChapter === 'general' ? null : selectedChapter }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResponse(data.response)

      const supabase = createClient()
      await supabase.from('pp_feedback').insert({
        project_id: project.id,
        chapter_id: selectedChapter === 'general' ? null : selectedChapter,
        feedback_text: feedback,
        ai_response: data.response,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: '#f9731620' }}>💬</div>
        <div>
          <h2 className="font-semibold">Lecturer Feedback Loop</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Paste your supervisor&apos;s comments</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Applies to</label>
          <select
            value={selectedChapter}
            onChange={e => setSelectedChapter(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <option value="general">General / Whole Project</option>
            {chapters.map(ch => (
              <option key={ch.id} value={ch.id}>Chapter {ch.chapter_number}: {ch.title}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Lecturer&apos;s Feedback</label>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Paste your supervisor's comments here... e.g. 'Your literature review is too thin. Add more recent sources from 2020-2024 and discuss the research gaps more explicitly.'"
            rows={5}
            className="px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        {error && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#ef444420', color: '#f87171' }}>{error}</div>}

        <button onClick={processFeedback} disabled={!feedback.trim() || loading} className="py-3 rounded-xl font-semibold text-white hover:opacity-90 disabled:opacity-40" style={{ background: 'var(--primary)' }}>
          {loading ? 'Processing...' : '✨ Get AI Revision Plan'}
        </button>
      </div>

      {response && (
        <div className="p-4 rounded-xl border mb-6" style={{ background: 'var(--muted)', borderColor: '#22c55e40' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#22c55e' }}>AI Revision Plan</p>
          <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>{response}</div>
        </div>
      )}

      <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>When you&apos;ve incorporated all feedback, proceed to defense preparation.</p>
        <button onClick={() => { advance(); router.refresh() }} className="w-full py-3 rounded-xl font-semibold border transition-colors hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
          Proceed to Defense Prep →
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Stage 5: Defense Prep
────────────────────────────────────────────── */
function Stage5Defense({ project, stages }: { project: Project; stages: ProjectStageData[] }) {
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<DefenseQA[]>([])
  const [error, setError] = useState('')

  const saved = stages.find(s => s.stage_number === 5)?.content as { questions?: DefenseQA[] } | undefined
  const savedQs = saved?.questions ?? []
  const displayQs = questions.length > 0 ? questions : savedQs

  const categoryColors: Record<string, string> = {
    methodology: '#3b82f6',
    literature: '#8b5cf6',
    findings: '#22c55e',
    contribution: '#eab308',
    general: '#94a3b8',
  }

  async function generate() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/ai/defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: project.title, department: project.department, level: project.level }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setQuestions(data.questions)

      const supabase = createClient()
      await supabase.from('pp_project_stages').upsert({
        project_id: project.id, stage_number: 5, stage_name: 'defense_prep',
        content: { questions: data.questions }, status: 'completed',
      }, { onConflict: 'project_id,stage_number' })
      await supabase.from('pp_projects').update({ stage: 6, stage_name: 'completed', updated_at: new Date().toISOString() }).eq('id', project.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: '#ef444420' }}>🛡️</div>
        <div>
          <h2 className="font-semibold">Defense Preparation</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Likely questions with suggested answers</p>
        </div>
      </div>

      {displayQs.length === 0 && !loading && (
        <>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            We&apos;ll generate the most likely defense questions for your project, with suggested answers, methodology explanations, and key arguments.
          </p>
          {error && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ background: '#ef444420', color: '#f87171' }}>{error}</div>}
          <button onClick={generate} className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-90" style={{ background: 'var(--primary)' }}>
            ✨ Generate Defense Questions
          </button>
        </>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 animate-pulse" style={{ background: '#ef444420' }}>
            <span>🛡️</span>
          </div>
          <p className="font-medium">Preparing your defense...</p>
        </div>
      )}

      {displayQs.length > 0 && (
        <>
          <div className="flex flex-col gap-4 mb-6">
            {displayQs.map((qa, i) => (
              <div key={i} className="p-4 rounded-xl border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: categoryColors[qa.category] ?? '#94a3b8' }}>
                    {i + 1}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${categoryColors[qa.category] ?? '#94a3b8'}20`, color: categoryColors[qa.category] ?? '#94a3b8' }}>
                    {qa.category}
                  </span>
                </div>
                <p className="font-medium text-sm mb-2">{qa.question}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{qa.suggested_answer}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={generate} className="flex-1 py-3 rounded-xl font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              Regenerate
            </button>
          </div>

          {project.stage >= 6 && (
            <div className="mt-6 p-4 rounded-xl text-center" style={{ background: '#22c55e15', border: '1px solid #22c55e40' }}>
              <p className="text-lg mb-1">🎉</p>
              <p className="font-semibold" style={{ color: '#22c55e' }}>Project Complete!</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>You&apos;ve gone from topic to defense. Good luck!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
