'use client'

import { useEffect, useState, useMemo } from 'react'
import { X, Copy, Check, Download, FileText, FileType } from 'lucide-react'
import type { Chapter } from '@/types'

interface Props {
  chapter: Chapter | null
  projectTitle: string
  onClose: () => void
}

/* ─────────────────────────────────────────
   Markdown → structured blocks
───────────────────────────────────────── */
type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p';  text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; rows: string[][] }

// Strip leading markdown markers and excessive em dashes that survived
function cleanText(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')   // strip bold markers
    .replace(/\*(.+?)\*/g, '$1')        // strip italic markers
    .trim()
}

function parseContent(raw: string): Block[] {
  const blocks: Block[] = []
  const lines = raw.replace(/\r\n/g, '\n').split('\n')

  let i = 0
  let para: string[] = []
  let ulItems: string[] = []
  let olItems: string[] = []

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: cleanText(para.join(' ')) })
      para = []
    }
  }
  const flushUl = () => {
    if (ulItems.length) {
      blocks.push({ type: 'ul', items: ulItems.map(cleanText) })
      ulItems = []
    }
  }
  const flushOl = () => {
    if (olItems.length) {
      blocks.push({ type: 'ol', items: olItems.map(cleanText) })
      olItems = []
    }
  }
  const flushAll = () => { flushPara(); flushUl(); flushOl() }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushAll()
      i++; continue
    }

    // Markdown table (consecutive lines starting with `|`)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushAll()
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const rows = tableLines
        .map(l => l.slice(1, -1).split('|').map(c => cleanText(c)))
        .filter(r => !r.every(c => /^-+$/.test(c.replace(/[\s:]/g, ''))))  // drop separator row
      if (rows.length) blocks.push({ type: 'table', rows })
      continue
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushAll()
      blocks.push({ type: 'h3', text: cleanText(trimmed.slice(4)) })
      i++; continue
    }
    if (trimmed.startsWith('## ')) {
      flushAll()
      blocks.push({ type: 'h2', text: cleanText(trimmed.slice(3)) })
      i++; continue
    }
    if (trimmed.startsWith('# ')) {
      flushAll()
      blocks.push({ type: 'h1', text: cleanText(trimmed.slice(2)) })
      i++; continue
    }

    // Numbered section heading like "1.1 Background to the Study" on its own line
    if (/^\d+(\.\d+)+\s+\S+/.test(trimmed) && trimmed.length < 100) {
      flushAll()
      blocks.push({ type: 'h2', text: cleanText(trimmed) })
      i++; continue
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      flushPara(); flushOl()
      ulItems.push(trimmed.replace(/^[-*•]\s+/, ''))
      i++; continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara(); flushUl()
      olItems.push(trimmed.replace(/^\d+\.\s+/, ''))
      i++; continue
    }

    // Regular paragraph line
    flushUl(); flushOl()
    para.push(trimmed)
    i++
  }

  flushAll()
  return blocks
}

/* ─────────────────────────────────────────
   Block → plain text (for clipboard)
───────────────────────────────────────── */
function blocksToPlainText(blocks: Block[]): string {
  return blocks.map(b => {
    if (b.type === 'h1' || b.type === 'h2' || b.type === 'h3') return `\n${b.text}\n`
    if (b.type === 'p') return b.text
    if (b.type === 'ul') return b.items.map(it => `• ${it}`).join('\n')
    if (b.type === 'ol') return b.items.map((it, i) => `${i + 1}. ${it}`).join('\n')
    if (b.type === 'table') return b.rows.map(r => r.join('\t')).join('\n')
    return ''
  }).join('\n\n')
}

