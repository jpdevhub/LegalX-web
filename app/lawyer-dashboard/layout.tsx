'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetMe, apiGetLawyerMe, apiFetch, type AuthUser } from '@/lib/api'
import { LPortalSidebar } from '@/components/lawyer-portal/LPortalSidebar'

// ── Incoming call banner types ────────────────────────────────────────────────
interface IncomingCall {
  consultationId: string
  type: 'chat' | 'voice' | 'video'
  clientName?: string
}

const TYPE_LABEL: Record<string, string> = { chat: 'Text Chat', voice: 'Voice Call', video: 'Video Call' }
const CALL_TIMEOUT = 20

function IncomingCallBanner({ call, onAccept, onDecline }: {
  call: IncomingCall
  onAccept: () => void
  onDecline: () => void
}) {
  const [remaining, setRemaining] = useState(CALL_TIMEOUT)

  useEffect(() => {
    const t = setInterval(() => setRemaining(p => {
      if (p <= 1) { clearInterval(t); onDecline(); return 0 }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [onDecline])

  const pct = (remaining / CALL_TIMEOUT) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] w-[min(400px,calc(100vw-2rem))]"
    >
      <div className="bg-[#0E1220] border border-[#C9A227]/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Countdown bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-[#C9A227]"
            initial={{ width: '100%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center shrink-0">
              {call.type === 'video' && <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>}
              {call.type === 'voice' && <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 1.22 2 2 0 014 .04h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>}
              {call.type === 'chat' && <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Incoming {TYPE_LABEL[call.type]}</p>
              <p className="text-slate-400 text-xs mt-0.5">{call.clientName ?? 'Client'} • Auto-declines in {remaining}s</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={onDecline} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors border border-white/10">Decline</button>
            <button onClick={onAccept} className="flex-1 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#D4B840] text-[#0A0D14] text-sm font-bold transition-colors">Accept</button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Portal layout ─────────────────────────────────────────────────────────────
export default function LawyerPortalLayout({ children }: { children: React.ReactNode }) {
  const router       = useRouter()
  const mountedRef   = useRef(true)
  const eventRef     = useRef<EventSource | null>(null)

  const [user,        setUser]        = useState<AuthUser | null>(null)
  const [isOnline,    setIsOnline]    = useState(false)
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [authReady,   setAuthReady]   = useState(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Auth check on mount
  useEffect(() => {
    async function check() {
      const u = await apiGetMe()
      if (!mountedRef.current) return
      if (!u || u.role !== 'lawyer') {
        router.replace('/login?redirect_to=/lawyer-dashboard')
        return
      }
      setUser(u)

      // Load online status
      const lm = await apiGetLawyerMe()
      if (mountedRef.current) {
        setIsOnline(lm?.profile?.is_online ?? false)
        setAuthReady(true)
      }
    }
    check()
  }, [router])

  // SSE: listen for incoming calls
  useEffect(() => {
    if (!authReady) return
    const es = new EventSource('/api/notifications', { withCredentials: true })
    eventRef.current = es

    es.addEventListener('incoming_call', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as IncomingCall
        if (mountedRef.current) setIncomingCall(data)
      } catch { /* ignore malformed */ }
    })

    es.onerror = () => {
      es.close()
      // Reconnect after 5s
      setTimeout(() => {
        if (mountedRef.current) {
          const newEs = new EventSource('/api/notifications', { withCredentials: true })
          eventRef.current = newEs
        }
      }, 5000)
    }

    return () => es.close()
  }, [authReady])

  const handleToggleOnline = useCallback(async () => {
    const next = !isOnline
    setIsOnline(next)
    try {
      await apiFetch('/api/lawyers/me/status', { method: 'PATCH', body: JSON.stringify({ is_online: next }) })
    } catch {
      setIsOnline(!next) // rollback
    }
  }, [isOnline])

  const handleAcceptCall = useCallback(() => {
    if (!incomingCall) return
    const id = incomingCall.consultationId
    setIncomingCall(null)
    router.push(`/consultation/${id}`)
  }, [incomingCall, router])

  const handleDeclineCall = useCallback(async () => {
    if (!incomingCall) return
    const id = incomingCall.consultationId
    setIncomingCall(null)
    try {
      await apiFetch(`/api/consultations/${id}/decline`, { method: 'PATCH' })
    } catch { /* non-fatal */ }
  }, [incomingCall])

  // Loading state
  if (!authReady || !user) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#C9A227]/30 border-t-[#C9A227] animate-spin" />
          <p className="text-slate-500 text-sm">Loading portal…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080B12] flex">
      {/* Sidebar */}
      <LPortalSidebar user={user} isOnline={isOnline} onToggleOnline={handleToggleOnline} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-0 pt-14 lg:pt-0">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Incoming call overlay */}
      <AnimatePresence>
        {incomingCall && (
          <IncomingCallBanner
            call={incomingCall}
            onAccept={handleAcceptCall}
            onDecline={handleDeclineCall}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
