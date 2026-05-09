import Link from 'next/link'

const stages = [
  { num: '01', label: 'Topic Discovery', desc: 'AI suggests research-worthy topics tailored to your department and level', color: 'from-yellow-500/20 to-yellow-500/5', dot: 'bg-yellow-500' },
  { num: '02', label: 'Project Structure', desc: 'Get a full chapter outline with sections, objectives and methodology', color: 'from-blue-500/20 to-blue-500/5', dot: 'bg-blue-500' },
  { num: '03', label: 'Chapter Writing', desc: 'AI writes 65–80 pages of academic content with proper citations', color: 'from-green-500/20 to-green-500/5', dot: 'bg-green-500' },
  { num: '04', label: 'Lecturer Feedback', desc: 'Paste your supervisor\'s comments and AI revises your work instantly', color: 'from-orange-500/20 to-orange-500/5', dot: 'bg-orange-500' },
  { num: '05', label: 'Defense Prep', desc: 'Get likely defense questions with suggested answers and key arguments', color: 'from-red-500/20 to-red-500/5', dot: 'bg-red-500' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <span className="text-white text-sm font-bold">PP</span>
          </div>
          <span className="font-semibold text-lg">Project Partner</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--secondary-foreground)' }}>
            Sign In
          </Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', color: 'white' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border" style={{ borderColor: '#7c3aed40', background: '#7c3aed15', color: '#a78bfa' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Your AI-Powered Project Supervisor
        </div>
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight mb-6">
          From Topic to{' '}
          <span style={{ color: 'var(--primary)' }}>Defense.</span>
          <br />We Guide Every Step.
        </h1>
        <p className="text-lg max-w-xl mb-10" style={{ color: 'var(--muted-foreground)' }}>
          Project Partner guides you through your entire final year project — topic discovery, chapter writing, supervisor feedback, and defense prep. Available 24/7.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/signup" className="px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--primary)' }}>
            Start Your Project — Free
          </Link>
          <Link href="/login" className="px-6 py-3 rounded-xl font-semibold transition-colors border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            Sign In
          </Link>
        </div>
        <p className="mt-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>Topic discovery is always free. No credit card required.</p>
      </section>

      {/* Stages */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-center text-2xl font-bold mb-12">5 Stages to a Finished Project</h2>
        <div className="grid gap-4">
          {stages.map((stage) => (
            <div key={stage.num} className={`flex items-start gap-5 p-5 rounded-2xl border bg-gradient-to-r ${stage.color}`} style={{ borderColor: 'var(--border)' }}>
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                {stage.num}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <span className="font-semibold">{stage.label}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-24 px-6">
        <div className="max-w-lg mx-auto p-10 rounded-3xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-3xl font-bold mb-3">Ready to finish your project?</h2>
          <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>Join students already using Project Partner to ace their final year.</p>
          <Link href="/signup" className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--primary)' }}>
            Get Started for Free
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-sm border-t" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
        © {new Date().getFullYear()} Project Partner · Built for students
      </footer>
    </div>
  )
}
