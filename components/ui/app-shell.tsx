'use client'

import { useState, type ReactNode } from 'react'
import { Menu, Brain } from 'lucide-react'
import { Sheet, SheetContent } from './sheet'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
  /** Optional title shown in the mobile top bar (defaults to "Project Partner") */
  mobileTitle?: ReactNode
}

/**
 * Responsive app shell:
 *   • desktop (md+): persistent left sidebar (264px) + main content
 *   • mobile: hamburger top bar + slide-in drawer for the same sidebar
 */
export function AppShell({ sidebar, children, mobileTitle }: AppShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex glass-sidebar w-64 flex-shrink-0 flex-col relative z-10"
        style={{ height: '100vh' }}
      >
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 md:hidden">
          {/* Mount the same sidebar; clicking any link closes the drawer */}
          <div onClick={() => setOpen(false)} className="flex flex-col h-full">
            {sidebar}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar (hidden on md+) */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{
            borderColor: 'var(--border)',
            background: 'rgba(6,6,11,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-1 rounded-lg transition-colors hover:bg-white/8 active:bg-white/12"
            aria-label="Open menu"
          >
            <Menu size={18} color="#fff" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#fff' }}
            >
              <Brain size={12} color="#000" strokeWidth={2.2} />
            </div>
            <span className="font-semibold text-sm truncate">
              {mobileTitle ?? 'Project Partner'}
            </span>
          </div>
        </header>

        {/* Scroll container — overflow-x-hidden clips ambient blobs that
            sit slightly past the viewport edge for visual depth. */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  )
}
