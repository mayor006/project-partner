'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project, Chapter, ProjectStageData, ProjectStructure, DefenseQA } from '@/types'
import { PromptInputBox } from '@/components/ui/ai-prompt-box'
import {
  Sparkles, BookOpen, FileText, MessageSquare, Shield,
  CheckCircle, ChevronDown, ChevronUp, RotateCcw, ArrowRight,
  Loader2, AlertCircle, Brain,
} from 'lucide-react'

interface Props {
  project: Project
  stages: ProjectStageData[]
  chapters: Chapter[]
}

/* ─── AI Message Bubble ──────────────────── */
function AIMessage({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="flex gap-3 anim-entrance" style={{ animationDelay: `${delay}s` }}>
      <div
        className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mt-0.5"
        style={{ background: '#fff' }}
      >
        <Brain size={12} color="#000" strokeWidth={2.2} />
      </div>
      <div className="flex-1 msg-ai rounded-2xl p-4 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  )
}

/* ─── User Message Bubble ────────────────── */
function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end anim-entrance">
      <div
        className="max-w-[80%] msg-user rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={{ color: 'var(--foreground)' }}
      >
        {children}
      </div>
    </div>
  )
}

/* ─── Thinking indicator ─────────────────── */
function Thinking({ label = 'Thinking' }: { label?: string }) {
  return (
    <div className="flex gap-3 anim-fade">
      <div
        className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mt-0.5"
        style={{ background: '#fff' }}
      >
        <Brain size={12} color="#000" strokeWidth={2.2} />
      </div>
      <div className="msg-ai rounded-2xl px-4 py-3 flex items-center gap-2.5">
        <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{label}</span>
        <span className="thinking-dots flex gap-1">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  )
}

/* ─── Stage Header ───────────────────────── */
function StageHeader({
  icon: Icon, label, subtitle,
}: {
  icon: React.ElementType
  label: string
  subtitle: string
  iconColor?: string
  iconBg?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-6 anim-entrance">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Icon size={17} color="#fff" strokeWidth={1.8} />
      </div>
      <div>
        <h2 className="font-semibold text-base">{label}</h2>
        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{subtitle}</p>
      </div>
    </div>
  )
}

