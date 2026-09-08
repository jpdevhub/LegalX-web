'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  apiGetMe, apiGetWallet, apiCreateTopupOrder, apiVerifyTopup, loadRazorpay,
  type WalletSummary,
} from '@/lib/api'

/**
 * The client's wallet.
 *
 * Two balances are shown separately and deliberately. The free grant is not
 * money — it cannot be refunded or withdrawn — and a single combined figure
 * would lose that distinction at exactly the moment somebody asks for their
 * money back. Consultations spend the grant first, so nobody is charged while
 * they still have credit left.
 */

const AMOUNTS = [200, 500, 1000, 2000]

function rupees(paise: number): string {
  return `₹${(paise / 100).toFixed(2).replace(/\.00$/, '')}`
}

function when(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  })
}

export default function WalletPage() {
  const router = useRouter()

  const [wallet, setWallet] = useState<WalletSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState(500)
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try { setWallet(await apiGetWallet()) }
    catch (err: unknown) { setError((err as Error)?.message || 'Could not load your wallet.') }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const me = await apiGetMe()
      if (cancelled) return
      if (!me) { router.replace('/login?redirect_to=/wallet'); return }
      try {
        const w = await apiGetWallet()
        if (!cancelled) setWallet(w)
      } catch (err: unknown) {
        if (!cancelled) setError((err as Error)?.message || 'Could not load your wallet.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [router])

  const chosenPaise = Math.round((custom ? Number(custom) : amount) * 100)
  const validAmount = Number.isFinite(chosenPaise) && chosenPaise >= 5000

  const topUp = async () => {
    if (!validAmount || busy) return
    setBusy(true)
    setError(null)
    setDone(null)

    try {
      const order = await apiCreateTopupOrder(chosenPaise)
      await loadRazorpay()

      await new Promise<void>((resolve, reject) => {
        const rzp = new (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: 'LegalX',
          description: 'Wallet top-up',
          theme: { color: '#C9A227' },
          handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              // The balance moves here, after the server checks the signature —
              // never on the browser saying the payment worked.
              const res = await apiVerifyTopup({
                razorpayOrderId: r.razorpay_order_id,
                razorpayPaymentId: r.razorpay_payment_id,
                razorpaySignature: r.razorpay_signature,
              })
              setDone(`Added ${rupees(chosenPaise)} to your wallet.`)
              setWallet(w => (w ? { ...w, walletPaise: res.walletPaise, spendablePaise: w.freeCreditPaise + res.walletPaise } : w))
              await refresh()
              resolve()
            } catch (err) { reject(err) }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        })
        rzp.open()
      })
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'That top-up did not go through.'
      if (msg !== 'Payment cancelled') setError(msg)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B12] px-5 md:px-16 py-12">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="w-4 h-4 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
          Loading your wallet…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080B12] px-5 md:px-16 py-12">
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Wallet</h1>
        <p className="text-sm text-slate-400 mt-1.5">
          Add money once and consult as often as you like. Charged by the minute, only for
          time actually used.
        </p>

        {wallet?.testMode && (
          <div className="mt-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-semibold text-amber-300">Test mode.</span> Payments run
              against Razorpay&rsquo;s test keys, so no real money moves. Use card
              <span className="font-mono"> 4111 1111 1111 1111</span>, any future expiry and
              any CVV.
            </p>
          </div>
        )}

        {/* Balances, kept apart on purpose */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-4 rounded-xl bg-[#0E1220] border border-white/8">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Wallet</p>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">
              {rupees(wallet?.walletPaise ?? 0)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Money you added</p>
          </div>
          <div className="p-4 rounded-xl bg-[#C9A227]/[0.07] border border-[#C9A227]/25">
            <p className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wide">Free credit</p>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">
              {rupees(wallet?.freeCreditPaise ?? 0)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Spent first, not refundable</p>
          </div>
        </div>

        <p className="text-sm text-slate-400 mt-3">
          Available to spend{' '}
          <span className="text-white font-semibold tabular-nums">
            {rupees(wallet?.spendablePaise ?? 0)}
          </span>
        </p>

        {/* Top up */}
        <div className="mt-8 p-5 rounded-xl bg-[#0E1220] border border-white/8">
          <h2 className="text-sm font-semibold text-white mb-3">Add money</h2>

          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustom('') }}
                className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${
                  !custom && amount === a
                    ? 'bg-[#C9A227] border-[#C9A227] text-[#0A0D14]'
                    : 'bg-white/[0.04] border-white/12 text-slate-200 hover:border-white/25'
                }`}
              >
                ₹{a}
              </button>
            ))}
          </div>

          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-4 mb-1.5">
            Or another amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
            <input
              type="number"
              min={50}
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="500"
              className="w-full h-11 pl-8 pr-3.5 rounded-lg bg-white/[0.06] border border-white/12 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#C9A227]/60"
            />
          </div>
          {custom && !validAmount && (
            <p className="text-xs text-amber-400 mt-1.5">The smallest top-up is ₹50.</p>
          )}

          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
          {done && <p className="text-xs text-emerald-400 mt-3">{done}</p>}

          <button
            onClick={topUp}
            disabled={!validAmount || busy}
            className="w-full h-12 mt-4 rounded-xl bg-[#C9A227] hover:bg-[#E5C050] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Opening checkout…' : `Add ${rupees(chosenPaise || 0)}`}
          </button>

          <p className="text-[11px] text-slate-600 mt-2.5 text-center">
            Card details go straight to Razorpay. They never reach LegalX.
          </p>
        </div>

        {/* History */}
        <h2 className="text-sm font-semibold text-white mt-8 mb-3">Recent activity</h2>
        {!wallet?.transactions.length ? (
          <p className="text-sm text-slate-500 py-6">
            Nothing yet. Top-ups and consultation charges will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {wallet.transactions.map(t => (
              <li
                key={t.id}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/8"
              >
                <span
                  className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${
                    t.type === 'credit' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {t.type === 'credit' ? '+' : '−'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-white truncate">
                    {t.note || (t.reference_type === 'consultation' ? 'Consultation' : 'Top-up')}
                  </span>
                  <span className="block text-[11px] text-slate-500">{when(t.created_at)}</span>
                </span>
                <span className="text-right shrink-0">
                  <span className={`block text-sm font-semibold tabular-nums ${t.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {t.type === 'credit' ? '+' : '−'}₹{Number(t.amount).toFixed(2).replace(/\.00$/, '')}
                  </span>
                  <span className="block text-[11px] text-slate-600 tabular-nums">
                    ₹{Number(t.balance_after).toFixed(2).replace(/\.00$/, '')} left
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/talk-to-lawyer"
          className="inline-block mt-8 text-sm text-[#C9A227] hover:text-white transition-colors"
        >
          ← Find a lawyer
        </Link>
      </div>
    </div>
  )
}
