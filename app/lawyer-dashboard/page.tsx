'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch, apiGetMe, type AuthUser } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface IncomingCall {
  consultationId: string
  type: 'chat' | 'voice' | 'video'
  expiresAt: string
}

const TYPE_ICONS: Record<string, string> = { chat: '💬', voice: '📞', video: '📹' }
const TYPE_LABELS: Record<string, string> = {
  chat: 'Text Chat',
  voice: 'Voice Call',
  video: 'Video Call',
}

// ── IncomingCallBanner (Phase 5.2) ────────────────────────────────────────────
const CALL_TIMEOUT_S = 15

function IncomingCallBanner({
  call,
  onAccept,
  onDecline,
}: {
  call: IncomingCall
  onAccept: () => void
  onDecline: () => void
}) {
  const [remaining, setRemaining] = useState(CALL_TIMEOUT_S)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          onDecline()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [onDecline])

  const pct = (remaining / CALL_TIMEOUT_S) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.96 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[min(420px,calc(100vw-2rem))]"
    >
      <div className="bg-[#0E1220] border border-[#C9A227]/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Countdown bar */}
        <div className="h-1 bg-white/5 w-full">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C9A227] to-amber-400"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            {/* Pulsing icon */}
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#C9A227]/25 animate-ping" />
              <div className="relative w-12 h-12 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-2xl">
                {TYPE_ICONS[call.type]}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#C9A227] uppercase tracking-widest mb-0.5">
                Incoming Consultation
              </p>
              <p className="text-white font-semibold">{TYPE_LABELS[call.type]}</p>
              <p className="text-slate-400 text-sm mt-0.5">
                Auto-declining in{' '}
                <span
                  className={`font-bold tabular-nums ${remaining <= 5 ? 'text-red-400' : 'text-white'}`}
                >
                  {remaining}s
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#B08A1E] text-black text-sm font-bold transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Lawyer Dashboard Page ─────────────────────────────────────────────────────
export default function LawyerDashboardPage() {
  const router = useRouter()
  const mountedRef = useRef(true)

  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [consultations, setConsultations] = useState<any[]>([])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // ── Auth guard: only lawyers ─────────────────────────────────────────────
  useEffect(() => {
    apiGetMe()
      .then(u => {
        if (!mountedRef.current) return
        if (!u) { router.replace('/login?redirect_to=/lawyer-dashboard'); return }
        if (u.role !== 'lawyer') { router.replace('/'); return }
        setUser(u)
        setLoading(false)
      })
      .catch(() => router.replace('/login?redirect_to=/lawyer-dashboard'))
  }, [router])

  // ── Load consultation history from backend ───────────────────────────────
  useEffect(() => {
    if (!user) return
    apiFetch<{ consultations: any[] }>('/api/consultations/my')
      .then(d => { if (mountedRef.current) setConsultations(d.consultations) })
      .catch(() => {})
  }, [user])

  // ── SSE: listen for incoming calls via backend EventSource ────────────────
  // EventSource uses cookies automatically (same-origin via Next.js proxy)
  // No Supabase SDK, no extra keys needed in the frontend.
  useEffect(() => {
    if (!user) return

    const es = new EventSource('/api/notifications/stream', { withCredentials: true })

    es.addEventListener('incoming_call', (e) => {
      if (!mountedRef.current) return
      try {
        const data = JSON.parse((e as MessageEvent).data) as IncomingCall
        setIncomingCall(data)
      } catch {}
    })

    es.addEventListener('error', () => {
      // EventSource auto-reconnects on error — no action needed
    })

    return () => es.close()
  }, [user])

  // ── Online toggle ────────────────────────────────────────────────────────
  const toggleOnline = useCallback(async () => {
    if (toggling) return
    setToggling(true)
    const next = !isOnline
    try {
      await apiFetch('/api/lawyers/me/status', {
        method: 'PATCH',
        body: JSON.stringify({ isOnline: next }),
      })
      if (mountedRef.current) setIsOnline(next)
    } catch { /* revert silently */ }
    finally { if (mountedRef.current) setToggling(false) }
  }, [isOnline, toggling])

  // ── Accept call ──────────────────────────────────────────────────────────
  const handleAccept = useCallback(async () => {
    if (!incomingCall) return
    const { consultationId } = incomingCall
    setIncomingCall(null)
    try {
      const data = await apiFetch<{
        consultationId: string
        channelName: string
        agoraAppId: string
        authToken: string
        uid: number
      }>(`/api/consultations/${consultationId}/accept`, { method: 'PATCH' })

      router.push(
        `/consultation/${consultationId}?channel=${data.channelName}&token=${data.authToken}&uid=${data.uid}&appId=${data.agoraAppId}`
      )
    } catch (err) {
      console.error('Failed to accept call:', err)
    }
  }, [incomingCall, router])

  // ── Decline / timeout ────────────────────────────────────────────────────
  const handleDecline = useCallback(async () => {
    if (!incomingCall) return
    const id = incomingCall.consultationId
    setIncomingCall(null)
    try {
      await apiFetch(`/api/consultations/${id}/cancel`, { method: 'PATCH' })
    } catch {}
  }, [incomingCall])

  // ── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    earnings: consultations
      .filter(c => c.payment_status === 'paid')
      .reduce((s: number, c: any) => s + Number(c.total_amount || 0), 0),
  }

  return (
    <>
      {/* Incoming call banner — floats above everything */}
      <AnimatePresence>
        {incomingCall && (
          <IncomingCallBanner
            key={incomingCall.consultationId}
            call={incomingCall}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#080B12] text-white">
        {/* Sticky header */}
        <header className="border-b border-white/8 bg-[#0A0D16]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[#C9A227] font-bold text-lg tracking-tight">LegalX</span>
              <span className="text-white/20">|</span>
              <span className="text-slate-400 text-sm font-medium">Lawyer Portal</span>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-sm text-slate-400 hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Exit Portal →
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          {/* Online / Offline toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0E1220] border border-white/8 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between gap-6">
              <div>
                <h2 className="text-base font-semibold text-white mb-1">Your Availability</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {isOnline
                    ? '🟢 You are online. Clients can request consultations right now.'
                    : '⚪ You are offline. Toggle on to start accepting consultations.'}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-sm font-bold ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <button
                  id="lawyer-status-toggle"
                  onClick={toggleOnline}
                  disabled={toggling}
                  aria-label={isOnline ? 'Go offline' : 'Go online'}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]/60 ${
                    isOnline ? 'bg-emerald-500' : 'bg-white/10'
                  } ${toggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      isOnline ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Sessions', value: String(stats.total), icon: '📋' },
              { label: 'Completed', value: String(stats.completed), icon: '✅' },
              {
                label: 'Total Earnings',
                value: `₹${stats.earnings.toLocaleString('en-IN')}`,
                icon: '💰',
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * (i + 1) }}
                className="bg-[#0E1220] border border-white/8 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{s.icon}</span>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{s.label}</p>
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Consultation history */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Recent Consultations
            </h3>

            {consultations.length === 0 ? (
              <div className="bg-[#0E1220] border border-white/8 border-dashed rounded-2xl p-12 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-white font-medium mb-1">No consultations yet</p>
                <p className="text-slate-500 text-sm">Toggle online above to start accepting clients.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {consultations.slice(0, 15).map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                    className="bg-[#0E1220] border border-white/8 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{TYPE_ICONS[c.type] ?? '📋'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white capitalize truncate">
                          {c.type} Consultation
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(c.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                          {c.duration_seconds ? ` · ${Math.ceil(c.duration_seconds / 60)} min` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {c.total_amount != null && Number(c.total_amount) > 0 && (
                        <span className="text-sm font-bold text-[#C9A227]">
                          ₹{Number(c.total_amount).toLocaleString('en-IN')}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          c.status === 'completed'   ? 'bg-emerald-500/15 text-emerald-400' :
                          c.status === 'cancelled'   ? 'bg-red-500/15 text-red-400' :
                          c.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400' :
                                                       'bg-white/8 text-slate-400'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
