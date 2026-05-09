'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:bg-white/90',
        primary: 'bg-[var(--accent)] text-white hover:opacity-90 hover:shadow-[0_4px_20px_var(--accent-glow)]',
        outline: 'bg-transparent border border-[rgba(255,255,255,0.1)] text-white hover:bg-white/[0.04] hover:border-[rgba(255,255,255,0.2)]',
        ghost: 'bg-transparent text-[var(--foreground-muted)] hover:bg-white/[0.05] hover:text-white',
        secondary: 'bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.1)]',
        link: 'bg-transparent text-[var(--accent-light)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6',
        xl: 'h-14 px-7 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
