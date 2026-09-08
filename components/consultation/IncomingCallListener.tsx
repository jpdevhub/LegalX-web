'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetMe, apiFetch } from '@/lib/api'

/**
 * Rings the lawyer wherever they are on the site.
 *
 * This used to live inside the lawyer dashboard's layout, which meant the only
 * place a lawyer could be reached was the dashboard itself. A lawyer reading
 * the Knowledge Center, looking at their own public profile, or sitting on the
 * home page was marked available and simply never heard the phone — the call
 * rang into a component that was not mounted, and lapsed after twenty seconds.
 *
 * Mounted once in the root layout, so it covers every page. The connection is
 * opened only for lawyers; nobody else has anything to answer.
 *
 * What arrives here is a signal, not media: the server writes a row, Supabase
 * Realtime picks it up and relays it down this SSE stream. Audio and video are
 * Agora's job and start on the consultation page.
 */

interface IncomingCall {
  consultationId: string
  type: 'chat' | 'voice' | 'video'
  clientName?: string
  expiresAt?: string
}

const TYPE_LABEL: Record<string, string> = {
  chat: 'Text Chat',
  voice: 'Voice Call',
  video: 'Video Call',
}

const CALL_TIMEOUT = 20

export function IncomingCallListener() {
  const router = useRouter()
  const [isLawyer, setIsLawyer] = useState(false)
  const [call, setCall] = useState<IncomingCall | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // Who is watching. A client has nothing to answer, so no stream is opened.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await apiGetMe()
        if (!cancelled && me?.role === 'lawyer') setIsLawyer(true)
      } catch { /* signed out — nothing to listen for */ }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!isLawyer) return

    let retry: ReturnType<typeof setTimeout> | null = null
    let attempts = 0
    let closed = false

    const connect = () => {
      if (closed) return
      const es = new EventSource('/api/notifications/stream', { withCredentials: true })
      esRef.current = es

      es.addEventListener('open', () => { attempts = 0 })

      // Attached inside connect() so a reconnect keeps them. A listener bound
      // once outside would be lost with the first dropped connection, and the
      // stream would stay open answering nothing.
      es.addEventListener('incoming_call', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data) as IncomingCall
          if (mounted.current) setCall(data)
        } catch { /* ignore malformed */ }
      })

      es.onerror = () => {
        es.close()
        if (closed) return
        attempts += 1
        retry = setTimeout(connect, Math.min(2000 * 2 ** (attempts - 1), 60_000))
      }
    }

    connect()
    return () => {
      closed = true
      esRef.current?.close()
      if (retry) clearTimeout(retry)
    }
  }, [isLawyer])

  const decline = useCallback(async () => {
    const current = call
    setCall(null)
    if (!current) return
    try {
      // /cancel, not /decline: the latter is not a route, so every decline used
      // to 404 in silence and leave the consultation pending with its hold in
      // place until it timed out on its own.
      await apiFetch(`/api/consultations/${current.consultationId}/cancel`, { method: 'PATCH' })
    } catch { /* the client's own timeout still releases it */ }
  }, [call])

  const accept = useCallback(() => {
    const current = call
    setCall(null)
    if (current) router.push(`/consultation/${current.consultationId}`)
  }, [call, router])

  if (!isLawyer) return null

  return (
    <AnimatePresence>
      {call && <Ringer call={call} onAccept={accept} onDecline={decline} />}
    </AnimatePresence>
  )
}

function Ringer({
  call, onAccept, onDecline,
}: { call: IncomingCall; onAccept: () => void; onDecline: () => void }) {
  const [remaining, setRemaining] = useState(CALL_TIMEOUT)

  // onDecline changes identity every render through its `call` dependency, so
  // the timer reads it from a ref instead. Listing it as a dependency would
  // restart the countdown on every tick and the call would never lapse.
  const declineRef = useRef(onDecline)
  useEffect(() => { declineRef.current = onDecline }, [onDecline])

  useEffect(() => {
    const t = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(t); declineRef.current(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const pct = (remaining / CALL_TIMEOUT) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Over everything, including the site header and any open menu. A call
      // has twenty seconds to be answered; it cannot sit behind other chrome.
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="alertdialog"
      aria-live="assertive"
      aria-label={`Incoming ${TYPE_LABEL[call.type]}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        className="w-full max-w-[400px] bg-[#0E1220] border border-[#C9A227]/40 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-[#C9A227]"
            initial={{ width: '100%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center shrink-0">
              <CallIcon type={call.type} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">Incoming {TYPE_LABEL[call.type]}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {call.clientName ?? 'A client'} · declines in {remaining}s
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={onDecline}
              className="flex-1 h-11 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              autoFocus
              className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4B840] text-[#0A0D14] text-sm font-bold transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CallIcon({ type }: { type: IncomingCall['type'] }) {
  const cls = 'w-5 h-5 text-[#C9A227]'
  if (type === 'video') {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    )
  }
  if (type === 'voice') {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    )
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}
