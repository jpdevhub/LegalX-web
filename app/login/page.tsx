'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { apiLogin, apiGetLawyerMe } from '@/lib/api'
import { LXLogoMark } from '@/components/ui/LXLogo'

function LoginForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect_to') || '/'
  const message      = searchParams.get('message')
  const mountedRef   = useRef(true)

  // Shown after a successful password reset, then auto-dismissed.
  const [resetToast, setResetToast] = useState(searchParams.get('reset') === 'success')

  useEffect(() => {
    if (!resetToast) return
    const timer = setTimeout(() => setResetToast(false), 5000)
    return () => clearTimeout(timer)
  }, [resetToast])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const user = await apiLogin(email, password)
      // A redirect_to set by the route guard means the user was interrupted
      // mid-journey — send them back there whatever their role, so a lawyer
      // bounced out of a call room returns to the call and not their dashboard.
      const hasRedirect = redirectTo !== '/'

      if (user.role === 'lawyer') {
        // Onboarding gate still wins: an unverified lawyer can't use the
        // portal, so returning them to a deep link would only fail again.
        const lawyerMe = await apiGetLawyerMe()
        if (!lawyerMe || !lawyerMe.onboarding_complete) {
          router.push('/onboarding/lawyer')
        } else {
          router.push(hasRedirect ? redirectTo : '/lawyer-dashboard')
        }
      } else if (user.role === 'admin') {
        router.push(hasRedirect ? redirectTo : '/admin')
      } else {
        router.push(redirectTo)
      }
      router.refresh()
      // Do NOT setLoading(false) — page navigates away
    } catch (err: any) {
      // Always reset — never leave user stuck on a spinner
      setLoading(false)
      setError(err.message || 'Invalid email or password. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="w-full max-w-[400px] z-10"
    >
      <div className="bg-[#0E1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Card header */}
        <div className="px-8 pt-8 pb-6 border-b border-white/8">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-sm text-slate-400">Sign in to your LegalX account</p>
        </div>

        <div className="px-8 py-7">
          <AnimatePresence>
            {resetToast && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mb-5 p-3 flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-300">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    suppressHydrationWarning
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path d="M8 12.5l2.5 2.5L16 9.5" />
                  </svg>
                  Password updated. Sign in with your new password.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {message && (
            <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@gmail.com"
                className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#D4AF37] hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C050] text-[#080B12] font-bold text-sm tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#080B12]/30 border-t-[#080B12] rounded-full animate-spin" />
                    Signing in…
                  </span>
                : 'Sign In'
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#D4AF37] hover:text-white font-semibold transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" suppressHydrationWarning>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Secure Login
        </span>
        <span className="w-px h-3 bg-white/10" />
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" suppressHydrationWarning>
            <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
          </svg>
          HttpOnly Cookie Auth
        </span>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#080B12] flex flex-col items-center justify-center relative overflow-hidden px-5">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#D4AF37]/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="mb-8 z-10 flex items-center gap-2.5 flex-shrink-0">
        <LXLogoMark height={40} className="text-[#D4AF37]" />
        <span className="font-bold text-[18px] leading-none tracking-tight text-white">
          LegalX<span className="text-[#D4AF37]">Online</span>
        </span>
      </Link>

      <Suspense
        fallback={
          <div className="w-full max-w-[400px] bg-[#0E1220] border border-white/10 rounded-2xl p-8 z-10 space-y-4">
            <div className="h-6 bg-white/5 rounded w-1/2" />
            <div className="h-4 bg-white/5 rounded w-2/3" />
            <div className="h-11 bg-white/5 rounded-lg mt-6" />
            <div className="h-11 bg-white/5 rounded-lg" />
            <div className="h-12 bg-[#D4AF37]/20 rounded-xl" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
