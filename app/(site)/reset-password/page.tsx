'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { apiResetPassword } from '@/lib/api'

type Phase = 'checking' | 'ready' | 'submitting'

const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'upper',  label: 'One uppercase letter',  test: (p: string) => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number',            test: (p: string) => /[0-9]/.test(p) },
] as const

export default function ResetPasswordPage() {
  const router = useRouter()

  const [phase,       setPhase]       = useState<Phase>('checking')
  const [accessToken, setAccessToken] = useState('')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [reveal,      setReveal]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  // Supabase returns the recovery tokens in the URL hash (implicit flow).
  // Read them once on mount, then scrub the hash so the token does not sit in
  // the address bar where it can be copied, bookmarked, or leaked via Referer.
  useEffect(() => {
    const bail = (code: 'invalid_link' | 'expired_link') =>
      router.replace(`/forgot-password?error=${code}`)

    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
    const params = new URLSearchParams(hash)
    const query = new URLSearchParams(window.location.search)

    const errorCode = params.get('error_code') || query.get('error_code')
    const errorName = params.get('error') || query.get('error')
    if (errorCode || errorName) {
      bail(errorCode === 'otp_expired' ? 'expired_link' : 'invalid_link')
      return
    }

    const token = params.get('access_token')
    const type = params.get('type')
    if (!token || type !== 'recovery') {
      bail('invalid_link')
      return
    }

    setAccessToken(token)
    setPhase('ready')
    window.history.replaceState(null, '', window.location.pathname)
  }, [router])

  const rulesPassed = useMemo(() => RULES.map(r => r.test(password)), [password])
  const allRulesPass = rulesPassed.every(Boolean)
  const matches = confirm.length > 0 && password === confirm
  const canSubmit = phase === 'ready' && allRulesPass && matches

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setPhase('submitting')
    setError(null)
    try {
      await apiResetPassword(accessToken, password)
      router.replace('/login?reset=success')
      // Do NOT reset phase — the page navigates away.
    } catch (err: any) {
      setPhase('ready')
      setError(err?.message || 'Could not update your password. Please request a new reset link.')
    }
  }, [canSubmit, accessToken, password, router])

  if (phase === 'checking') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="w-4 h-4 border-2 border-white/15 border-t-[#D4AF37] rounded-full animate-spin" />
          Verifying your reset link…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[400px] bg-[#D4AF37]/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="bg-[#0E1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

          <div className="px-7 sm:px-8 pt-8 pb-6 border-b border-white/8">
            <h1 className="text-2xl font-bold text-white mb-1">Set a new password</h1>
            <p className="text-sm text-slate-400">Choose a password you haven’t used before.</p>
          </div>

          <form onSubmit={submit} className="px-7 sm:px-8 py-7 space-y-4" noValidate>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="password">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={() => setReveal(r => !r)}
                  className="text-xs text-slate-400 hover:text-[#D4AF37] transition-colors"
                >
                  {reveal ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="password"
                type={reveal ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                autoFocus
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
              />
            </div>

            <ul className="space-y-1.5 pt-0.5">
              {RULES.map((rule, i) => {
                const ok = rulesPassed[i]
                return (
                  <li
                    key={rule.key}
                    className={`flex items-center gap-2 text-xs transition-colors ${ok ? 'text-emerald-400' : 'text-slate-500'}`}
                  >
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      suppressHydrationWarning
                    >
                      {ok ? <path d="M20 6L9 17l-5-5" /> : <circle cx="12" cy="12" r="9" strokeWidth="2" />}
                    </svg>
                    {rule.label}
                  </li>
                )
              })}
            </ul>

            <div>
              <label
                className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide"
                htmlFor="confirm"
              >
                Confirm Password
              </label>
              <input
                id="confirm"
                type={reveal ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full h-11 px-3.5 rounded-lg bg-white/8 border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:bg-white/10 transition-all ${
                  confirm.length > 0 && !matches
                    ? 'border-red-500/50 focus:border-red-500/70'
                    : 'border-white/15 focus:border-[#D4AF37]/60'
                }`}
              />
              {confirm.length > 0 && !matches && (
                <p className="mt-1.5 text-xs text-red-400">Passwords don’t match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-12 mt-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C050] text-[#080B12] font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#D4AF37]"
            >
              {phase === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#080B12]/30 border-t-[#080B12] rounded-full animate-spin" />
                  Updating…
                </span>
              ) : (
                'Update Password'
              )}
            </button>

            <p className="pt-2 text-center text-sm text-slate-500">
              <Link href="/login" className="text-[#D4AF37] hover:text-white font-semibold transition-colors">
                Back to sign in
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
