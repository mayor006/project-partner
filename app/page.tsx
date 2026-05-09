import Link from 'next/link'
import {
  BookOpen, Brain, MessageSquare, Shield, Sparkles,
  ArrowRight, Check, Zap, Lock, Globe,
} from 'lucide-react'
import { AuthCharacters } from '@/components/auth/auth-characters'

const stages = [
  { num: '01', label: 'Topic Discovery', icon: Sparkles,
    desc: 'Perplexity-grounded research surfaces fresh, supervisor-ready topics tailored to your department.' },
  { num: '02', label: 'Project Structure', icon: BookOpen,
    desc: 'Full chapter outline with sections, objectives, and methodology — instantly.' },
  { num: '03', label: 'Chapter Writing', icon: Brain,
    desc: 'AI writes 65–80 pages of academic prose with proper Nigerian-academic citations and structure.' },
  { num: '04', label: 'Lecturer Feedback', icon: MessageSquare,
    desc: "Paste your supervisor's comments and AI revises your work in minutes." },
  { num: '05', label: 'Defense Prep', icon: Shield,
    desc: 'Likely defense questions with suggested answers and key arguments.' },
]

const valueProps = [
  { icon: Zap, label: 'Fast', desc: 'Topic to defense-ready in days, not months.' },
  { icon: Lock, label: 'Private', desc: 'Your work is never used for training.' },
  { icon: Globe, label: 'Local', desc: 'Built for Nigerian universities.' },
]

const perks = [
  'No credit card required',
  'Topic discovery is always free',
  'Available 24/7',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Ambient background */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -200, left: '50%', marginLeft: -700, width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: 400, left: '50%', marginLeft: 200, width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      {/* ── Nav ──────────────────────────────── */}
      <nav className="relative z-10 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#fff' }}>
              <Brain size={16} color="#000" strokeWidth={2.2} />
            </div>
            <span className="font-semibold text-base tracking-tight">Project Partner</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-block text-sm px-4 py-2 rounded-xl transition-colors"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 sm:px-5 py-2.5 text-sm font-semibold"
            >
              Get started <ArrowRight size={13} color="#fff" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — split: copy left, characters right (desktop) ── */}
      <section className="relative z-10 w-full">
        <div className="mx-auto grid max-w-6xl items-center gap-8 sm:gap-10 lg:gap-16 lg:grid-cols-[1.1fr_1fr] px-5 sm:px-8 pt-8 sm:pt-12 lg:pt-16 pb-14 sm:pb-16 lg:pb-24">

          {/* Copy */}
          <div className="min-w-0">
            <div
              className="anim-entrance inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] sm:text-xs font-medium mb-6 sm:mb-7 max-w-full"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'var(--foreground)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: '#fff', boxShadow: '0 0 6px #fff', animation: 'pulse 2s infinite' }}
              />
              <span className="truncate">Built for Nigerian university students</span>
            </div>

            <h1
              className="anim-entrance stagger-1 text-[32px] leading-[1.08] sm:text-5xl lg:text-[56px] sm:leading-[1.05] font-bold tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Your AI{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #ffffff 30%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                project supervisor
              </span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              from topic to defense.
            </h1>

            <p
              className="anim-entrance stagger-2 mt-5 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Project Partner guides you through the entire final-year project —
              topic discovery with current research, chapter writing, lecturer feedback,
              and defense preparation.
            </p>

            <div className="anim-entrance stagger-3 mt-8 sm:mt-9 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 sm:px-7 py-3.5 text-sm sm:text-[15px] font-semibold w-full sm:w-auto"
              >
                <Sparkles size={14} color="#fff" />
                Start your project &mdash; Free
              </Link>
              <Link
                href="/login"
                className="btn-ghost rounded-xl px-5 sm:px-7 py-3.5 text-sm sm:text-[15px] font-semibold inline-flex items-center justify-center w-full sm:w-auto"
              >
                Sign in
              </Link>
            </div>

            <div className="anim-entrance stagger-4 mt-6 sm:mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {perks.map(p => (
                <div key={p} className="flex items-center gap-1.5 text-[11px] sm:text-xs" style={{ color: 'var(--foreground-dim)' }}>
                  <Check size={10} color="#fff" className="flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Character stage — clipped, scales with screen size */}
          <div className="relative h-[260px] sm:h-[340px] lg:h-[460px] anim-entrance stagger-2 rounded-[24px] lg:rounded-[28px] overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #6C3FF5 0%, #4A1FA8 55%, #1f0a4f 100%)',
              boxShadow: '0 30px 80px -20px rgba(124,58,237,0.45)',
            }}
          >
            {/* Grid pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute top-1/4 right-1/4 size-48 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="absolute bottom-1/4 left-1/4 size-72 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.05)' }} />

            {/* Scaled character scene — scaled to fit each viewport */}
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <div className="origin-bottom scale-[0.5] sm:scale-[0.65] lg:scale-[0.85]">
                <AuthCharacters />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value props ──────────────────────── */}
      <section className="relative z-10 w-full">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 pb-16 lg:pb-24">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            {valueProps.map((v, i) => {
              const Icon = v.icon
              return (
                <div
                  key={v.label}
                  className="glass anim-entrance flex items-start gap-3 rounded-2xl p-5"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Icon size={16} color="#fff" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5">{v.label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {v.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Stages ─────────────────────────────── */}
      <section className="relative z-10 w-full">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 pb-24 sm:pb-28">
          <div className="text-center mb-12">
            <p className="anim-entrance text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--foreground-dim)' }}>
              The 5-stage flow
            </p>
            <h2 className="anim-entrance stagger-1 text-2xl sm:text-3xl font-bold tracking-tight">
              From zero to submission-ready
            </h2>
            <p className="anim-entrance stagger-2 mt-3 text-sm sm:text-base" style={{ color: 'var(--foreground-muted)' }}>
              A structured AI workflow that mirrors how Nigerian supervisors actually work.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {stages.map((stage, i) => {
              const Icon = stage.icon
              return (
                <div
                  key={stage.num}
                  className="glass anim-entrance group flex items-start gap-5 rounded-2xl p-5 transition-all duration-200 hover:bg-white/[0.05]"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Icon size={18} color="#fff" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2.5">
                      <span className="text-[10px] font-bold tabular-nums" style={{ color: 'var(--foreground-dim)' }}>
                        {stage.num}
                      </span>
                      <span className="text-sm font-semibold">{stage.label}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {stage.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    color="#fff"
                    className="mt-1 flex-shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-60"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="relative z-10 w-full">
        <div className="mx-auto max-w-md px-5 sm:px-8 pb-24 sm:pb-28">
          <div
            className="glass anim-entrance rounded-3xl p-10 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(255,255,255,0.03))',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: '#fff' }}>
              <Brain size={20} color="#000" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold">Ready to finish your project?</h2>
            <p className="mt-2 mb-7 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Join students using Project Partner to ace their final year.
            </p>
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-semibold"
            >
              <Sparkles size={14} color="#fff" />
              Get started for free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer
        className="relative z-10 w-full border-t py-7 text-center text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--foreground-dim)' }}
      >
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Project Partner · Built for students</span>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