/* ─────────────────────────────────────────
   Block → HTML (for Word download)
───────────────────────────────────────── */
function blocksToHtml(blocks: Block[]): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return blocks.map(b => {
    switch (b.type) {
      case 'h1': return `<h1 style="font-size:18pt;font-weight:bold;margin:16pt 0 12pt;text-align:center;">${esc(b.text)}</h1>`
      case 'h2': return `<h2 style="font-size:14pt;font-weight:bold;margin:14pt 0 8pt;">${esc(b.text)}</h2>`
      case 'h3': return `<h3 style="font-size:12pt;font-weight:bold;margin:12pt 0 6pt;">${esc(b.text)}</h3>`
      case 'p':  return `<p style="font-size:12pt;line-height:2;margin:0 0 12pt;text-align:justify;text-indent:0.5in;">${esc(b.text)}</p>`
      case 'ul': return `<ul style="font-size:12pt;line-height:1.6;margin:0 0 12pt 0.5in;">${b.items.map(it => `<li>${esc(it)}</li>`).join('')}</ul>`
      case 'ol': return `<ol style="font-size:12pt;line-height:1.6;margin:0 0 12pt 0.5in;">${b.items.map(it => `<li>${esc(it)}</li>`).join('')}</ol>`
      case 'table': {
        const head = b.rows[0]
        const body = b.rows.slice(1)
        return `<table style="border-collapse:collapse;width:100%;margin:12pt 0;font-size:11pt;">
          <thead><tr>${head.map(c => `<th style="border:1px solid #000;padding:6pt;background:#eee;text-align:left;">${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>${body.map(r => `<tr>${r.map(c => `<td style="border:1px solid #000;padding:6pt;">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`
      }
    }
  }).join('\n')
}

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export function ChapterViewer({ chapter, projectTitle, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  // Lock body scroll while open
  useEffect(() => {
    if (!chapter) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [chapter, onClose])

  const blocks = useMemo(() => chapter ? parseContent(chapter.content ?? '') : [], [chapter])
  const plainText = useMemo(() => chapter ? blocksToPlainText(blocks) : '', [blocks, chapter])

  if (!chapter) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = plainText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  function handleDownloadWord() {
    if (!chapter) return
    const fileName = `${projectTitle} — Chapter ${chapter.chapter_number}.doc`
      .replace(/[^a-z0-9 .—-]/gi, '')
    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>${chapter.title}</title>
      <style>body{font-family:'Times New Roman',serif;color:#000;margin:1in;}</style>
      </head><body>
      <h1 style="text-align:center;font-size:14pt;font-weight:bold;margin-bottom:8pt;">${projectTitle}</h1>
      ${blocksToHtml(blocks)}
      </body></html>`
    const blob = new Blob(['﻿', html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handlePrintPdf() {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>${chapter?.title ?? ''}</title>
      <style>
        body{font-family:'Times New Roman',serif;font-size:12pt;line-height:2;color:#000;max-width:6.5in;margin:1in auto;}
        h1{font-size:14pt;text-align:center;}
        h2{font-size:13pt;}
        h3{font-size:12pt;}
        p{text-align:justify;text-indent:0.5in;margin:0 0 12pt;}
        table{border-collapse:collapse;width:100%;font-size:11pt;}
        th,td{border:1px solid #000;padding:6pt;}
        th{background:#eee;}
        @media print{body{margin:0;}}
      </style>
      </head><body>
      <h1>${projectTitle}</h1>
      ${blocksToHtml(blocks)}
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 350)
  }

  return (
    <div
      className="fixed inset-0 z-50 anim-fade"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="absolute inset-x-0 top-[5vh] bottom-[5vh] mx-auto max-w-3xl glass-strong rounded-3xl overflow-hidden flex flex-col anim-scale"
        onClick={e => e.stopPropagation()}
        style={{ background: 'rgba(12,12,20,0.95)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--foreground-dim)' }}>
              Chapter {chapter.chapter_number}
            </p>
            <h2 className="text-base font-semibold truncate">{chapter.title}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
              {chapter.word_count.toLocaleString()} words
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium press"
              title="Copy chapter as plain text"
            >
              {copied ? (
                <><Check size={12} color="#fff" /> Copied</>
              ) : (
                <><Copy size={12} color="#fff" /> Copy</>
              )}
            </button>

            <button
              onClick={handleDownloadWord}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium press"
              title="Download as Word document (.doc)"
            >
              <FileText size={12} color="#fff" /> Word
            </button>

            <button
              onClick={handlePrintPdf}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium press"
              title="Open print dialog (save as PDF from there)"
            >
              <FileType size={12} color="#fff" /> PDF
            </button>

            <button
              onClick={onClose}
              className="ml-1 p-2 rounded-lg transition-colors hover:bg-white/8"
              aria-label="Close"
            >
              <X size={14} color="#fff" />
            </button>
          </div>
        </div>

        {/* Body — full chapter, no truncation */}
        <div
          className="flex-1 overflow-y-auto px-10 py-8"
          style={{ color: 'var(--foreground)' }}
        >
          {blocks.map((b, i) => {
            switch (b.type) {
              case 'h1':
                return <h1 key={i} className="text-xl font-bold text-center mt-2 mb-5 tracking-tight">{b.text}</h1>
              case 'h2':
                return <h2 key={i} className="text-base font-bold mt-7 mb-3 tracking-tight">{b.text}</h2>
              case 'h3':
                return <h3 key={i} className="text-sm font-semibold mt-5 mb-2">{b.text}</h3>
              case 'p':
                return <p key={i} className="text-[15px] leading-[1.85] mb-4 text-justify" style={{ textIndent: '1.5em' }}>{b.text}</p>
              case 'ul':
                return (
                  <ul key={i} className="list-disc pl-6 mb-4 space-y-1.5">
                    {b.items.map((it, j) => <li key={j} className="text-[15px] leading-relaxed">{it}</li>)}
                  </ul>
                )
              case 'ol':
                return (
                  <ol key={i} className="list-decimal pl-6 mb-4 space-y-1.5">
                    {b.items.map((it, j) => <li key={j} className="text-[15px] leading-relaxed">{it}</li>)}
                  </ol>
                )
              case 'table':
                return (
                  <div key={i} className="overflow-x-auto mb-5">
                    <table className="w-full text-sm border-collapse" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                          {b.rows[0].map((c, j) => (
                            <th key={j} className="px-3 py-2 text-left font-semibold" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {b.rows.slice(1).map((r, j) => (
                          <tr key={j}>
                            {r.map((c, k) => (
                              <td key={k} className="px-3 py-2" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              default:
                return null
            }
          })}
        </div>
      </div>
    </div>
  )
}
