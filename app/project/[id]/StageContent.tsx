'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project, Chapter, ProjectStageData, ProjectStructure, DefenseQA } from '@/types'
import { PromptInputBox } from '@/components/ui/ai-prompt-box'
import { FeedbackInput } from '@/components/ui/feedback-input'
import { ChapterViewer } from '@/components/chapter-viewer'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import {
  blocksToPlainText, copyToClipboard, downloadAsWord, openPrintWindow,
  type DocBlock,
} from '@/lib/document-export'
import {
  Sparkles, BookOpen, FileText, MessageSquare, Shield,
  CheckCircle, RotateCcw, ArrowRight, Eye, Copy, Check, FileType,
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
    return <Stage2Structure project={project} stages={stages} advance={() => advanceStage(3, 'chapter_writing')} />
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
function Stage2Structure({ project, stages, advance }: { project: Project; stages: ProjectStageData[]; advance: () => void }) {
  const savedStage = stages.find(s => s.stage_number === 2)
  const savedStructure = (savedStage?.content as { structure?: ProjectStructure } | undefined)?.structure ?? null

  const [loading, setLoading] = useState(false)
  const [structure, setStructure] = useState<ProjectStructure | null>(savedStructure)
  const [approvalStatus, setApprovalStatus] = useState<'pending_review' | 'in_revision' | 'approved'>(
    (savedStage?.approval_status as 'pending_review' | 'in_revision' | 'approved') ?? 'pending_review',
  )
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [revising, setRevising] = useState(false)
  const [approveDraft, setApproveDraft] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  /** Build the document blocks for the structure (used by copy + Word + PDF) */
  function structureBlocks(s: ProjectStructure): DocBlock[] {
    const blocks: DocBlock[] = [
      { type: 'h1', text: project.title },
      { type: 'p',  text: 'Project Structure & Chapter Outline' },
    ]
    if (s.estimated_pages) {
      blocks.push({ type: 'p', text: `Estimated total pages: ${s.estimated_pages}` })
    }
    s.chapters.forEach(ch => {
      blocks.push({ type: 'h2', text: `Chapter ${ch.number}: ${ch.title}` })
      if (ch.description) blocks.push({ type: 'p', text: ch.description })
      if (ch.sections?.length) {
        blocks.push({ type: 'p', text: 'Sections:' })
        blocks.push({ type: 'ul', items: ch.sections })
      }
    })
    return blocks
  }

  async function handleCopy() {
    if (!structure) return
    await copyToClipboard(blocksToPlainText(structureBlocks(structure)))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function handleWord() {
    if (!structure) return
    downloadAsWord({
      fileName: `${project.title} — Project Structure`,
      title: project.title,
      blocks: structureBlocks(structure),
    })
  }

  function handlePrint() {
    if (!structure) return
    openPrintWindow({
      title: project.title,
      blocks: structureBlocks(structure),
    })
  }

  /** Format the structure as plain text (for the AI to revise as text) */
  function structureToText(s: ProjectStructure): string {
    let out = ''
    s.chapters.forEach(ch => {
      out += `Chapter ${ch.number}: ${ch.title}\n`
      if (ch.description) out += `${ch.description}\n`
      ch.sections.forEach(sec => { out += `  - ${sec}\n` })
      out += '\n'
    })
    if (s.estimated_pages) out += `Estimated pages: ${s.estimated_pages}\n`
    return out.trim()
  }

  /** Parse revised plain text back into a ProjectStructure (lenient parser) */
  function parseRevisedStructure(text: string): ProjectStructure {
    const chapters: ProjectStructure['chapters'] = []
    let estimated_pages = structure?.estimated_pages ?? 70
    let current: ProjectStructure['chapters'][number] | null = null

    for (const rawLine of text.split('\n')) {
      const line = rawLine.trimEnd()
      if (!line.trim()) continue

      const chMatch = line.match(/^chapter\s*(\d+)\s*[:.\-—]?\s*(.+)$/i)
      if (chMatch) {
        if (current) chapters.push(current)
        current = { number: parseInt(chMatch[1], 10), title: chMatch[2].trim(), description: '', sections: [] }
        continue
      }

      const pagesMatch = line.match(/estimated\s+pages?:?\s*(\d+)/i)
      if (pagesMatch) { estimated_pages = parseInt(pagesMatch[1], 10); continue }

      if (!current) continue

      // Section bullet
      if (/^\s*[-*•]\s+/.test(line) || /^\s*\d+\.\d+/.test(line.trim())) {
        current.sections.push(line.replace(/^\s*[-*•]\s+/, '').trim())
        continue
      }

      // Description (first non-bullet, non-chapter prose line)
      if (!current.description) {
        current.description = line.trim()
      } else {
        current.description += ' ' + line.trim()
      }
    }
    if (current) chapters.push(current)

    return { chapters, estimated_pages }
  }

  async function reviseStructure(payload: { text: string; images: { dataUrl: string; mediaType: string }[]; audioTranscript?: string }) {
    if (!structure || revising) return
    setRevising(true); setError('')
    try {
      const before = structureToText(structure)
      const res = await fetch('/api/ai/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentToRevise: before,
          kind: 'structure',
          projectTitle: project.title,
          department: project.department,
          level: project.level,
          feedbackText: payload.text,
          audioTranscript: payload.audioTranscript,
          images: payload.images.map(i => ({ data: i.dataUrl, mediaType: i.mediaType })),
        }),
      })
      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('application/json')) {
        if (res.status === 504) throw new Error('Revision took too long. Please try again.')
        throw new Error(`Server returned ${res.status}.`)
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Revision failed')

      const revised = parseRevisedStructure(data.revised as string)
      setStructure(revised)

      const supabase = createClient()
      await supabase.from('pp_project_stages').upsert({
        project_id: project.id, stage_number: 2, stage_name: 'project_structure',
        content: { structure: revised }, status: 'completed', approval_status: 'in_revision',
      }, { onConflict: 'project_id,stage_number' })

      await supabase.from('pp_chapter_feedback').insert({
        project_id: project.id, chapter_id: null, stage_number: 2,
        feedback_text: payload.text || '(image/audio only)',
        attachments: payload.images.map(() => ({ kind: 'image' as const, name: 'screenshot' })),
        audio_transcript: payload.audioTranscript ?? null,
        before_content: before,
        after_content: data.revised,
      })

      setApprovalStatus('in_revision')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revision failed')
    } finally {
      setRevising(false)
    }
  }

  async function approveStructure() {
    const supabase = createClient()
    await supabase.from('pp_project_stages').upsert({
      project_id: project.id, stage_number: 2, stage_name: 'project_structure',
      content: { structure }, status: 'completed', approval_status: 'approved',
      approved_at: new Date().toISOString(),
    }, { onConflict: 'project_id,stage_number' })
    setApprovalStatus('approved')
    setFeedbackOpen(false)
    setApproveDraft('')
  }

  async function generate() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/ai/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          department: project.department,
          field: project.field,
          level: project.level,
          lecturerToc: project.lecturer_toc,
          lecturerNotes: project.lecturer_notes,
          interests: project.interests,
        }),
      })

      // Vercel returns HTML on timeout; guard before res.json()
      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('application/json')) {
        if (res.status === 504) {
          throw new Error('Generation took too long and timed out. Please retry — Anthropic is sometimes faster on the second try.')
        }
        throw new Error(`Server returned ${res.status}. Please retry.`)
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error (${res.status})`)
      if (!data.structure) throw new Error('Empty response from AI. Please retry.')

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
          {/* Download / share actions — students show this to their supervisors */}
          <div className="flex flex-wrap gap-2 anim-entrance stagger-3">
            <button
              onClick={handleCopy}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium press"
              title="Copy structure as plain text"
            >
              {copied ? (
                <><Check size={11} color="#fff" /> Copied</>
              ) : (
                <><Copy size={11} color="#fff" /> Copy</>
              )}
            </button>
            <button
              onClick={handleWord}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium press"
              title="Download as Word document (.doc)"
            >
              <FileText size={11} color="#fff" /> Word
            </button>
            <button
              onClick={handlePrint}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium press"
              title="Open print dialog (save as PDF from there)"
            >
              <FileType size={11} color="#fff" /> PDF
            </button>
            <button onClick={generate}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium press ml-auto"
              title="Generate a new structure"
            >
              <RotateCcw size={11} color="#fff" /> Regenerate
            </button>
          </div>

          {/* Approval gate — same pattern as chapters */}
          {approvalStatus === 'approved' ? (
            <button onClick={() => { advance(); router.refresh() }}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 press anim-entrance stagger-4">
              <CheckCircle size={14} color="#fff" /> Continue to Chapter Writing <ArrowRight size={14} color="#fff" />
            </button>
          ) : (
            <div className="glass rounded-2xl overflow-hidden anim-entrance stagger-4">
              <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <AlertCircle size={14} color="#fbbf24" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Awaiting supervisor approval</p>
                  <p className="text-[11px]" style={{ color: 'var(--foreground-muted)' }}>
                    Show this structure to your supervisor before chapter writing begins.
                  </p>
                </div>
                {!feedbackOpen && (
                  <button
                    onClick={() => setFeedbackOpen(true)}
                    className="btn-ghost text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 press"
                  >
                    <MessageSquare size={11} color="#fff" /> Add feedback
                  </button>
                )}
              </div>

              {feedbackOpen && (
                <div className="p-4 flex flex-col gap-3 anim-entrance-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>
                      LECTURER&apos;S FEEDBACK
                    </p>
                    <button onClick={() => setFeedbackOpen(false)} className="text-[11px]" style={{ color: 'var(--foreground-dim)' }}>
                      Hide
                    </button>
                  </div>

                  <FeedbackInput
                    loading={revising}
                    onSend={async (payload) => {
                      await reviseStructure({
                        text: payload.text,
                        images: payload.images.map(i => ({ dataUrl: i.dataUrl, mediaType: i.mediaType })),
                        audioTranscript: payload.audioTranscript,
                      })
                    }}
                    placeholder="Paste supervisor's comments on the structure…"
                  />

                  <div
                    className="rounded-xl p-3 mt-1"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-xs font-medium mb-2">Lecturer approved this structure?</p>
                    <p className="text-[11px] mb-3" style={{ color: 'var(--foreground-muted)' }}>
                      Type <span className="font-mono font-bold text-white">APPROVED</span> below to lock and proceed to chapter writing.
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={approveDraft}
                        onChange={e => setApproveDraft(e.target.value)}
                        placeholder="Type APPROVED"
                        className="input-field flex-1 text-sm uppercase tracking-wider"
                        autoComplete="off"
                      />
                      <button
                        onClick={approveStructure}
                        disabled={approveDraft.trim().toUpperCase() !== 'APPROVED'}
                        className="btn-primary text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 press disabled:opacity-40 whitespace-nowrap"
                      >
                        <CheckCircle size={11} color="#fff" /> Lock in
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
  const [writingPart, setWritingPart] = useState<1 | 2 | null>(null)
  const [viewing, setViewing] = useState<Chapter | null>(null)
  const [includeTables, setIncludeTables] = useState<Record<number, boolean>>({})
  const [error, setError] = useState('')
  // Approval-gate state
  const [feedbackOpen, setFeedbackOpen] = useState<number | null>(null)
  const [revising, setRevising] = useState<number | null>(null)
  const [approveDraft, setApproveDraft] = useState<Record<number, string>>({})
  const router = useRouter()

  const chapterTitles = ['Introduction', 'Literature Review', 'Research Methodology', 'Data Presentation and Analysis', 'Summary, Conclusion and Recommendations']

  async function fetchChapterPart(chapterNum: number, part: 1 | 2): Promise<string> {
    const res = await fetch('/api/ai/chapter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        title: project.title,
        department: project.department,
        field: project.field,
        level: project.level,
        chapterNumber: chapterNum,
        chapterTitle: chapterTitles[chapterNum - 1],
        part,
        // Lecturer context — applied to every chapter call
        lecturerToc: project.lecturer_toc,
        lecturerNotes: project.lecturer_notes,
        interests: project.interests,
        // Tables only when student explicitly asks (Ch 4 always allows)
        includeTables: !!includeTables[chapterNum],
      }),
    })

    // Handle non-JSON responses (e.g. Vercel timeout HTML)
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      if (res.status === 504) {
        throw new Error(`Part ${part} timed out. Please retry the chapter.`)
      }
      throw new Error(`Server returned ${res.status} on part ${part}. Please retry.`)
    }

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Server error on part ${part}`)
    if (!data.content) throw new Error(`Empty response on part ${part}. Please retry.`)
    return data.content as string
  }

  async function writeChapter(chapterNum: number) {
    setWriting(chapterNum); setError(''); setWritingPart(1)
    try {
      // Part 1
      const part1 = await fetchChapterPart(chapterNum, 1)

      // Part 2
      setWritingPart(2)
      const part2 = await fetchChapterPart(chapterNum, 2)

      // Stitch parts with a single blank line between
      const fullContent = `${part1.trim()}\n\n${part2.trim()}`

      const supabase = createClient()
      const wordCount = fullContent.split(/\s+/).filter(Boolean).length
      const { data: saved, error: dbError } = await supabase.from('pp_chapters').upsert({
        project_id: project.id,
        chapter_number: chapterNum,
        title: chapterTitles[chapterNum - 1],
        content: fullContent,
        word_count: wordCount,
        status: 'completed',
      }, { onConflict: 'project_id,chapter_number' }).select().single()

      if (dbError) throw new Error(`Save failed: ${dbError.message}`)
      if (saved) setChapters(prev =>
        [...prev.filter(c => c.chapter_number !== chapterNum), saved as Chapter]
          .sort((a, b) => a.chapter_number - b.chapter_number)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write chapter')
    } finally {
      setWriting(null)
      setWritingPart(null)
    }
  }

  /* ── Approval & revision flow ─────────────────────── */
  async function approveChapter(chNum: number) {
    const chapter = chapters.find(c => c.chapter_number === chNum)
    if (!chapter) return
    const supabase = createClient()
    const { data, error: dbError } = await supabase
      .from('pp_chapters')
      .update({ approval_status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', chapter.id)
      .select()
      .single()
    if (dbError) { setError(dbError.message); return }
    if (data) {
      setChapters(prev =>
        prev.map(c => c.id === chapter.id ? (data as Chapter) : c).sort((a, b) => a.chapter_number - b.chapter_number)
      )
      setApproveDraft(prev => ({ ...prev, [chNum]: '' }))
      setFeedbackOpen(null)
    }
  }

  async function reviseChapter(
    chNum: number,
    payload: { text: string; images: { dataUrl: string; mediaType: string }[]; audioTranscript?: string },
  ) {
    const chapter = chapters.find(c => c.chapter_number === chNum)
    if (!chapter || revising !== null) return
    setRevising(chNum)
    setError('')
    try {
      const res = await fetch('/api/ai/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentToRevise: chapter.content,
          kind: 'chapter',
          chapterNumber: chNum,
          chapterTitle: chapter.title,
          projectTitle: project.title,
          department: project.department,
          level: project.level,
          feedbackText: payload.text,
          audioTranscript: payload.audioTranscript,
          images: payload.images.map(i => ({ data: i.dataUrl, mediaType: i.mediaType })),
        }),
      })
      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('application/json')) {
        if (res.status === 504) throw new Error('Revision took too long. Please try again.')
        throw new Error(`Server returned ${res.status}.`)
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Revision failed')

      const supabase = createClient()
      const newWordCount = (data.revised as string).split(/\s+/).filter(Boolean).length
      const { data: saved, error: dbError } = await supabase
        .from('pp_chapters')
        .update({
          content: data.revised,
          word_count: newWordCount,
          approval_status: 'in_revision',
          revision_count: (chapter.revision_count ?? 0) + 1,
        })
        .eq('id', chapter.id)
        .select()
        .single()
      if (dbError) throw new Error(dbError.message)

      // Save the feedback round to history
      await supabase.from('pp_chapter_feedback').insert({
        project_id: project.id,
        chapter_id: chapter.id,
        feedback_text: payload.text || '(image/audio only)',
        attachments: payload.images.map(i => ({ kind: 'image' as const, name: 'screenshot' })),
        audio_transcript: payload.audioTranscript ?? null,
        before_content: chapter.content,
        after_content: data.revised,
      })

      if (saved) setChapters(prev =>
        prev.map(c => c.id === chapter.id ? (saved as Chapter) : c).sort((a, b) => a.chapter_number - b.chapter_number)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revision failed')
    } finally {
      setRevising(null)
    }
  }

  /** Index of the first chapter not yet approved — chapters after this are locked. */
  function nextUnapprovedIdx(): number {
    for (let i = 0; i < chapterTitles.length; i++) {
      const ch = chapters.find(c => c.chapter_number === i + 1)
      if (!ch || ch.approval_status !== 'approved') return i
    }
    return chapterTitles.length
  }

  const allDone = chapterTitles.every((_, i) => chapters.find(c => c.chapter_number === i + 1 && c.status === 'completed'))
  const allApproved = chapterTitles.every((_, i) => chapters.find(c => c.chapter_number === i + 1 && c.approval_status === 'approved'))
  const totalWords = chapters.reduce((sum, c) => sum + (c.word_count ?? 0), 0)
  const unlockIdx = nextUnapprovedIdx()

  return (
    <div className="flex flex-col gap-5">
      <StageHeader icon={FileText} label="Chapter Writing"
        subtitle="Stage 3 of 5 — AI writes each chapter individually"
        iconColor="#7c3aed" iconBg="rgba(124,58,237,0.12)" />

      <AIMessage delay={0.1}>
        <p className="mb-2">I&apos;ll write each chapter in two parts — 3,000–4,000 words total per chapter (~14–16 pages double-spaced) with proper academic structure and citations.</p>
        <p style={{ color: 'var(--foreground-muted)' }}>Write them one at a time. Each chapter takes about 90–110 seconds (two API calls).</p>
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
          const isApproved = chapter?.approval_status === 'approved'
          const isPendingReview = isDone && !isApproved
          const isLocked = i > unlockIdx
          const isFeedbackOpen = feedbackOpen === chNum
          const isRevising = revising === chNum
          const draft = approveDraft[chNum] ?? ''

          // Pill style based on status
          let pillStyle: React.CSSProperties
          let pillIcon: React.ReactNode
          if (isApproved) {
            pillStyle = { background: '#fff', color: '#000' }
            pillIcon = <CheckCircle size={14} color="#000" />
          } else if (isWriting || isRevising) {
            pillStyle = { background: 'rgba(255,255,255,0.12)', color: '#fff' }
            pillIcon = <Loader2 size={14} className="animate-spin" color="#fff" />
          } else if (isPendingReview) {
            pillStyle = { background: 'rgba(245,158,11,0.18)', color: '#fbbf24' }
            pillIcon = <AlertCircle size={14} color="#fbbf24" />
          } else if (isLocked) {
            pillStyle = { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.25)' }
            pillIcon = <span className="text-xs font-bold">{chNum}</span>
          } else {
            pillStyle = { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }
            pillIcon = <span className="text-xs font-bold">{chNum}</span>
          }

          return (
            <div
              key={chNum}
              className="glass rounded-2xl overflow-hidden anim-entrance"
              style={{
                animationDelay: `${i * 0.06}s`,
                opacity: isLocked ? 0.55 : 1,
              }}
            >
              {/* ── Card body — two rows on mobile, single row on sm+ ─── */}
              <div className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                {/* Row 1: pill + identity */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={pillStyle}>
                    {pillIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold leading-none">Chapter {chNum}</span>
                      {isApproved && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold leading-none" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                          APPROVED
                        </span>
                      )}
                      {isPendingReview && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold leading-none whitespace-nowrap" style={{ background: 'rgba(245,158,11,0.18)', color: '#fbbf24' }}>
                          AWAITING REVIEW
                        </span>
                      )}
                      {chapter?.revision_count ? (
                        <span className="text-[10px] leading-none" style={{ color: 'var(--foreground-dim)' }}>
                          · rev {chapter.revision_count}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[12px] truncate" style={{ color: 'var(--foreground-muted)' }}>
                      {title}{isDone && chapter ? ` · ${chapter.word_count.toLocaleString()} words` : null}
                    </p>
                  </div>
                </div>

                {/* Row 2: actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:flex-shrink-0">
                  {(isWriting || isRevising) ? (
                    <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ color: '#fff', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                      <Loader2 size={11} className="animate-spin" color="#fff" />
                      {isWriting ? `Writing ${writingPart ?? 1}/2…` : 'Revising…'}
                    </span>
                  ) : (
                    <>
                      {isDone && chapter && (
                        <button
                          onClick={() => setViewing(chapter)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-ghost press"
                          title="Open chapter — copy or download"
                        >
                          <Eye size={12} color="#fff" />
                          View
                        </button>
                      )}
                      {!isDone && !isLocked && chNum !== 4 && (
                        <label
                          className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                          style={{ color: 'var(--foreground-dim)' }}
                          title="Tell AI to include tables/charts"
                        >
                          <input
                            type="checkbox"
                            checked={!!includeTables[chNum]}
                            onChange={e => setIncludeTables(prev => ({ ...prev, [chNum]: e.target.checked }))}
                            className="accent-white w-3 h-3"
                          />
                          Tables
                        </label>
                      )}
                      {!isDone && !isLocked && (
                        <button
                          onClick={() => writeChapter(chNum)}
                          disabled={writing !== null}
                          className="btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 press disabled:opacity-40"
                        >
                          <Sparkles size={11} color="#fff" /> Write
                        </button>
                      )}
                      {isLocked && !isDone && (
                        <span className="text-[10px] px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--foreground-dim)' }}>
                          Locked
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ── Approval / feedback panel ──────────── */}
              {isPendingReview && !isWriting && !isRevising && (
                <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--border)' }}>
                  {!isFeedbackOpen ? (
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                      <p className="text-xs flex-1" style={{ color: 'var(--foreground-muted)' }}>
                        Show this chapter to your supervisor. When approved, lock it in to unlock the next chapter.
                      </p>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setFeedbackOpen(chNum)}
                          className="btn-ghost text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 press"
                        >
                          <MessageSquare size={11} color="#fff" />
                          Add feedback
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 anim-entrance-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>
                          LECTURER&apos;S FEEDBACK
                        </p>
                        <button
                          onClick={() => setFeedbackOpen(null)}
                          className="text-[11px] transition-colors"
                          style={{ color: 'var(--foreground-dim)' }}
                        >
                          Hide
                        </button>
                      </div>

                      {/* Feedback input — text + images + voice */}
                      <FeedbackInput
                        loading={isRevising}
                        onSend={async (payload) => {
                          await reviseChapter(chNum, {
                            text: payload.text,
                            images: payload.images.map(i => ({ dataUrl: i.dataUrl, mediaType: i.mediaType })),
                            audioTranscript: payload.audioTranscript,
                          })
                        }}
                      />

                      <p className="text-[11px]" style={{ color: 'var(--foreground-dim)' }}>
                        AI will only revise the parts the lecturer flagged. Everything else stays untouched.
                      </p>

                      {/* Approval gate */}
                      <div
                        className="rounded-xl p-3 mt-1"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                          Lecturer approved this chapter?
                        </p>
                        <p className="text-[11px] mb-3" style={{ color: 'var(--foreground-muted)' }}>
                          Type <span className="font-mono font-bold text-white">APPROVED</span> below to lock this chapter and unlock the next one.
                        </p>
                        <div className="flex gap-2">
                          <input
                            value={draft}
                            onChange={e => setApproveDraft(prev => ({ ...prev, [chNum]: e.target.value }))}
                            placeholder="Type APPROVED"
                            className="input-field flex-1 text-sm uppercase tracking-wider"
                            autoComplete="off"
                          />
                          <button
                            onClick={() => approveChapter(chNum)}
                            disabled={draft.trim().toUpperCase() !== 'APPROVED'}
                            className="btn-primary text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 press disabled:opacity-40 whitespace-nowrap"
                          >
                            <CheckCircle size={11} color="#fff" />
                            Lock in
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allDone && !allApproved && (
        <div className="glass rounded-2xl p-4 anim-entrance stagger-3" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <p className="text-sm font-medium mb-1 flex items-center gap-2">
            <AlertCircle size={14} color="#fbbf24" />
            All chapters written. Awaiting supervisor approval.
          </p>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Get each chapter approved by typing <span className="font-mono text-white">APPROVED</span> below it. Once all 5 are approved, you&apos;ll unlock the final stages.
          </p>
        </div>
      )}

      {allApproved && (
        <div className="anim-entrance stagger-3">
          <AIMessage>
            <p className="font-medium mb-1 flex items-center gap-2">
              <CheckCircle size={14} color="#fff" />
              All {chapterTitles.length} chapters approved!
            </p>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Total: {totalWords.toLocaleString()} words. Ready to move on to defense preparation.
            </p>
          </AIMessage>
          <button onClick={() => { advance(); router.refresh() }}
            className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 press mt-4">
            <Shield size={14} color="#fff" /> Continue to Defense Prep <ArrowRight size={14} color="#fff" />
          </button>
        </div>
      )}

      {/* Chapter viewer modal */}
      <ChapterViewer
        chapter={viewing}
        projectTitle={project.title}
        onClose={() => setViewing(null)}
      />
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
        <Select value={selectedChapter} onValueChange={setSelectedChapter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General / Whole Project</SelectItem>
            {chapters.map(ch => (
              <SelectItem key={ch.id} value={ch.id}>
                Chapter {ch.chapter_number}: {ch.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
