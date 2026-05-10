/**
 * Document export helpers — used by chapter viewer + project structure
 * to produce Word (.doc) downloads and print-friendly PDF windows.
 */

export interface DocBlock {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'ol'
  text?: string
  items?: string[]
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const sanitizeFileName = (s: string) =>
  s.replace(/[^a-z0-9 .—-]/gi, '').trim() || 'document'

/* ── HTML generation ─────────────────────── */

function blocksToWordHtml(blocks: DocBlock[]): string {
  return blocks.map(b => {
    switch (b.type) {
      case 'h1': return `<h1 style="font-size:18pt;font-weight:bold;margin:18pt 0 12pt;text-align:center;">${esc(b.text ?? '')}</h1>`
      case 'h2': return `<h2 style="font-size:14pt;font-weight:bold;margin:14pt 0 8pt;">${esc(b.text ?? '')}</h2>`
      case 'h3': return `<h3 style="font-size:12pt;font-weight:bold;margin:12pt 0 6pt;">${esc(b.text ?? '')}</h3>`
      case 'p':  return `<p style="font-size:12pt;line-height:2;margin:0 0 12pt;text-align:justify;text-indent:0.5in;">${esc(b.text ?? '')}</p>`
      case 'ul': return `<ul style="font-size:12pt;line-height:1.6;margin:0 0 12pt 0.5in;">${(b.items ?? []).map(it => `<li>${esc(it)}</li>`).join('')}</ul>`
      case 'ol': return `<ol style="font-size:12pt;line-height:1.6;margin:0 0 12pt 0.5in;">${(b.items ?? []).map(it => `<li>${esc(it)}</li>`).join('')}</ol>`
    }
  }).join('\n')
}

function blocksToPrintHtml(blocks: DocBlock[]): string {
  return blocks.map(b => {
    switch (b.type) {
      case 'h1': return `<h1>${esc(b.text ?? '')}</h1>`
      case 'h2': return `<h2>${esc(b.text ?? '')}</h2>`
      case 'h3': return `<h3>${esc(b.text ?? '')}</h3>`
      case 'p':  return `<p>${esc(b.text ?? '')}</p>`
      case 'ul': return `<ul>${(b.items ?? []).map(it => `<li>${esc(it)}</li>`).join('')}</ul>`
      case 'ol': return `<ol>${(b.items ?? []).map(it => `<li>${esc(it)}</li>`).join('')}</ol>`
    }
  }).join('\n')
}

/* ── Plain text ──────────────────────────── */

export function blocksToPlainText(blocks: DocBlock[]): string {
  return blocks.map(b => {
    if (b.type === 'h1' || b.type === 'h2' || b.type === 'h3') return `\n${b.text ?? ''}\n`
    if (b.type === 'p') return b.text ?? ''
    if (b.type === 'ul') return (b.items ?? []).map(it => `• ${it}`).join('\n')
    if (b.type === 'ol') return (b.items ?? []).map((it, i) => `${i + 1}. ${it}`).join('\n')
    return ''
  }).join('\n\n').trim()
}

/* ── Public API ──────────────────────────── */

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

export function downloadAsWord(opts: { fileName: string; title: string; blocks: DocBlock[] }) {
  const fileName = sanitizeFileName(opts.fileName) + '.doc'
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${esc(opts.title)}</title>
    <style>body{font-family:'Times New Roman',serif;color:#000;margin:1in;}</style>
    </head><body>
    ${blocksToWordHtml(opts.blocks)}
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

export function openPrintWindow(opts: { title: string; blocks: DocBlock[] }) {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><title>${esc(opts.title)}</title>
    <style>
      body{font-family:'Times New Roman',serif;font-size:12pt;line-height:2;color:#000;max-width:6.5in;margin:1in auto;}
      h1{font-size:14pt;text-align:center;margin:12pt 0;}
      h2{font-size:13pt;margin:14pt 0 8pt;}
      h3{font-size:12pt;margin:12pt 0 6pt;}
      p{text-align:justify;text-indent:0.5in;margin:0 0 12pt;}
      ul,ol{margin:0 0 12pt 0.5in;}
      @media print{body{margin:0;}}
    </style>
    </head><body>
    ${blocksToPrintHtml(opts.blocks)}
    </body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 350)
}
