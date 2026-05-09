'use client'

import { useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (next: string) => void
  onComplete?: (code: string) => void
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus = true,
  className,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  const setAt = (i: number, ch: string) => {
    const next = value.padEnd(length, ' ').split('')
    next[i] = ch
    const joined = next.join('').replace(/ +$/, '')
    onChange(joined)
    if (joined.length === length && onComplete) onComplete(joined)
  }

  const handleChange = (i: number, raw: string) => {
    const ch = raw.replace(/\D/g, '').slice(-1) // single digit
    if (!ch) return
    setAt(i, ch)
    if (i < length - 1) refs.current[i + 1]?.focus()
  }

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const arr = value.padEnd(length, ' ').split('')
      if (arr[i] && arr[i] !== ' ') {
        arr[i] = ''
        onChange(arr.join('').replace(/ +$/, ''))
      } else if (i > 0) {
        const prev = i - 1
        const arr2 = value.padEnd(length, ' ').split('')
        arr2[prev] = ''
        onChange(arr2.join('').replace(/ +$/, ''))
        refs.current[prev]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault()
      refs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      e.preventDefault()
      refs.current[i + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted)
    if (pasted.length === length && onComplete) onComplete(pasted)
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className={cn('flex items-center justify-center gap-2 sm:gap-3', className)}>
      {Array.from({ length }).map((_, i) => {
        const ch = value[i] ?? ''
        return (
          <input
            key={i}
            ref={el => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            value={ch}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            onPaste={handlePaste}
            className={cn(
              'w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl outline-none transition-all',
              'bg-[rgba(255,255,255,0.05)] text-white border',
              ch ? 'border-white/40' : 'border-[rgba(255,255,255,0.08)]',
              'focus:border-white/60 focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]',
              'disabled:opacity-50',
            )}
          />
        )
      })}
    </div>
  )
}
