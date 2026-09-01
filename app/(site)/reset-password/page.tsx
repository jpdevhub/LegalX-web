'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { apiResetPassword, apiForgotPassword } from '@/lib/api'
import { PasswordRules, isPasswordValid } from '@/components/ui/PasswordRules'

// Supabase issues 8-digit recovery codes. The backend accepts 6–10 so a
// dashboard change can't break resets; this only drives how many boxes we draw.
const OTP_LENGTH = 8
const RESEND_COOLDOWN_SECONDS = 60

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email,    setEmail]    = useState('')
  const [digits,   setDigits]   = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [reveal,   setReveal]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [notice,   setNotice]   = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // /forgot-password hands the address over so the user doesn't retype it.
  useEffect(() => {
    const fromQuery = searchParams.get('email')
    if (fromQuery) setEmail(fromQuery)
  }, [searchParams])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const otp = digits.join('')
  const allRulesPass = useMemo(() => isPasswordValid(password), [password])
  const matches = confirm.length > 0 && password === confirm
  const canSubmit = !loading && email.trim().length > 0 && otp.length === OTP_LENGTH && allRulesPass && matches

  const setDigitAt = (index: number, value: string) => {
    setDigits(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleDigitChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '')
    if (!cleaned) { setDigitAt(index, ''); return }

    // Typing fast, autofill, or a paste landing in one box can deliver several
    // digits at once — spread them across the remaining boxes.
    if (cleaned.length > 1) {
      setDigits(prev => {
        const next = [...prev]
        for (let i = 0; i < cleaned.length && index + i < OTP_LENGTH; i++) {
          next[index + i] = cleaned[i]
        }
        return next
      })
      const landed = Math.min(index + cleaned.length, OTP_LENGTH - 1)
      inputsRef.current[landed]?.focus()
      return
    }

    setDigitAt(index, cleaned)
    if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus()
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault()
      setDigitAt(index - 1, '')
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault()
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = Array(OTP_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  const resend = useCallback(async () => {
    if (cooldown > 0 || !email.trim()) return
    setError(null)
    setNotice(null)
    try {
      await apiForgotPassword(email.trim())
      setNotice('A new code is on its way.')
      setDigits(Array(OTP_LENGTH).fill(''))
      setCooldown(RESEND_COOLDOWN_SECONDS)
      inputsRef.current[0]?.focus()
    } catch (err: any) {
      setError(err?.message || 'Could not send a new code. Please try again.')
    }
  }, [cooldown, email])

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      await apiResetPassword(email.trim(), otp, password)
      router.replace('/login?reset=success')
      // Do NOT clear loading — the page navigates away.
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'Could not update your password. Please try again.')
      setDigits(Array(OTP_LENGTH).fill(''))
      inputsRef.current[0]?.focus()
    }
  }, [canSubmit, email, otp, password, router])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[440px] z-10"
    >
      <div className="bg-[#0E1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-white/8">
          <h1 className="text-2xl font-bold text-white mb-1">Set a new password</h1>
          <p className="text-sm text-slate-400">
            Enter the {OTP_LENGTH}-digit code we emailed you, then choose a new password.
          </p>
        </div>

        <form onSubmit={submit} className="px-6 sm:px-8 py-7 space-y-5" noValidate>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}
          {notice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-300">
              {notice}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@gmail.com"
              className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
              Reset Code
            </label>
            <div className="flex gap-1.5 sm:gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputsRef.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={OTP_LENGTH}
                  value={digit}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleDigitKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={e => e.target.select()}
                  aria-label={`Digit ${i + 1}`}
                  className="min-w-0 flex-1 h-12 text-center rounded-lg bg-white/8 border border-white/15 text-white text-lg font-bold tabular-nums focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-slate-500">Check your inbox and spam folder.</span>
              <button
                type="button"
                onClick={resend}
                disabled={cooldown > 0 || !email.trim()}
                className="text-xs text-[#D4AF37] hover:text-white transition-colors disabled:text-slate-600 disabled:cursor-not-allowed disabled:hover:text-slate-600"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </div>

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
              placeholder="••••••••"
              className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
            />
          </div>

          <PasswordRules password={password} />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide" htmlFor="confirm">
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
            className="w-full h-12 rounded-xl bg-[#D4AF37] hover:bg-[#E5C050] text-[#080B12] font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#D4AF37]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#080B12]/30 border-t-[#080B12] rounded-full animate-spin" />
                Updating…
              </span>
            ) : (
              'Update Password'
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="text-[#D4AF37] hover:text-white font-semibold transition-colors">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[400px] bg-[#D4AF37]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="z-10 w-full flex justify-center">
        <Suspense
          fallback={
            <div className="w-full max-w-[440px] bg-[#0E1220] border border-white/10 rounded-2xl p-8 space-y-4">
              <div className="h-6 bg-white/5 rounded w-1/2" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
              <div className="h-11 bg-white/5 rounded-lg mt-6" />
              <div className="h-12 bg-white/5 rounded-lg" />
              <div className="h-12 bg-[#D4AF37]/20 rounded-xl" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
