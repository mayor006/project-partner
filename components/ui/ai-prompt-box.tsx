'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Paperclip, ArrowUp, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptInputBoxProps {
  onSend: (message: string, files?: File[]) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  hint?: string
}

export function PromptInputBox({
  onSend,
  placeholder = 'Message Project Partner…',
  disabled,
  loading,
  className,
  hint,
}: PromptInputBoxProps) {
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [message, adjustHeight])

  const handleSend = useCallback(() => {
    const trimmed = message.trim()
    if ((!trimmed && files.length === 0) || disabled || loading) return
    onSend(trimmed, files.length > 0 ? files : undefined)
    setMessage('')
    setFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.focus()
    }
  }, [message, files, onSend, disabled, loading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const canSend = (message.trim().length > 0 || files.length > 0) && !disabled && !loading

  return (
    <div className={cn('relative', className)}>
      {/* Main box */}
      <div
        className="glass rounded-2xl transition-all duration-200"
        style={{
          borderColor: focused
            ? 'rgba(124, 58, 237, 0.45)'
            : 'rgba(255, 255, 255, 0.08)',
          boxShadow: focused
            ? '0 0 0 3px rgba(124, 58, 237, 0.1), 0 4px 24px rgba(0,0,0,0.4)'
            : '0 4px 24px rgba(0,0,0,0.25)',
        }}
      >
        {/* File chips */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs anim-entrance-sm"
                style={{
                  background: 'rgba(124,58,237,0.12)',
                  color: '#a78bfa',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}
              >
                <Paperclip size={10} />
                <span className="truncate max-w-[140px]">{f.name}</span>
                <button
                  onClick={() => removeFile(i)}
                  className="ml-0.5 hover:text-white transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={1}
          className="w-full bg-transparent resize-none outline-none px-4 py-3.5 text-sm leading-relaxed"
          style={{
            color: 'var(--foreground)',
            minHeight: '48px',
            maxHeight: '180px',
          }}
        />

        {/* Bottom bar */}
        <div
          className="flex items-center justify-between px-3 pb-3"
        >
          {/* Left: file attach */}
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || loading}
              className="p-1.5 rounded-lg transition-all hover:bg-white/8 disabled:opacity-30"
              style={{ color: 'var(--foreground-dim)' }}
              title="Attach file"
              aria-label="Attach file"
            >
              <Paperclip size={15} />
            </button>
          </div>

          {/* Right: hint + send */}
          <div className="flex items-center gap-2.5">
            {hint && (
              <span className="text-[11px]" style={{ color: 'var(--foreground-dim)' }}>
                {hint}
              </span>
            )}
            {!hint && (
              <span className="text-[11px]" style={{ color: 'var(--foreground-dim)' }}>
                ⌘↵ to send
              </span>
            )}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all press"
              style={
                canSend
                  ? {
                      background: 'var(--accent)',
                      color: '#fff',
                      boxShadow: '0 2px 10px rgba(124,58,237,0.4)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--foreground-dim)',
                    }
              }
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ArrowUp size={13} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
