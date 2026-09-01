'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { apiGetConsultationToken, apiSubmitReview, type AgoraSession } from '@/lib/api'

// Agora must be loaded client-side only (no SSR support)
const VideoRoom = dynamic(() => import('@/components/consultation/VideoRoom'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Connecting to session…</p>
      </div>
    </div>
  ),
})

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">{children}</div>
    </div>
  )
}

export default function ConsultationPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [session, setSession] = useState<AgoraSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)

  // Credentials come from the backend over the authenticated cookie, never
  // from the URL. A token in a query string leaks through browser history,
  // Referer headers and server logs, and would let anyone holding the link
  // join a private legal consultation.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await apiGetConsultationToken(id)
        if (!cancelled) setSession(s)
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not join this consultation.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  // Only clients rate lawyers, so the lawyer's own exit skips the prompt.
  const handleEnded = useCallback(() => {
    if (session?.role === 'client') setShowReview(true)
  }, [session?.role])

  if (loading) {
    return (
      <Shell>
        <div className="w-10 h-10 border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Joining consultation…</p>
      </Shell>
    )
  }

  if (error || !session) {
    return (
      <Shell>
        <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-white font-semibold mb-2">Can’t join this session</h2>
        <p className="text-slate-400 text-sm mb-5">{error ?? 'This consultation is unavailable.'}</p>
        <button
          onClick={() => router.push('/talk-to-lawyer')}
          className="px-5 py-2.5 rounded-lg bg-[#C9A227] text-[#060810] font-semibold text-sm"
        >
          Back to Lawyers
        </button>
      </Shell>
    )
  }

  if (showReview && session.counterpartId) {
    return <ReviewPrompt lawyerId={session.counterpartId} onDone={() => router.push('/')} />
  }

  return (
    <VideoRoom
      consultationId={id}
      channel={session.channelName}
      token={session.token}
      uid={session.uid}
      appId={session.agoraAppId}
      type={session.type}
      viewerRole={session.role}
      onEnded={handleEnded}
    />
  )
}

// ── Post-call review ──────────────────────────────────────────────────────────

function ReviewPrompt({ lawyerId, onDone }: { lawyerId: string; onDone: () => void }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (rating < 1) { setError('Please choose a rating.'); return }
    setBusy(true)
    setError(null)
    try {
      await apiSubmitReview(lawyerId, rating, comment.trim())
      onDone()
    } catch (err: any) {
      setBusy(false)
      setError(err?.message || 'Could not submit your review.')
    }
  }

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0E1220] border border-white/10 rounded-2xl p-7 text-left"
      >
        <h2 className="text-xl font-bold text-white mb-1 text-center">How was your consultation?</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">
          Your rating helps other clients choose the right lawyer.
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(star => {
            const active = star <= (hover || rating)
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${star} star${star === 1 ? '' : 's'}`}
                className="transition-transform hover:scale-110"
              >
                <svg
                  className={`w-9 h-9 ${active ? 'text-[#C9A227]' : 'text-white/15'}`}
                  viewBox="0 0 24 24"
                  fill={active ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  suppressHydrationWarning
                >
                  <path strokeLinejoin="round" d="M11.48 3.5a.56.56 0 011.04 0l2.12 5.11 5.52.44c.5.04.7.67.32 1l-4.2 3.6 1.28 5.39a.56.56 0 01-.84.6L12 16.75l-4.72 2.89a.56.56 0 01-.84-.6l1.28-5.4-4.2-3.6a.56.56 0 01.32-.99l5.52-.44 2.12-5.11z" />
                </svg>
              </button>
            )
          })}
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Anything you'd like to add? (optional)"
          className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 resize-none"
        />

        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onDone}
            disabled={busy}
            className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-60"
          >
            {busy ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </motion.div>
    </Shell>
  )
}
