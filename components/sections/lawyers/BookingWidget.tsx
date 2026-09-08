'use client'

/**
 * BookingWidget — starts a consultation.
 *
 * The flow, once the client presses the button:
 *   1. POST /api/consultations/initiate
 *      The server checks the client's free credit first. If it covers at least
 *      one minute the call is funded from it and the response already carries
 *      the Agora token — no gateway is involved and there is nothing to pay.
 *   2. The same request rings the lawyer: it writes consultation_notifications,
 *      which Supabase Realtime relays through the backend's SSE stream to their
 *      dashboard, where they have 20 seconds to answer.
 *   3. The client goes straight to /consultation/[id] and waits in the room.
 *      Audio and video run over Agora's network, never through our server.
 *   4. When the channel empties, Agora's webhook settles the call against the
 *      measured duration.
 *
 * Out of credit, the server answers PAYMENTS_MAINTENANCE while Razorpay is off
 * and PhonePe is being built. The Razorpay branch below is kept rather than
 * deleted — it is the only pre-authorise-and-void implementation we have.
 *
 * This replaces a TEST_MODE flag that faked a payment id to reach the room.
 * Free credit does the same job without a live-payments switch sitting in the
 * middle of the feature.
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ConsultIcon } from '@/components/ui/ConsultIcons'
import { apiFetch, apiGetMe } from '@/lib/api'
import type { ApiLawyer } from '@/lib/api'

const CONSULT_TYPES = [
  { key: 'chat',  label: 'Chat',  desc: 'Text messages + document sharing' },
  { key: 'voice', label: 'Voice', desc: 'Crystal-clear audio call' },
  { key: 'video', label: 'Video', desc: 'Face-to-face HD video call' },
] as const

type ConsultType = typeof CONSULT_TYPES[number]['key']
type Step = 'idle' | 'loading' | 'unavailable' | 'error' | 'payments-paused'

export function BookingWidget({ lawyer }: { lawyer: ApiLawyer }) {
  const router = useRouter()
  const [type, setType]     = useState<ConsultType>('chat')
  const [step, setStep]     = useState<Step>('idle')
  const [errMsg, setErrMsg] = useState('')

  const feeMap: Record<ConsultType, number> = {
    chat:  lawyer.fees.chat,
    voice: lawyer.fees.voice,
    video: lawyer.fees.video,
  }
  const fee = feeMap[type]

  const handleConsult = useCallback(async () => {
    setStep('loading')
    setErrMsg('')

    try {
      // ── Auth check: must be logged in as client ─────────────────────────
      const user = await apiGetMe()
      if (!user) {
        router.push(`/login?redirect_to=/talk-to-lawyer/${lawyer.slug}`)
        return
      }
      if (user.role === 'lawyer') {
        setErrMsg('Lawyers cannot initiate consultations. Please use a client account.')
        setStep('error')
        return
      }

      // ── Check lawyer is online ──────────────────────────────────────────
      if (!lawyer.online) {
        setStep('unavailable')
        return
      }

      // ── Start the call ──────────────────────────────────────────────────
      // One request: it decides how the call is funded, creates the row and
      // rings the lawyer. A credit-funded call comes back with its token
      // attached, so there is no second step and no payment.
      const initiateData = await apiFetch<{
        consultationId: string
        fundedBy: 'credits' | 'razorpay'
        channelName?: string
        agoraAppId?: string
        authToken?: string
        uid?: number
        razorpayOrderId?: string
        amount?: number
        currency?: string
      }>('/api/consultations/initiate', {
        method: 'POST',
        body: JSON.stringify({ lawyerId: lawyer.slug, type, maxMinutes: 30 }),
      })

      if (initiateData.fundedBy === 'credits') {
        router.push(
          `/consultation/${initiateData.consultationId}` +
          `?channel=${initiateData.channelName}&token=${initiateData.authToken}` +
          `&uid=${initiateData.uid}&appId=${initiateData.agoraAppId}&type=${type}`
        )
        return
      }

      // ── Paid: Razorpay pre-authorisation ────────────────────────────────
      // Only reachable when RAZORPAY_MAINTENANCE is off on the server.
      // Dynamically load Razorpay script
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) { resolve(); return }
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Razorpay script failed to load'))
        document.head.appendChild(s)
      })

      await new Promise<void>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: initiateData.razorpayOrderId,
          amount: initiateData.amount,
          currency: initiateData.currency || 'INR',
          name: 'LegalX',
          description: `${type} consultation with ${lawyer.name}`,
          prefill: { name: user.firstName + ' ' + user.lastName, email: user.email },
          theme: { color: '#C9A227' },
          handler: async (response: any) => {
            try {
              const tokenData = await apiFetch<{
                consultationId: string
                channelName: string
                agoraAppId: string
                authToken: string
                uid: number
              }>('/api/consultations/token', {
                method: 'POST',
                body: JSON.stringify({
                  consultationId: initiateData.consultationId,
                  razorpayPaymentId: response.razorpay_payment_id,
                }),
              })
              router.push(
                `/consultation/${tokenData.consultationId}?channel=${tokenData.channelName}&token=${tokenData.authToken}&uid=${tokenData.uid}&appId=${tokenData.agoraAppId}&type=${type}`
              )
              resolve()
            } catch (err: any) {
              reject(err)
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        })
        rzp.open()
      })
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please try again.'
      if (msg === 'Payment cancelled') {
        setStep('idle')
      } else if (/on hold while we switch payment providers/i.test(msg)) {
        // Out of free credit and the gateway is off. Not an error the client
        // can do anything about, so it reads as a notice rather than a failure.
        setStep('payments-paused')
      } else {
        setErrMsg(msg)
        setStep('error')
      }
    }
  }, [lawyer, type, router])

  return (
    <div className="bg-[#0E1220] border border-white/10 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/8">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Consult Now</p>
          <span className="text-[10px] font-bold bg-emerald-400/15 text-emerald-400 border border-emerald-400/25 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Free credit
          </span>
        </div>
        <p className="text-white font-semibold text-lg">{lawyer.name}</p>
        <div className="flex items-center gap-2 mt-1">
          {lawyer.online ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Available now
            </span>
          ) : (
            <span className="text-xs text-slate-500">Currently offline</span>
          )}
        </div>
      </div>

      {/* Type selector */}
      <div className="p-4 border-b border-white/8">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Select Type</p>
        <div className="grid grid-cols-3 gap-2">
          {CONSULT_TYPES.map((t) => (
            <button
              key={t.key}
              id={`consult-type-${t.key}`}
              onClick={() => setType(t.key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-sm border text-center transition-all ${
                type === t.key
                  ? 'border-[#C9A227]/50 bg-[#C9A227]/10 text-[#C9A227]'
                  : 'border-white/8 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              <ConsultIcon channel={t.key} className="w-4 h-4" />
              <span className="text-[11px] font-semibold">{t.label}</span>
              <span className="text-[10px] font-bold text-[#C9A227]">₹{feeMap[t.key]}/min</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">{CONSULT_TYPES.find((t) => t.key === type)?.desc}</p>
      </div>

      {/* Pricing breakdown */}
      <div className="px-5 py-4 border-b border-white/8 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Rate</span>
          <span className="text-white font-semibold">₹{fee}/min</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Billing</span>
          <span className="text-white">Per minute, exact usage</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Hold</span>
          <span className="text-white">₹{fee * 30} (30 min max)</span>
        </div>
        <p className="text-[11px] text-slate-600 mt-1">
          Funds are held, not charged. You only pay for actual time used.
        </p>
      </div>

      {/* Error / unavailable */}
      {step === 'error' && (
        <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-xs text-red-400">
          {errMsg}
        </div>
      )}
      {step === 'payments-paused' && (
        <div className="mx-5 mt-4 p-4 bg-[#C9A227]/10 border border-[#C9A227]/25 rounded-sm">
          <p className="text-sm font-semibold text-[#D4AF37] mb-1">Paid consultations — coming soon</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            You have used your free consultation credit, and paid calls are on hold while we
            move to a new payment provider. Hold tight — this is back shortly. For anything
            urgent, message us on WhatsApp.
          </p>
        </div>
      )}
      {step === 'unavailable' && (
        <div className="mx-5 mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm text-sm text-amber-300">
          <p className="font-semibold mb-1">Lawyer is currently offline</p>
          <p className="text-xs text-amber-400/70">Check back later or contact us at contact@legalxonline.com to schedule.</p>
        </div>
      )}

      {/* CTA */}
      <div className="p-5">
        <button
          id="book-consult-btn"
          onClick={handleConsult}
          disabled={step === 'loading'}
          className="w-full py-3.5 rounded-sm bg-[#C9A227] hover:bg-[#B08A1E] disabled:opacity-50 disabled:cursor-wait
            text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {step === 'loading' ? (
            <>
              <span className="w-4 h-4 border-2 border-black/40 border-t-transparent rounded-full animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              Start {CONSULT_TYPES.find((t) => t.key === type)?.label}
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-600 mt-3">
          Funds held by Razorpay · Only charged for time used
        </p>
      </div>
    </div>
  )
}
