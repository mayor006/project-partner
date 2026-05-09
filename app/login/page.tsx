'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brain, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthCharacters } from '@/components/auth/auth-characters'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
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
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--bg-deep)' }}>
      {/* ── Left: Character Stage (desktop only) ───────────── */}
      <div
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10"
        style={{
          background:
            'linear-gradient(135deg, #6C3FF5 0%, #4A1FA8 50%, #1f0a4f 100%)',
        }}
      >
        {/* Subtle grid + glow decorations */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/4 right-1/4 size-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute bottom-1/4 left-1/4 size-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.04)' }} />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-2 text-white">
          <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: '#fff' }}>
            <Brain size={16} color="#000" strokeWidth={2.2} />
          </div>
          <span className="text-base font-semibold tracking-tight">Project Partner</span>
        </div>

        {/* Characters */}
        <div className="relative z-10 flex items-end justify-center">
          <AuthCharacters
            isTyping={isTyping}
            password={password}
            showPassword={showPassword}
          />
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-white/55">
          <span>© {new Date().getFullYear()} Project Partner</span>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>

      {/* ── Right: Form ──────────────────────────────────────── */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-base font-semibold mb-12">
            <div className="size-8 rounded-lg flex items-center justify-center" style={{ background: '#fff' }}>
              <Brain size={14} color="#000" strokeWidth={2.2} />
            </div>
            <span>Project Partner</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Please enter your details to sign in
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  autoComplete="current-password"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-xs normal-case tracking-normal cursor-pointer text-[var(--foreground-muted)]">
                  Remember me
                </Label>
              </div>
              <Link href="/login" className="text-xs font-medium transition-colors" style={{ color: 'var(--accent-light)' }}>
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl text-sm anim-entrance-sm"
                style={{ background: 'var(--error-subtle)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" color="#fca5a5" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Signing in…</>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: 'var(--foreground-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold transition-colors hover:text-white" style={{ color: 'var(--accent-light)' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