/* ─── Error Banner ───────────────────────── */
function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm anim-entrance-sm"
      style={{ background: 'var(--error-subtle)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
    >
      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 text-xs hover:text-white transition-colors ml-2">
          <RotateCcw size={11} /> Retry
        </button>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   Main router
══════════════════════════════════════════ */
export default function StageContent({ project, stages, chapters }: Props) {
  const router = useRouter()

  async function advanceStage(newStage: number, newStageName: string) {
    const supabase = createClient()
    await supabase
      .from('pp_projects')
      .update({ stage: newStage, stage_name: newStageName, updated_at: new Date().toISOString() })
      .eq('id', project.id)
    router.refresh()
  }

  if (project.stage === 1)
    return <Stage1TopicDiscovery project={project} advance={() => advanceStage(2, 'project_structure')} />
  if (project.stage === 2)
    return <Stage2Structure project={project} advance={() => advanceStage(3, 'chapter_writing')} />
  if (project.stage === 3)
    return <Stage3Chapters project={project} chapters={chapters} advance={() => advanceStage(4, 'lecturer_feedback')} />
  if (project.stage === 4)
    return <Stage4Feedback project={project} chapters={chapters} advance={() => advanceStage(5, 'defense_prep')} />
  if (project.stage >= 5)
    return <Stage5Defense project={project} stages={stages} />
  return null
}

/* ══════════════════════════════════════════
   Stage 1 — Topic Discovery
══════════════════════════════════════════ */
function Stage1TopicDiscovery({ project, advance }: { project: Project; advance: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <StageHeader
        icon={Sparkles} label="Topic Discovery"
        subtitle="Stage 1 of 5 — Your topic has been selected"
        iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
      />
      <AIMessage delay={0.1}>
        <p className="font-medium mb-2">Your research topic is ready.</p>
        <div
          className="p-3 rounded-xl mb-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="font-semibold text-sm leading-relaxed">{project.topic ?? project.title}</p>
          {project.department && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--foreground-muted)' }}>
              {project.department} · {project.level}
            </p>
          )}
        </div>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Great choice! Next, I&apos;ll build a full chapter-by-chapter structure and outline tailored to your program.
        </p>
      </AIMessage>
      <button
        onClick={advance}
        className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 press anim-entrance stagger-2"
      >
        <BookOpen size={15} /> Build Project Structure <ArrowRight size={14} />
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════
   Stage 2 — Project Structure
══════════════════════════════════════════ */
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
      const supabase = createClient()
      await supabase.from('pp_project_stages').upsert({
        project_id: project.id, stage_number: 2, stage_name: 'project_structure',
        content: { structure: data.structure }, status: 'completed',
      }, { onConflict: 'project_id,stage_number' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate structure')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col gap-5">
      <StageHeader
        icon={BookOpen} label="Project Structure"
        subtitle="Stage 2 of 5 — Chapter outline generation"
        iconColor="#3b82f6" iconBg="rgba(59,130,246,0.12)"
      />

      {!structure && !loading && (
        <>
          <AIMessage delay={0.1}>
            <p className="mb-1">I&apos;ll generate a full chapter-by-chapter outline with sections, objectives, and methodology tailored to your topic and department.</p>
            <p style={{ color: 'var(--foreground-muted)' }}>This takes about 20–30 seconds. Ready?</p>
          </AIMessage>
          {error && <ErrorBanner message={error} onRetry={generate} />}
          <button onClick={generate} className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 press anim-entrance stagger-2">
            <Sparkles size={14} /> Generate Structure
          </button>
        </>
      )}

      {loading && (
        <>
          <UserMessage>Generate my project structure</UserMessage>
          <Thinking label="Building your chapter outline" />
        </>
      )}

      {structure && !loading && (
        <>
          <UserMessage>Generate my project structure</UserMessage>
          <AIMessage delay={0.1}>
            <p className="font-medium mb-3">
              Here&apos;s your {structure.chapters.length}-chapter structure
              {structure.estimated_pages && ` (~${structure.estimated_pages} pages)`}:
            </p>
            <div className="flex flex-col gap-2">
              {structure.chapters.map((ch, i) => (
                <div key={ch.number} className="p-3 rounded-xl anim-entrance"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 0.05}s` }}>
                  <p className="font-semibold text-xs mb-1" style={{ color: 'var(--accent-light)' }}>Chapter {ch.number}: {ch.title}</p>
                  <p className="text-xs mb-2" style={{ color: 'var(--foreground-muted)' }}>{ch.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {ch.sections.map((s, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--foreground-dim)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AIMessage>
          <div className="flex gap-3 anim-entrance stagger-3">
            <button onClick={generate} className="btn-ghost flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 press">
              <RotateCcw size={13} /> Regenerate
            </button>
            <button onClick={() => { advance(); router.refresh() }}
              className="btn-primary flex-[2] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 press">
              <FileText size={13} /> Approve & Write Chapters <ArrowRight size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   Stage 3 — Chapter Writing
══════════════════════════════════════════ */
function Stage3Chapters({ project, chapters: initialChapters, advance }: { project: Project; chapters: Chapter[]; advance: () => void }) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const [writing, setWriting] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const chapterTitles = ['Introduction', 'Literature Review', 'Research Methodology', 'Data Presentation and Analysis', 'Summary, Conclusion and Recommendations']

  async function writeChapter(chapterNum: number) {
    setWriting(chapterNum); setError('')
    try {
      const res = await fetch('/api/ai/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, title: project.title, department: project.department, level: project.level, chapterNumber: chapterNum, chapterTitle: chapterTitles[chapterNum - 1] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const supabase = createClient()
      const wordCount = data.content.split(/\s+/).length
      const { data: saved } = await supabase.from('pp_chapters').upsert({
        project_id: project.id, chapter_number: chapterNum, title: chapterTitles[chapterNum - 1],
        content: data.content, word_count: wordCount, status: 'completed',
      }, { onConflict: 'project_id,chapter_number' }).select().single()
      if (saved) setChapters(prev => [...prev.filter(c => c.chapter_number !== chapterNum), saved as Chapter].sort((a, b) => a.chapter_number - b.chapter_number))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write chapter')
    } finally { setWriting(null) }
  }

  const allDone = chapterTitles.every((_, i) => chapters.find(c => c.chapter_number === i + 1 && c.status === 'completed'))
  const totalWords = chapters.reduce((sum, c) => sum + (c.word_count ?? 0), 0)

  return (
    <div className="flex flex-col gap-5">
      <StageHeader icon={FileText} label="Chapter Writing"
        subtitle="Stage 3 of 5 — AI writes each chapter individually"
        iconColor="#7c3aed" iconBg="rgba(124,58,237,0.12)" />

      <AIMessage delay={0.1}>
        <p className="mb-2">I&apos;ll write each chapter individually — 3,000–7,000 words each with proper academic structure and citations.</p>
        <p style={{ color: 'var(--foreground-muted)' }}>Write them one at a time. Each takes about 45–60 seconds.</p>
        {totalWords > 0 && (
          <div className="mt-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              {totalWords.toLocaleString()} words written
            </span>
          </div>
        )}
      </AIMessage>

      {error && <ErrorBanner message={error} />}

      <div className="flex flex-col gap-2.5">
        {chapterTitles.map((title, i) => {
          const chNum = i + 1
          const chapter = chapters.find(c => c.chapter_number === chNum)
          const isDone = chapter?.status === 'completed'
          const isWriting = writing === chNum
          const isExpanded = expanded === chNum

          return (
            <div key={chNum} className="glass rounded-2xl overflow-hidden anim-entrance" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={isDone ? { background: '#fff', color: '#000' }
                      : isWriting ? { background: 'rgba(255,255,255,0.12)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                    {isDone ? <CheckCircle size={14} color="#000" /> : isWriting ? <Loader2 size={14} className="animate-spin" color="#fff" /> : chNum}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chapter {chNum}</p>
                    <p className="text-[11px]" style={{ color: 'var(--foreground-muted)' }}>
                      {title}{isDone && chapter && <span style={{ color: 'var(--success)' }}> · {chapter.word_count.toLocaleString()} words</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDone && (
                    <button onClick={() => setExpanded(isExpanded ? null : chNum)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg btn-ghost press">
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {isExpanded ? 'Hide' : 'Preview'}
                    </button>
                  )}
                  {!isDone && !isWriting && (
                    <button onClick={() => writeChapter(chNum)} disabled={writing !== null}
                      className="btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 press disabled:opacity-40">
                      <Sparkles size={11} /> Write
                    </button>
                  )}
                  {isWriting && (
                    <span className="text-xs flex items-center gap-1.5" style={{ color: '#fff' }}>
                      <Loader2 size={11} className="animate-spin" color="#fff" /> Writing…
                    </span>
                  )}
                </div>
              </div>
              {isExpanded && chapter?.content && (
                <div className="border-t px-4 py-4 text-xs leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto anim-entrance-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground-muted)' }}>
                  {chapter.content.slice(0, 2000)}
                  {chapter.content.length > 2000 && <span style={{ color: 'var(--foreground-dim)' }}>…[preview truncated]</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="anim-entrance stagger-3">
          <AIMessage>
            <p className="font-medium mb-1 flex items-center gap-2">
              <CheckCircle size={14} color="#fff" />
              All {chapterTitles.length} chapters written!
            </p>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Total: {totalWords.toLocaleString()} words. Ready to incorporate your supervisor&apos;s feedback.
            </p>
          </AIMessage>
          <button onClick={() => { advance(); router.refresh() }}
            className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 press mt-4">
            <MessageSquare size={14} /> Add Lecturer Feedback <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   Stage 4 — Lecturer Feedback
══════════════════════════════════════════ */
interface FeedbackThread { feedback: string; response: string }

function Stage4Feedback({ project, chapters, advance }: { project: Project; chapters: Chapter[]; advance: () => void }) {
  const [selectedChapter, setSelectedChapter] = useState<string>('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [thread, setThread] = useState<FeedbackThread[]>([])
  const router = useRouter()

  async function handleSend(message: string) {
    if (!message.trim() || loading) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectTitle: project.title, feedback: message, chapterId: selectedChapter === 'general' ? null : selectedChapter }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setThread(prev => [...prev, { feedback: message, response: data.response }])
      const supabase = createClient()
      await supabase.from('pp_feedback').insert({ project_id: project.id, chapter_id: selectedChapter === 'general' ? null : selectedChapter, feedback_text: message, ai_response: data.response })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process feedback')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col gap-5">
      <StageHeader icon={MessageSquare} label="Lecturer Feedback Loop"
        subtitle="Stage 4 of 5 — Paste your supervisor's comments"
        iconColor="#f97316" iconBg="rgba(249,115,22,0.12)" />

      <AIMessage delay={0.1}>
        <p className="mb-2">Share your lecturer&apos;s feedback and I&apos;ll give you a detailed revision plan with specific, actionable improvements.</p>
        <p style={{ color: 'var(--foreground-muted)' }}>You can submit multiple rounds of feedback. When done, proceed to defense prep.</p>
      </AIMessage>

      {/* Chapter selector */}
      <div className="glass rounded-xl p-3 anim-entrance stagger-1">
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>Feedback applies to:</p>
        <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} className="input-field text-xs py-2">
          <option value="general">General / Whole Project</option>
          {chapters.map(ch => <option key={ch.id} value={ch.id}>Chapter {ch.chapter_number}: {ch.title}</option>)}
        </select>
      </div>

      {/* Conversation thread */}
      {thread.map((item, i) => (
        <div key={i} className="flex flex-col gap-3 anim-entrance">
          <UserMessage>{item.feedback}</UserMessage>
          <AIMessage>
            <p className="font-medium text-xs mb-2" style={{ color: '#fff' }}>Revision Plan</p>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{item.response}</div>
          </AIMessage>
        </div>
      ))}

      {loading && <Thinking label="Analyzing feedback and building revision plan" />}
      {error && <ErrorBanner message={error} />}

      <PromptInputBox
        onSend={handleSend}
        placeholder="Paste your lecturer's feedback here…"
        disabled={loading}
        loading={loading}
        hint="⌘↵ to send"
        className="anim-entrance stagger-2"
      />

      {thread.length > 0 && (
        <div className="pt-3 border-t anim-entrance" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs mb-3" style={{ color: 'var(--foreground-muted)' }}>
            {thread.length} feedback round{thread.length > 1 ? 's' : ''} processed. Ready for defense prep?
          </p>
          <button onClick={() => { advance(); router.refresh() }}
            className="btn-ghost w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 press">
            <Shield size={14} /> Proceed to Defense Prep <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   Stage 5 — Defense Prep
══════════════════════════════════════════ */
function Stage5Defense({ project, stages }: { project: Project; stages: ProjectStageData[] }) {
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<DefenseQA[]>([])
  const [error, setError] = useState('')

  const saved = stages.find(s => s.stage_number === 5)?.content as { questions?: DefenseQA[] } | undefined
  const savedQs = saved?.questions ?? []
  const displayQs = questions.length > 0 ? questions : savedQs

  const catStyle: Record<string, { text: string; bg: string }> = {
    methodology:  { text: '#fff', bg: 'rgba(255,255,255,0.1)' },
    literature:   { text: '#fff', bg: 'rgba(255,255,255,0.1)' },
    findings:     { text: '#fff', bg: 'rgba(255,255,255,0.1)' },
    contribution: { text: '#fff', bg: 'rgba(255,255,255,0.1)' },
    general:      { text: '#fff', bg: 'rgba(255,255,255,0.1)' },
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
      await supabase.from('pp_project_stages').upsert({ project_id: project.id, stage_number: 5, stage_name: 'defense_prep', content: { questions: data.questions }, status: 'completed' }, { onConflict: 'project_id,stage_number' })
      await supabase.from('pp_projects').update({ stage: 6, stage_name: 'completed', updated_at: new Date().toISOString() }).eq('id', project.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col gap-5">
      <StageHeader icon={Shield} label="Defense Preparation"
        subtitle="Stage 5 of 5 — Likely questions with suggested answers"
        iconColor="#22c55e" iconBg="rgba(34,197,94,0.12)" />

      {displayQs.length === 0 && !loading && (
        <>
          <AIMessage delay={0.1}>
            <p className="mb-2">I&apos;ll generate the most likely defense questions your panel will ask — with suggested answers, methodology explanations, and key arguments.</p>
            <p style={{ color: 'var(--foreground-muted)' }}>Questions are organized by: methodology, literature, findings, contribution, and general.</p>
          </AIMessage>
          {error && <ErrorBanner message={error} onRetry={generate} />}
          <button onClick={generate}
            className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 press anim-entrance stagger-2">
            <Shield size={14} /> Generate Defense Questions
          </button>
        </>
      )}

      {loading && (
        <>
          <UserMessage>Generate my defense questions</UserMessage>
          <Thinking label="Preparing your defense material" />
        </>
      )}

      {displayQs.length > 0 && !loading && (
        <>
          <UserMessage>Generate my defense questions</UserMessage>
          <AIMessage delay={0.1}>
            <p className="font-medium mb-3">Here are {displayQs.length} likely defense questions:</p>
            <div className="flex flex-col gap-3">
              {displayQs.map((qa, i) => {
                const cat = catStyle[qa.category] ?? catStyle.general
                return (
                  <div key={i} className="p-3.5 rounded-xl anim-entrance"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 0.05}s` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: cat.text }}>{i + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full capitalize font-medium" style={{ background: cat.bg, color: cat.text }}>{qa.category}</span>
                    </div>
                    <p className="font-semibold text-sm mb-2">{qa.question}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>{qa.suggested_answer}</p>
                  </div>
                )
              })}
            </div>
          </AIMessage>
          <button onClick={generate} className="btn-ghost w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 press anim-entrance stagger-3">
            <RotateCcw size={13} /> Regenerate Questions
          </button>
          {project.stage >= 6 && (
            <div className="glass p-6 rounded-2xl text-center anim-entrance stagger-4"
              style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-bold text-base mb-1" style={{ color: '#fff' }}>Project Complete!</p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                You&apos;ve gone from topic to defense prep. Time to submit and present. Good luck!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
