'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { apiForgotPassword } from '@/lib/api'

const LINK_ERRORS: Record<string, string> = {
  invalid_link: 'That reset link is no longer valid. Request a fresh code below.',
  expired_link: 'That reset link has expired. Request a fresh code below.',
}

function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // Surfaces the reason a stale link from the old email flow bounced back here.
  useEffect(() => {
    const code = searchParams.get('error')
    if (code) setError(LINK_ERRORS[code] ?? LINK_ERRORS.invalid_link)
  }, [searchParams])

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setError(null)
    try {
      const trimmed = email.trim()
      await apiForgotPassword(trimmed)
      // Hand the address to the code-entry step so it doesn't have to be
      // retyped. The response is deliberately identical whether or not the
      // account exists, so we always advance.
      router.push(`/reset-password?email=${encodeURIComponent(trimmed)}`)
      // Do NOT clear loading — the page navigates away.
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'Could not send the reset code. Please try again.')
    }
  }, [email, loading, router])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[420px]"
    >
      <div className="bg-[#0E1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        <div className="px-7 sm:px-8 pt-8 pb-6 border-b border-white/8">
          <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
          <p className="text-sm text-slate-400">
            Enter your email and we’ll send you a one-time reset code.
          </p>
        </div>

        <div className="px-7 sm:px-8 py-7">
          <form onSubmit={submit} className="space-y-4" noValidate>
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
              disabled={loading}
              className="w-full h-12 mt-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C050] text-[#080B12] font-bold text-sm tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#080B12]/30 border-t-[#080B12] rounded-full animate-spin" />
                  Sending…
                </span>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have a code?{' '}
            <Link href="/reset-password" className="text-[#D4AF37] hover:text-white font-semibold transition-colors">
              Enter it here
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
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
