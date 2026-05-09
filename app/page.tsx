import Link from 'next/link'
import { BookOpen, Brain, MessageSquare, Shield, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

const stages = [
  {
    num: '01', label: 'Topic Discovery', icon: Sparkles,
    desc: 'AI surfaces research-worthy topics tailored to your department and academic level.',
    color: '#f59e0b', glow: 'rgba(245,158,11,0.15)',
  },
  {
    num: '02', label: 'Project Structure', icon: BookOpen,
    desc: 'Full chapter outline with sections, objectives, and methodology — instantly.',
    color: '#3b82f6', glow: 'rgba(59,130,246,0.15)',
  },
  {
    num: '03', label: 'Chapter Writing', icon: Brain,
    desc: 'AI writes 65–80 pages of academic prose with proper citations and structure.',
    color: '#7c3aed', glow: 'rgba(124,58,237,0.2)',
  },
  {
    num: '04', label: 'Lecturer Feedback', icon: MessageSquare,
    desc: 'Paste your supervisor\'s comments and AI revises your work in minutes.',
    color: '#f97316', glow: 'rgba(249,115,22,0.15)',
  },
  {
    num: '05', label: 'Defense Prep', icon: Shield,
    desc: 'Likely defense questions with suggested answers and key arguments.',
    color: '#22c55e', glow: 'rgba(34,197,94,0.15)',
  },
]

const perks = [
  'No credit card required',
  'Topic discovery is always free',
  'Available 24/7',
  'Built for Nigerian universities',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Ambient blobs */}
      <div className="blob blob-1 w-[500px] h-[500px] -top-40 -left-40 opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
      <div className="blob blob-2 w-[400px] h-[400px] top-1/3 -right-32 opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
      <div className="blob blob-3 w-[350px] h-[350px] bottom-0 left-1/3 opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center glow-accent-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-semibold text-base tracking-tight">Project Partner</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-xl transition-colors"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5"
          >
            Get started <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-20 max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8 anim-entrance"
          style={{
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.25)',
            color: '#a78bfa',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#a78bfa', boxShadow: '0 0 6px #a78bfa', animation: 'pulse 2s infinite' }}
          />
          Your AI-Powered Project Supervisor
        </div>

        <h1
          className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6 anim-entrance stagger-1"
          style={{ color: 'var(--foreground)' }}
        >
          From Topic to{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Defense.
          </span>
          <br />We Guide Every Step.
        </h1>

        <p
          className="text-lg max-w-2xl mb-10 leading-relaxed anim-entrance stagger-2"
          style={{ color: 'var(--foreground-muted)' }}
        >
          Project Partner guides you through your entire final year project —
          topic discovery, chapter writing, supervisor feedback, and defense prep.
          Available 24 hours a day.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 anim-entrance stagger-3">
          <Link
            href="/signup"
            className="btn-primary px-7 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            style={{ fontSize: '15px' }}
          >
            <Sparkles size={15} />
            Start Your Project — Free
          </Link>
          <Link
            href="/login"
            className="btn-ghost px-7 py-3.5 rounded-xl text-sm font-semibold"
            style={{ fontSize: '15px' }}
          >
            Sign in
          </Link>
        </div>

        {/* Perks */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 anim-entrance stagger-4">
          {perks.map(p => (
            <div key={p} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--foreground-dim)' }}>
              <CheckCircle size={11} style={{ color: 'var(--success)' }} />
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* Stages section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2
            className="text-2xl font-bold mb-3 anim-entrance"
            style={{ color: 'var(--foreground)' }}
          >
            5 Stages to a Finished Project
          </h2>
          <p className="text-sm anim-entrance stagger-1" style={{ color: 'var(--foreground-muted)' }}>
            A structured AI workflow from zero to submission-ready.
          </p>
        </div>

        <div className="grid gap-3">
          {stages.map((stage, i) => {
            const Icon = stage.icon
            return (
              <div
                key={stage.num}
                className="glass flex items-start gap-5 p-5 rounded-2xl anim-entrance transition-all duration-200 hover:border-white/15 hover:bg-white/5 group"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200"
                  style={{ background: stage.glow, border: `1px solid ${stage.color}25` }}
                >
                  <Icon size={18} style={{ color: stage.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span
                      className="text-[10px] font-bold tabular-nums"
                      style={{ color: 'var(--foreground-dim)' }}
                    >
                      {stage.num}
                    </span>
                    <span className="font-semibold text-sm">{stage.label}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                    {stage.desc}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-x-1 group-hover:translate-x-0"
                  style={{ color: 'var(--foreground-dim)' }}
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 text-center pb-28 px-6">
        <div
          className="glass max-w-lg mx-auto p-12 rounded-3xl anim-entrance"
          style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.2)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            <Brain size={20} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ready to finish your project?</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--foreground-muted)' }}>
            Join students already using Project Partner to ace their final year.
          </p>
          <Link
            href="/signup"
            className="btn-primary px-8 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2"
          >
            <Sparkles size={14} />
            Get Started for Free
          </Link>
        </div>
      </section>

      <footer
        className="relative z-10 text-center py-6 text-xs border-t"
        style={{ borderColor: 'var(--border)', color: 'var(--foreground-dim)' }}
      >
        © {new Date().getFullYear()} Project Partner · Built for students
      </footer>
    </div>
  )
}
