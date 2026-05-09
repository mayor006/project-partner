import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Handles two email-confirmation flows:
 *
 *  1. PKCE flow:        ?code=xxx
 *     → exchangeCodeForSession(code)
 *  2. Magic-link flow:  ?token_hash=xxx&type=signup|email|magiclink
 *     → verifyOtp({ token_hash, type })
 *
 * Both result in a session cookie being set, then redirect to /dashboard
 * (or to ?next=/some-path if provided).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // PKCE
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Magic link / email confirmation
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Nothing to do — fall through to login
  return NextResponse.redirect(`${origin}/login?error=Invalid+or+expired+confirmation+link`)
}
