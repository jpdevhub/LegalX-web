'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Play, AlertTriangle } from 'lucide-react'
import {
  apiGetPayouts, apiGeneratePayouts, apiHoldPayout, apiSetPayoutStatus,
  type AdminPayout,
} from '@/lib/api'
import {
  StatusBadge, Modal, ReasonModal, EmptyState, ErrorState, SkeletonRows,
  Pagination, Toast, formatCurrency, formatDate,
} from '@/components/admin/AdminUI'

const PAGE_SIZE = 20

// Section 194J: TDS applies once cumulative professional fees pass ₹30,000 in a
// financial year. Warn a little early so nobody is surprised by the crossover.
const TDS_WARN_THRESHOLD = 27_000

const FILTERS = ['pending', 'processing', 'held', 'paid', 'all'] as const

function toCsv(rows: AdminPayout[]): string {
  const header = ['Lawyer', 'Period Start', 'Period End', 'Gross', 'Platform Fee', 'TDS', 'Net', 'Status', 'PAN on file', 'Txns', 'Bank Ref']
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map(r => [
    r.lawyer_name, r.period_start, r.period_end, r.gross_amount, r.platform_fee,
    r.tds_amount, r.net_amount, r.status, r.has_pan ? 'Yes' : 'No',
    r.transaction_count, r.bank_ref ?? '',
  ].map(esc).join(','))
  return [header.join(','), ...lines].join('\n')
}

