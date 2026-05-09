'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brain, Eye, EyeOff, Loader2, Mail } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: 'var(--bg-deep)' }}
      >
        <div className="blob blob-1 w-[400px] h-[400px] -top-40 -left-20 opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent 70%)' }} />

        <div className="relative z-10 glass-strong rounded-3xl p-10 max-w-sm w-full text-center anim-scale">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--success-subtle)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <Mail size={24} style={{ color: 'var(--success)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--foreground-muted)' }}>
            We sent a confirmation link to{' '}
            <strong className="text-white">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--accent-light)' }}
          >
            Back to Sign In →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-deep)' }}
    >
      {/* Ambient blobs */}
      <div className="blob blob-1 w-[400px] h-[400px] -top-40 -right-20 opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
      <div className="blob blob-2 w-[300px] h-[300px] bottom-0 -left-20 opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm anim-scale">
        <div className="glass-strong rounded-3xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: '#fff' }}
              >
                <Brain size={20} color="#000" strokeWidth={2.2} />
              </div>
            </Link>
            <h1 className="text-xl font-bold mb-1">Create your account</h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Start your final year project journey
            </p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }} htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ada Okonkwo"
                required
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }} htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{ color: 'var(--foreground-dim)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm anim-entrance-sm"
                style={{
                  background: 'var(--error-subtle)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--foreground-muted)' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold transition-colors hover:text-white"
              style={{ color: 'var(--accent-light)' }}
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-xs transition-colors"
            style={{ color: 'var(--foreground-dim)' }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
