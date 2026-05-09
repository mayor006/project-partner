'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brain, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, Mail, RotateCcw, ExternalLink, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OtpInput } from '@/components/ui/otp-input'
import { AuthCharacters } from '@/components/auth/auth-characters'

type Step = 'form' | 'otp'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      // Friendly error mapping
      const msg = error.message
      if (/already registered|already been registered|already exists/i.test(msg)) {
        setError('That email is already registered. Try signing in instead.')
      } else if (/rate limit|too many/i.test(msg)) {
        setError('Too many requests. Please wait a few minutes before trying again.')
      } else {
        setError(msg)
      }
      setLoading(false)
      return
    }

    // Detect "already registered, unconfirmed" — Supabase returns user with empty identities
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError('That email is already in use. If you signed up but never verified, try resending below.')
      setStep('otp')
      setLoading(false)
      return
    }

    setInfo(`We sent a verification email to ${email}.`)
    setStep('otp')
    setLoading(false)
  }

  async function sendMagicLinkInstead() {
    setError('')
    setInfo('')
    setResending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setInfo(`Sign-in link sent to ${email}. Check your inbox and click it to log in.`)
    }
    setResending(false)
  }

  async function handleVerifyOtp(code: string) {
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      setOtp('')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function resendOtp() {
    setError('')
    setInfo('')
    setResending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) {
      setError(error.message)
    } else {
      setInfo(`Sent a new code to ${email}.`)
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--bg-deep)' }}>
      {/* ── Left: Character stage (desktop only) ───────────── */}
      <div
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10"
        style={{
          background:
            'linear-gradient(135deg, #6C3FF5 0%, #4A1FA8 50%, #1f0a4f 100%)',
        }}
      >
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

        <div className="relative z-10 flex items-center gap-2 text-white">
          <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: '#fff' }}>
            <Brain size={16} color="#000" strokeWidth={2.2} />
          </div>
          <span className="text-base font-semibold tracking-tight">Project Partner</span>
        </div>

        <div className="relative z-10 flex items-end justify-center">
          <AuthCharacters
            isTyping={isTyping}
            password={password}
            showPassword={showPassword}
          />
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-white/55">
          <span>© {new Date().getFullYear()} Project Partner</span>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>

      {/* ── Right: Form / OTP ──────────────────────────────── */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-base font-semibold mb-10">
            <div className="size-8 rounded-lg flex items-center justify-center" style={{ background: '#fff' }}>
              <Brain size={14} color="#000" strokeWidth={2.2} />
            </div>
            <span>Project Partner</span>
          </div>

          {step === 'form' ? (
            <>
              <div className="text-center mb-8 anim-entrance">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Create your account</h1>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  Start your final year project journey
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-5 anim-entrance stagger-1">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ada Okonkwo"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    autoComplete="name"
                  />
                </div>

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
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      required
                      minLength={8}
                      autoComplete="new-password"
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

                {error && (
                  <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl text-sm anim-entrance-sm"
                    style={{ background: 'var(--error-subtle)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" color="#fca5a5" />
                    <span className="flex-1">{error}</span>
                  </div>
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 size={14} className="animate-spin" /> Creating account…</>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              <p className="text-center text-sm mt-8" style={{ color: 'var(--foreground-muted)' }}>
                Already have an account?{' '}
                <Link href="/login" className="font-semibold transition-colors hover:text-white" style={{ color: 'var(--accent-light)' }}>
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            /* OTP STEP */
            <div className="anim-entrance">
              <button
                onClick={() => { setStep('form'); setOtp(''); setError(''); setInfo('') }}
                className="flex items-center gap-1.5 text-xs mb-6 transition-colors"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <ArrowLeft size={12} /> Back
              </button>

              <div className="flex justify-center mb-5">
                <div
                  className="size-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Mail size={22} color="#fff" strokeWidth={1.6} />
                </div>
              </div>

              <div className="text-center mb-7">
                <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                  We sent a verification email to{' '}
                  <span className="text-white font-medium">{email}</span>
                </p>
                <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--foreground-dim)' }}>
                  Enter the 6-digit code below, <span className="text-white">or</span> click the link in the email to confirm.
                </p>
              </div>

              <div className="mb-5">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleVerifyOtp}
                  disabled={loading}
                />
              </div>

              {info && !error && (
                <div
                  className="flex items-start gap-2 px-3.5 py-3 mb-4 rounded-xl text-xs anim-entrance-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}
                >
                  <Mail size={13} className="flex-shrink-0 mt-0.5" color="#fff" />
                  <span className="flex-1">{info}</span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 px-3.5 py-3 mb-4 rounded-xl text-sm anim-entrance-sm"
                  style={{ background: 'var(--error-subtle)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" color="#fca5a5" />
                  <span className="flex-1">{error}</span>
                </div>
              )}

              <Button
                onClick={() => handleVerifyOtp(otp)}
                disabled={otp.length !== 6 || loading}
                variant="primary"
                size="lg"
                className="w-full mb-3"
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Verifying…</>
                ) : (
                  'Verify & continue'
                )}
              </Button>

              {/* Fallback: send magic link instead */}
              <Button
                onClick={sendMagicLinkInstead}
                disabled={resending}
                variant="outline"
                size="lg"
                className="w-full"
                type="button"
              >
                {resending ? (
                  <><Loader2 size={13} className="animate-spin" /> Sending…</>
                ) : (
                  <><Send size={13} color="#fff" /> Email me a sign-in link instead</>
                )}
              </Button>

              <div className="text-center mt-6 flex items-center justify-center gap-2">
                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Didn&apos;t get the email?</span>
                <button
                  onClick={resendOtp}
                  disabled={resending}
                  className="text-xs font-semibold flex items-center gap-1 transition-colors hover:text-white disabled:opacity-50"
                  style={{ color: 'var(--accent-light)' }}
                >
                  {resending ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={10} />}
                  Resend
                </button>
              </div>

              <p className="text-center text-[11px] mt-5" style={{ color: 'var(--foreground-dim)' }}>
                Check your spam/junk folder if it&apos;s not in your inbox.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