/** First and last day of last month, the usual payout cycle. */
function defaultPeriod(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0))
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<string>('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [holdTarget, setHoldTarget] = useState<AdminPayout | null>(null)
  const [showGenerate, setShowGenerate] = useState(false)
  const [period, setPeriod] = useState(defaultPeriod)
  const [genBusy, setGenBusy] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetPayouts({ status: filter, page, pageSize: PAGE_SIZE })
      setPayouts(res.items)
      setTotal(res.total)
    } catch (err: any) {
      setError(err?.message || 'Could not load payouts.')
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [filter])

  const generate = async () => {
    setGenBusy(true)
    setGenError(null)
    try {
      const res = await apiGeneratePayouts(period.start, period.end)
      setShowGenerate(false)
      setToast({
        msg: res.created ? `Generated ${res.created} payout${res.created === 1 ? '' : 's'}.` : (res.message ?? 'Nothing to generate.'),
        tone: res.created ? 'success' : 'error',
      })
      await load()
    } catch (err: any) {
      setGenError(err?.message || 'Could not generate payouts.')
    } finally {
      setGenBusy(false)
    }
  }

  const markPaid = async (p: AdminPayout) => {
    setBusyId(p.id)
    try {
      await apiSetPayoutStatus(p.id, 'paid')
      setToast({ msg: `Marked ${p.lawyer_name} as paid.`, tone: 'success' })
      await load()
    } catch (err: any) {
      setToast({ msg: err?.message || 'Could not update the payout.', tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  const release = async (p: AdminPayout) => {
    setBusyId(p.id)
    try {
      await apiSetPayoutStatus(p.id, 'pending')
      setToast({ msg: 'Hold released.', tone: 'success' })
      await load()
    } catch (err: any) {
      setToast({ msg: err?.message || 'Could not release the hold.', tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  const exportCsv = () => {
    const blob = new Blob([toCsv(payouts)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `legalx-payouts-${filter}-page-${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Payouts</h1>
          <p className="text-sm text-slate-400">
            Platform fee 20%. TDS 10% with PAN on file, 20% without.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportCsv}
            disabled={payouts.length === 0}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors disabled:opacity-40"
          >
            <Download size={15} /> CSV
          </button>
          <button
            onClick={() => { setPeriod(defaultPeriod()); setGenError(null); setShowGenerate(true) }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
          >
            <Play size={15} /> Generate cycle
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-full sm:w-fit overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap capitalize transition-colors ${
              filter === f ? 'bg-[#C9A227] text-[#0A0D14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={6} />
      ) : payouts.length === 0 ? (
        <EmptyState
          title="No payouts here"
          hint='Use "Generate cycle" to build payouts from paid consultations in a date range.'
        />
      ) : (
        <>
          <div className="hidden lg:block rounded-xl bg-white/[0.03] border border-white/8 overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-white/8 text-left">
                  {['Lawyer', 'Period', 'Gross', 'Fee', 'TDS', 'Net', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payouts.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{p.lawyer_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {!p.has_pan && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-bold uppercase">
                            No PAN · 20%
                          </span>
                        )}
                        {p.fy_cumulative_gross > TDS_WARN_THRESHOLD && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase">
                            <AlertTriangle size={10} /> FY {formatCurrency(p.fy_cumulative_gross)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                      {formatDate(p.period_start)} — {formatDate(p.period_end)}
                      <span className="block text-slate-600">{p.transaction_count} txns</span>
                    </td>
                    <td className="px-4 py-3 text-slate-200 tabular-nums">{formatCurrency(p.gross_amount)}</td>
                    <td className="px-4 py-3 text-slate-400 tabular-nums">{formatCurrency(p.platform_fee)}</td>
                    <td className="px-4 py-3 text-amber-400 tabular-nums">{formatCurrency(p.tds_amount)}</td>
                    <td className="px-4 py-3 text-white font-bold tabular-nums">{formatCurrency(p.net_amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status === 'held' ? 'suspended' : p.status} />
                      {p.hold_reason && (
                        <p className="text-[11px] text-rose-400 mt-1 max-w-[160px]">{p.hold_reason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {p.status !== 'paid' && p.status !== 'held' && (
                          <>
                            <button
                              onClick={() => markPaid(p)}
                              disabled={busyId === p.id}
                              className="px-2.5 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              Paid
                            </button>
                            <button
                              onClick={() => setHoldTarget(p)}
                              disabled={busyId === p.id}
                              className="px-2.5 h-8 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              Hold
                            </button>
                          </>
                        )}
                        {p.status === 'held' && (
                          <button
                            onClick={() => release(p)}
                            disabled={busyId === p.id}
                            className="px-2.5 h-8 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Release
                          </button>
                        )}
                        {p.status === 'paid' && (
                          <span className="text-xs text-slate-600">Settled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {payouts.map(p => (
              <div key={p.id} className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{p.lawyer_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(p.period_start)} — {formatDate(p.period_end)}
                    </p>
                  </div>
                  <StatusBadge status={p.status === 'held' ? 'suspended' : p.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <span className="text-slate-400">Gross <span className="text-slate-200 tabular-nums">{formatCurrency(p.gross_amount)}</span></span>
                  <span className="text-slate-400">Fee <span className="text-slate-200 tabular-nums">{formatCurrency(p.platform_fee)}</span></span>
                  <span className="text-slate-400">TDS <span className="text-amber-400 tabular-nums">{formatCurrency(p.tds_amount)}</span></span>
                  <span className="text-slate-400">Net <span className="text-white font-bold tabular-nums">{formatCurrency(p.net_amount)}</span></span>
                </div>

                {!p.has_pan && (
                  <p className="mt-2 text-[11px] text-rose-400 font-semibold">No PAN on file — TDS at 20%</p>
                )}
                {p.hold_reason && <p className="mt-2 text-xs text-rose-400">{p.hold_reason}</p>}

                <div className="mt-3 flex gap-2">
                  {p.status !== 'paid' && p.status !== 'held' && (
                    <>
                      <button
                        onClick={() => markPaid(p)}
                        disabled={busyId === p.id}
                        className="flex-1 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Mark paid
                      </button>
                      <button
                        onClick={() => setHoldTarget(p)}
                        disabled={busyId === p.id}
                        className="flex-1 h-9 rounded-lg border border-white/15 bg-white/5 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Hold
                      </button>
                    </>
                  )}
                  {p.status === 'held' && (
                    <button
                      onClick={() => release(p)}
                      disabled={busyId === p.id}
                      className="flex-1 h-9 rounded-lg bg-[#C9A227] text-[#0A0D14] text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      Release hold
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}

      <Modal open={showGenerate} title="Generate payout cycle" onClose={genBusy ? () => {} : () => setShowGenerate(false)}>
        <p className="text-sm text-slate-400 mb-4">
          Builds one payout per lawyer from paid consultations in this window. Re-running
          the same period updates existing rows rather than duplicating them.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">From</label>
            <input
              type="date"
              value={period.start}
              onChange={e => setPeriod(p => ({ ...p, start: e.target.value }))}
              className="w-full h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">To</label>
            <input
              type="date"
              value={period.end}
              onChange={e => setPeriod(p => ({ ...p, end: e.target.value }))}
              className="w-full h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
            />
          </div>
        </div>

        {genError && <p className="mb-3 text-xs text-rose-400">{genError}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => setShowGenerate(false)}
            disabled={genBusy}
            className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={generate}
            disabled={genBusy || !period.start || !period.end}
            className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-60"
          >
            {genBusy ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </Modal>

      <ReasonModal
        open={!!holdTarget}
        title={`Hold payout — ${holdTarget?.lawyer_name ?? ''}`}
        label="Reason for hold"
        placeholder="e.g. Bank details unverified; awaiting PAN."
        confirmLabel="Hold payout"
        destructive
        onCancel={() => setHoldTarget(null)}
        onConfirm={async reason => {
          if (!holdTarget) return
          await apiHoldPayout(holdTarget.id, reason)
          setHoldTarget(null)
          setToast({ msg: 'Payout held.', tone: 'success' })
          await load()
        }}
      />

      <Toast message={toast?.msg ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </div>
  )
}
