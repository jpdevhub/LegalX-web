'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { apiSignupRequestOtp, apiSignupVerifyOtp } from '@/lib/api'
import { LXLogoMark } from '@/components/ui/LXLogo'
import { PasswordRules, isPasswordValid } from '@/components/ui/PasswordRules'

/** Client-side email format check — mirrors the backend strictEmailSchema. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim())
}

type Step = 'details' | 'otp'

export default function SignupPage() {
  const [step, setStep] = useState<Step>('details')
  const [role, setRole] = useState<'client' | 'lawyer'>('client')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [revealPassword, setRevealPassword] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const router = useRouter()

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [resendCooldown, setResendCooldown] = useState(0)

  const passwordOk = isPasswordValid(password)
  const emailValid = isValidEmail(email)

  // ── Resend cooldown timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // ── Step 1: Request OTP ─────────────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordOk) {
      setError('Please choose a password that meets all the requirements below.')
      return
    }
    if (!emailValid) {
      setError('Please enter a valid email address (e.g. you@gmail.com).')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await apiSignupRequestOtp({ email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim(), role })
      setStep('otp')
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      // Focus first OTP input after transition
      setTimeout(() => otpRefs.current[0]?.focus(), 300)
    } catch (err: any) {
      setError(
        err.message === 'An account with this email already exists.'
          ? 'An account with this email already exists. Sign in instead.'
          : err.message || 'Failed to send verification code. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = useCallback(async (otpValue?: string[]) => {
    const digits = otpValue || otp
    const otpString = digits.join('')
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await apiSignupVerifyOtp({
        email: email.trim(),
        otp: otpString,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
      })
      if (role === 'lawyer') {
        router.push('/login?message=Account created. Sign in to complete your lawyer profile and submit credentials for verification.')
      } else {
        router.push('/login?message=Account created successfully! Sign in to get started.')
      }
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Verification failed. Please try again.')
    }
  }, [otp, email, password, firstName, lastName, role, router])

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    setError(null)
    try {
      await apiSignupRequestOtp({ email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim(), role })
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── OTP input handlers ──────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // Auto-advance to next input
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are filled
    if (digit && index === 5 && newOtp.every(d => d !== '')) {
      handleVerifyOtp(newOtp)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      handleVerifyOtp()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return
    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || ''
    }
    setOtp(newOtp)
    // Focus the last filled input or the next empty one
    const nextEmpty = newOtp.findIndex(d => d === '')
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus()
    // Auto-submit if complete
    if (pasted.length === 6) {
      handleVerifyOtp(newOtp)
    }
  }

  return (
    <div className="min-h-screen bg-[#080B12] flex flex-col items-center justify-center relative overflow-hidden py-12 px-5">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#D4AF37]/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="mb-8 z-10 flex items-center gap-2.5 flex-shrink-0">
        <LXLogoMark height={40} className="text-[#D4AF37]" />
        <span className="font-bold text-[18px] leading-none tracking-tight text-white">
          LegalX<span className="text-[#D4AF37]">Online</span>
        </span>
      </Link>

      <div className="w-full max-w-[440px] z-10">
        <AnimatePresence mode="wait">
          {step === 'details' ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="bg-[#0E1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Card header */}
                <div className="px-8 pt-8 pb-6 border-b border-white/8">
                  <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
                  <p className="text-sm text-slate-400">Join India's trusted legal tech platform</p>
                </div>

                <div className="px-8 py-7">
                  {/* Role selector */}
                  <div className="relative flex p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
                    {(['client', 'lawyer'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors ${
                          role === r ? 'text-[#080B12]' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {r === 'client' ? 'I am a Client' : 'I am a Lawyer'}
                      </button>
                    ))}
                    <motion.div
                      layoutId="role-pill"
                      className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#D4AF37] rounded-lg shadow-sm pointer-events-none"
                      initial={false}
                      animate={{ left: role === 'client' ? '4px' : 'calc(50%)' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  </div>

                  {error && (
                    <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide" htmlFor="firstName">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          placeholder="John"
                          className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide" htmlFor="lastName">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          placeholder="Doe"
                          className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
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
                        placeholder="you@gmail.com"
                        className={`w-full h-11 px-3.5 rounded-lg bg-white/8 border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:bg-white/10 transition-all ${
                          email && !emailValid
                            ? 'border-red-500/50 focus:border-red-500/80'
                            : 'border-white/15 focus:border-[#D4AF37]/60'
                        }`}
                      />
                      {email && !emailValid && (
                        <p className="mt-1.5 text-xs text-red-400">
                          Enter a valid email address (e.g. you@gmail.com)
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="password">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setRevealPassword((v) => !v)}
                          className="text-xs text-slate-400 hover:text-[#D4AF37] transition-colors"
                        >
                          {revealPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        id="password"
                        type={revealPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/10 transition-all"
                      />
                      <PasswordRules password={password} className="mt-2.5" />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || !passwordOk || !emailValid}
                      className="w-full h-12 mt-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C050] text-[#080B12] font-bold text-sm tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-[#080B12]/30 border-t-[#080B12] rounded-full animate-spin" />
                            Sending verification code…
                          </span>
                        : 'Continue — Verify Email'
                      }
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#D4AF37] hover:text-white font-semibold transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="bg-[#0E1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Card header */}
                <div className="px-8 pt-8 pb-6 border-b border-white/8">
                  <button
                    type="button"
                    onClick={() => { setStep('details'); setError(null) }}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
                      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                  </button>
                  <h1 className="text-2xl font-bold text-white mb-1">Verify Your Email</h1>
                  <p className="text-sm text-slate-400">
                    We sent a 6-digit code to{' '}
                    <span className="text-[#D4AF37] font-medium">{email}</span>
                  </p>
                </div>

                <div className="px-8 py-7">
                  {error && (
                    <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp() }} className="space-y-6">
                    {/* OTP input boxes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wide text-center">
                        Verification Code
                      </label>
                      <div className="flex justify-center gap-2.5">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => { otpRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            onPaste={i === 0 ? handleOtpPaste : undefined}
                            className="w-12 h-14 text-center text-xl font-bold text-white bg-white/8 border border-white/15 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:bg-white/10 transition-all caret-transparent"
                            autoFocus={i === 0}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || otp.some(d => d === '')}
                      className="w-full h-12 rounded-xl bg-[#D4AF37] hover:bg-[#E5C050] text-[#080B12] font-bold text-sm tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-[#080B12]/30 border-t-[#080B12] rounded-full animate-spin" />
                            Verifying…
                          </span>
                        : 'Verify & Create Account'
                      }
                    </button>
                  </form>

                  {/* Resend link */}
                  <div className="mt-5 text-center">
                    {resendCooldown > 0 ? (
                      <p className="text-sm text-slate-500">
                        Resend code in{' '}
                        <span className="text-[#D4AF37] font-semibold tabular-nums">{resendCooldown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-sm text-[#D4AF37] hover:text-white font-semibold transition-colors disabled:opacity-50"
                      >
                        Resend verification code
                      </button>
                    )}
                  </div>

                  <p className="mt-5 text-center text-xs text-slate-600">
                    Check your spam folder if you don't see the email.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badges */}
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" suppressHydrationWarning>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            SSL Encrypted
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" suppressHydrationWarning>
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Email Verified
          </span>
        </div>
      </div>
    </div>
  )
}
