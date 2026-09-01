'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { apiForgotPassword } from '@/lib/api'

const RESEND_COOLDOWN_SECONDS = 60

const LINK_ERRORS: Record<string, string> = {
  invalid_link: 'That reset link was invalid or incomplete. Request a fresh one below.',
  expired_link: 'That reset link has expired. Request a fresh one below.',
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams()

  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [cooldown,  setCooldown]  = useState(0)

  // Surface the reason /reset-password bounced the user back here.
  useEffect(() => {
    const code = searchParams.get('error')
    if (code) setError(LINK_ERRORS[code] ?? LINK_ERRORS.invalid_link)
  }, [searchParams])

  // Countdown that re-enables the resend button.
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || cooldown > 0) return

    setLoading(true)
    setError(null)
    try {
      await apiForgotPassword(email.trim())
      setSent(true)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err: any) {
      setError(err?.message || 'Could not send the reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [email, loading, cooldown])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[420px]"
    >
      <div className="bg-[#0E1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        <div className="px-7 sm:px-8 pt-8 pb-6 border-b border-white/8">
          <h1 className="text-2xl font-bold text-white mb-1">
            {sent ? 'Check your inbox' : 'Reset your password'}
          </h1>
          <p className="text-sm text-slate-400">
            {sent
              ? 'We sent a secure link to your email address.'
              : 'Enter your email and we’ll send you a secure reset link.'}
          </p>
        </div>

        <div className="px-7 sm:px-8 py-7">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-center"
              >
                {/* Animated envelope */}
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
                  className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-[#D4AF37]/12 border border-[#D4AF37]/25 flex items-center justify-center"
                >
                  <motion.svg
                    className="w-8 h-8 text-[#D4AF37]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    suppressHydrationWarning
                  >
                    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                    <motion.path
                      d="M3 7l9 6 9-6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.25, duration: 0.55, ease: 'easeInOut' }}
                    />
                  </motion.svg>
                </motion.div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  If an account exists for{' '}
                  <span className="text-white font-semibold break-all">{email.trim()}</span>, a reset
                  link is on its way.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  The link is valid for 1 hour. Check your spam folder if it doesn’t arrive.
                </p>

                {error && (
                  <div className="mt-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 text-left">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={loading || cooldown > 0}
                  className="w-full h-11 mt-6 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : loading ? 'Sending…' : 'Resend link'}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={submit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
                noValidate
              >
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    placeholder="you@gmail.com"
                    className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="w-full h-12 mt-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C050] text-[#080B12] font-bold text-sm tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#080B12]/30 border-t-[#080B12] rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : cooldown > 0 ? (
                    `Try again in ${cooldown}s`
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remembered it?{' '}
            <Link href="/login" className="text-[#D4AF37] hover:text-white font-semibold transition-colors">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[400px] bg-[#D4AF37]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="z-10 w-full flex justify-center">
        <Suspense
          fallback={
            <div className="w-full max-w-[420px] bg-[#0E1220] border border-white/10 rounded-2xl p-8 space-y-4">
              <div className="h-6 bg-white/5 rounded w-1/2" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
              <div className="h-11 bg-white/5 rounded-lg mt-6" />
              <div className="h-12 bg-[#D4AF37]/20 rounded-xl" />
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
