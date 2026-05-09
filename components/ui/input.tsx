'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-12 w-full rounded-[10px] px-4 text-sm outline-none transition-all',
        'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white',
        'placeholder:text-[var(--foreground-dim)]',
        'focus:border-[rgba(255,255,255,0.35)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
