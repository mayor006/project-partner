'use client'

import { useRef, useState, useEffect, useCallback, type ClipboardEvent } from 'react'
import {
  Paperclip, ArrowUp, X, Mic, StopCircle, Loader2, Image as ImageIcon, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface FeedbackImage {
  /** Base64 data URL (data:image/png;base64,...) */
  dataUrl: string
  name: string
  mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
}

export interface FeedbackPayload {
  text: string
  images: FeedbackImage[]
  audioBlob?: Blob
  audioTranscript?: string
}

interface Props {
  onSend: (payload: FeedbackPayload) => void | Promise<void>
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  /** Show the audio mic button. Set to false if not needed. */
  enableAudio?: boolean
}

/* ─────────────────────────────────────────
   Recorder helper
───────────────────────────────────────── */
function useAudioRecorder() {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      setBlob(null)
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      recorderRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBlob(b)
        streamRef.current?.getTracks().forEach(t => t.stop())
      }
      mr.start()
      setDuration(0)
      setRecording(true)
      tickRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    } catch (err) {
      console.error('Mic access denied', err)
      alert('Microphone access was denied. Allow access in your browser to record voice notes.')
    }
  }

  function stop() {
    recorderRef.current?.stop()
    setRecording(false)
    if (tickRef.current) clearInterval(tickRef.current)
  }

  function reset() {
    setBlob(null)
    setDuration(0)
  }

  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  return { recording, duration, blob, start, stop, reset }
}

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${m}:${ss}`
}

/* ─────────────────────────────────────────
   FeedbackInput component
───────────────────────────────────────── */
export function FeedbackInput({
  onSend,
  placeholder = "Paste lecturer's comments, or attach a screenshot/voice note…",
  disabled,
  loading,
  className,
  enableAudio = true,
}: Props) {
  const [text, setText] = useState('')
  const [images, setImages] = useState<FeedbackImage[]>([])
  const [focused, setFocused] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const recorder = useAudioRecorder()

  const adjustHeight = useCallback(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 220) + 'px'
  }, [])
  useEffect(() => { adjustHeight() }, [text, adjustHeight])

  // Process an image file into a base64 attachment
  const addImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) {
      alert('Image too large (max 10 MB)')
      return
    }
    const dataUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader()
      reader.onload = e => res(e.target?.result as string)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
    const mediaType = (file.type === 'image/jpg' ? 'image/jpeg' : file.type) as FeedbackImage['mediaType']
    setImages(prev => [...prev, { dataUrl, name: file.name, mediaType }])
  }, [])

  const handleFiles = (list: FileList | File[]) => {
    Array.from(list).forEach(f => {
      if (f.type.startsWith('image/')) addImageFile(f)
    })
  }

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const it of Array.from(items)) {
      if (it.type.startsWith('image/')) {
        const f = it.getAsFile()
        if (f) {
          e.preventDefault()
          addImageFile(f)
        }
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void submit()
    }
  }

  /* ── Audio: stop + transcribe via /api/ai/transcribe ── */
  async function transcribe(blob: Blob): Promise<string> {
    setTranscribing(true)
    try {
      const fd = new FormData()
      fd.append('file', new File([blob], 'voicenote.webm', { type: 'audio/webm' }))
      const res = await fetch('/api/ai/transcribe', { method: 'POST', body: fd })
      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('application/json')) throw new Error('Transcription failed')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Transcription failed')
      return (data.text || '').trim()
    } finally {
      setTranscribing(false)
    }
  }

  /* ── Submit ── */
  const canSend =
    !disabled &&
    !loading &&
    !recorder.recording &&
    !transcribing &&
    (text.trim().length > 0 || images.length > 0 || !!recorder.blob)

  async function submit() {
    if (!canSend) return
    let audioTranscript: string | undefined
    let audioBlob: Blob | undefined
    if (recorder.blob) {
      audioBlob = recorder.blob
      try {
        audioTranscript = await transcribe(recorder.blob)
      } catch (err) {
        console.error(err)
        alert('Could not transcribe voice note — submitting without it.')
      }
    }
    await onSend({
      text: text.trim(),
      images,
      audioBlob,
      audioTranscript,
    })
    setText('')
    setImages([])
    recorder.reset()
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  /* ── Render ── */
  return (
    <div className={cn('relative', className)}>
      <div
        className="glass rounded-2xl p-3 transition-all"
        style={{
          borderColor:
            recorder.recording ? 'rgba(239,68,68,0.6)' :
            focused ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
          boxShadow: focused
            ? '0 0 0 3px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)'
            : '0 4px 24px rgba(0,0,0,0.25)',
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files) }}
      >
        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 px-1">
            {images.map((img, i) => (
              <div key={i} className="relative group anim-entrance-sm">
                <div
                  className="w-16 h-16 rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}
                  aria-label="Remove image"
                >
                  <X size={10} color="#fff" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Audio captured chip */}
        {!recorder.recording && recorder.blob && (
          <div className="flex items-center gap-2 mb-2 px-1 anim-entrance-sm">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--foreground-muted)',
              }}
            >
              <Mic size={11} color="#fff" />
              <span>Voice note · {formatDuration(recorder.duration)}</span>
              <button onClick={() => recorder.reset()} className="ml-1 hover:text-white">
                <X size={11} color="#fff" />
              </button>
            </div>
          </div>
        )}

        {/* Recording state */}
        {recorder.recording && (
          <div className="flex items-center justify-between px-1 py-3">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'pulse 1.2s infinite' }} />
              <span className="text-sm font-mono" style={{ color: '#fff' }}>{formatDuration(recorder.duration)}</span>
              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Recording…</span>
            </div>
            <button
              onClick={() => recorder.stop()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.35)' }}
            >
              <StopCircle size={12} color="#fca5a5" />
              Stop
            </button>
          </div>
        )}

        {/* Textarea */}
        {!recorder.recording && (
          <textarea
            ref={taRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            className="w-full bg-transparent resize-none outline-none px-3 py-2 text-sm leading-relaxed"
            style={{ color: 'var(--foreground)', minHeight: '44px', maxHeight: '220px' }}
          />
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between px-1 pt-2">
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = '' }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={disabled || loading || recorder.recording}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/8 disabled:opacity-30"
              style={{ color: 'var(--foreground-dim)' }}
              title="Attach screenshot or image (also accepts paste / drag-drop)"
              aria-label="Attach image"
            >
              <Paperclip size={15} color="#fff" />
            </button>

            {enableAudio && !recorder.recording && (
              <button
                type="button"
                onClick={() => recorder.start()}
                disabled={disabled || loading || transcribing}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/8 disabled:opacity-30"
                style={{ color: 'var(--foreground-dim)' }}
                title="Record voice note (transcribed by Whisper)"
                aria-label="Record voice note"
              >
                <Mic size={15} color="#fff" />
              </button>
            )}

            {transcribing && (
              <span className="flex items-center gap-1.5 text-[11px] ml-2" style={{ color: 'var(--foreground-muted)' }}>
                <Loader2 size={11} className="animate-spin" />
                Transcribing…
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--foreground-dim)' }}>
              ⌘↵ to send
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all press"
              style={
                canSend
                  ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 2px 10px rgba(124,58,237,0.4)' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'var(--foreground-dim)' }
              }
              aria-label="Send feedback"
            >
              {loading ? <Loader2 size={14} className="animate-spin" color="#fff" /> : <ArrowUp size={14} color={canSend ? '#fff' : '#fff'} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Convenience export for displaying feedback "chips" elsewhere */
export function FeedbackAttachmentChip({ kind, name }: { kind: 'image' | 'audio' | 'file'; name: string }) {
  const Icon = kind === 'image' ? ImageIcon : kind === 'audio' ? Mic : FileText
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}
    >
      <Icon size={9} color="#fff" />
      <span className="truncate max-w-[120px]">{name}</span>
    </span>
  )
}
