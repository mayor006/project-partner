import Link from 'next/link'
import {
  BookOpen, Brain, MessageSquare, Shield, Sparkles,
  ArrowRight, Check,
} from 'lucide-react'

const stages = [
  { num: '01', label: 'Topic Discovery', icon: Sparkles,
    desc: 'AI surfaces research-worthy topics tailored to your department and academic level.' },
  { num: '02', label: 'Project Structure', icon: BookOpen,
    desc: 'Full chapter outline with sections, objectives, and methodology — instantly.' },
  { num: '03', label: 'Chapter Writing', icon: Brain,
    desc: 'AI writes 65–80 pages of academic prose with proper citations and structure.' },
  { num: '04', label: 'Lecturer Feedback', icon: MessageSquare,
    desc: "Paste your supervisor's comments and AI revises your work in minutes." },
  { num: '05', label: 'Defense Prep', icon: Shield,
    desc: 'Likely defense questions with suggested answers and key arguments.' },
]

const perks = [
  'No credit card required',
  'Topic discovery is always free',
  'Available 24/7',
  'Built for Nigerian universities',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Ambient blobs */}
      <div
        className="blob blob-1 pointer-events-none absolute"
        style={{
          width: 500, height: 500, top: -160, left: '50%',
          marginLeft: -800, opacity: 0.07,
          background: 'radial-gradient(circle, #7c3aed, transparent 70%)',
        }}
      />
      <div
        className="blob blob-2 pointer-events-none absolute"
        style={{
          width: 400, height: 400, top: '30%', left: '50%',
          marginLeft: 400, opacity: 0.05,
          background: 'radial-gradient(circle, #a855f7, transparent 70%)',
        }}
      />

      {/* ── Nav ──────────────────────────────── */}
      <nav className="relative z-10 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: '#fff' }}
            >
              <Brain size={16} color="#000" strokeWidth={2.2} />
            </div>
            <span className="text-base font-semibold tracking-tight">Project Partner</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm transition-colors"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm"
            >
              Get started <ArrowRight size={13} color="#fff" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative z-10 w-full">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-20 text-center">
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium anim-entrance"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'var(--foreground)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: '#fff', boxShadow: '0 0 6px #fff', animation: 'pulse 2s infinite' }}
            />
            Your AI-Powered Project Supervisor
          </div>

          <h1
            className="anim-entrance stagger-1 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
            style={{ color: 'var(--foreground)' }}
          >
            From Topic to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #ffffff, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Defense.
            </span>
            <br />
            We Guide Every Step.
          </h1>

          <p
            className="anim-entrance stagger-2 mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Project Partner guides you through your entire final year project —
            topic discovery, chapter writing, supervisor feedback, and defense prep.
            Available 24 hours a day.
          </p>

          <div className="anim-entrance stagger-3 mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold"
            >
              <Sparkles size={15} color="#fff" />
              Start Your Project — Free
            </Link>
            <Link
              href="/login"
              className="btn-ghost rounded-xl px-7 py-3.5 text-[15px] font-semibold"
            >
              Sign in
            </Link>
          </div>

          <div className="anim-entrance stagger-4 mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {perks.map(p => (
              <div
                key={p}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--foreground-dim)' }}
              >
                <Check size={11} color="#fff" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stages ───────────────────────────── */}
      <section className="relative z-10 w-full pb-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <h2 className="anim-entrance text-2xl font-bold sm:text-3xl">
              5 Stages to a Finished Project
            </h2>
            <p
              className="anim-entrance stagger-1 mt-3 text-sm"
              style={{ color: 'var(--foreground-muted)' }}
            >
              A structured AI workflow from zero to submission-ready.
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
                      <span
                        className="text-[10px] font-bold tabular-nums"
                        style={{ color: 'var(--foreground-dim)' }}
                      >
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
      <section className="relative z-10 w-full pb-28">
        <div className="mx-auto max-w-md px-6">
          <div
            className="glass anim-entrance rounded-3xl p-10 text-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <div
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: '#fff' }}
            >
              <Brain size={20} color="#000" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold">Ready to finish your project?</h2>
            <p className="mt-2 mb-8 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Join students already using Project Partner to ace their final year.
            </p>
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold"
            >
              <Sparkles size={14} color="#fff" />
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer
        className="relative z-10 w-full border-t py-6 text-center text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--foreground-dim)' }}
      >
        © {new Date().getFullYear()} Project Partner · Built for students
      </footer>
    </div>
  )
}
