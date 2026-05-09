'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brain, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-deep)' }}
    >
      {/* Ambient blobs */}
      <div
        className="blob blob-1 w-[400px] h-[400px] -top-40 -left-20 opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }}
      />
      <div
        className="blob blob-2 w-[300px] h-[300px] bottom-0 -right-20 opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-sm anim-scale">
        {/* Card */}
        <div className="glass-strong rounded-3xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center glow-accent-sm"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
              >
                <Brain size={20} className="text-white" />
              </div>
            </Link>
            <h1 className="text-xl font-bold mb-1">Welcome back</h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Sign in to your Project Partner account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                  placeholder="••••••••"
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
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--foreground-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold transition-colors hover:text-white"
              style={{ color: 'var(--accent-light)' }}
            >
              Sign up free
            </Link>
          </p>
        </div>

        {/* Back link */}
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
