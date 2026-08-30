'use client'

import { useEffect, useState } from 'react'
import { apiGetPayoutSummary, type PayoutSummary, type PayoutCycle } from '@/lib/api'

function fmt(n: number) { return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }

const STATUS_STYLE: Record<string, string> = {
  paid:       'bg-emerald-500/15 text-emerald-300',
  processing: 'bg-amber-500/15 text-amber-300',
  pending:    'bg-slate-500/15 text-slate-400',
}

function CycleRow({ cycle }: { cycle: PayoutCycle }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <tr className="border-t border-white/5 hover:bg-white/3 transition-colors cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <td className="py-3.5 px-4 text-slate-300 text-sm whitespace-nowrap">
          {fmtDate(cycle.periodStart)} – {fmtDate(cycle.periodEnd)}
        </td>
        <td className="py-3.5 px-4 text-slate-400 text-sm text-center">{cycle.transactionCount}</td>
        <td className="py-3.5 px-4 text-white text-sm text-right font-medium">{fmt(cycle.grossAmount)}</td>
        <td className="py-3.5 px-4 text-red-400 text-sm text-right">-{fmt(cycle.tdsAmount)}</td>
        <td className="py-3.5 px-4 text-[#C9A227] text-sm text-right font-bold">{fmt(cycle.netAmount)}</td>
        <td className="py-3.5 px-4 text-right">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[cycle.status]}`}>{cycle.status}</span>
        </td>
        <td className="py-3.5 px-4 text-center">
          <svg className={`w-4 h-4 text-slate-600 mx-auto transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </td>
      </tr>
      {expanded && (
        <tr className="border-t border-white/5 bg-white/2">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Consultation', value: cycle.consultationEarnings, color: 'text-purple-300' },
                { label: 'Drafting',     value: cycle.draftingEarnings,     color: 'text-blue-300' },
                { label: 'Verification', value: cycle.verificationEarnings, color: 'text-emerald-300' },
                { label: 'Platform Fee', value: -cycle.platformFee,         color: 'text-red-400' },
              ].map(row => (
                <div key={row.label} className="bg-white/5 rounded-lg p-3 border border-white/8">
                  <p className="text-slate-500 text-xs mb-1">{row.label}</p>
                  <p className={`font-bold text-sm ${row.color}`}>{fmt(Math.abs(row.value))}</p>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function PayoutsPage() {
  const [data, setData] = useState<PayoutSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGetPayoutSummary().then(d => { setData(d); setLoading(false) })
  }, [])

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Payouts & Earnings</h1>
          <p className="text-slate-400 text-sm mt-1">Track your income and transaction history</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors border border-white/10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Monthly Statement (PDF)
        </button>
      </div>

      {/* TDS warning banner */}
      {!loading && data && !data.hasPan && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <div>
            <p className="text-red-300 font-semibold text-sm">PAN Not on File — Higher TDS Rate Applies</p>
            <p className="text-red-400/80 text-xs mt-0.5">Without a PAN, TDS is deducted at 20% instead of the standard 10%. Add your PAN in Settings to reduce your tax deduction.</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0E1220] border border-[#C9A227]/30 rounded-2xl p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">This Cycle (Pending)</p>
          <p className="text-[#C9A227] text-3xl font-bold mt-2">{loading ? '…' : fmt(data?.currentCyclePending ?? 0)}</p>
          <p className="text-slate-500 text-xs mt-1">After TDS deduction</p>
        </div>
        <div className="bg-[#0E1220] border border-white/8 rounded-2xl p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Earned</p>
          <p className="text-white text-3xl font-bold mt-2">{loading ? '…' : fmt(data?.totalEarned ?? 0)}</p>
          <p className="text-slate-500 text-xs mt-1">All time net</p>
        </div>
        <div className="bg-[#0E1220] border border-white/8 rounded-2xl p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">TDS Rate</p>
          <p className={`text-3xl font-bold mt-2 ${data?.hasPan ? 'text-emerald-400' : 'text-red-400'}`}>
            {loading ? '…' : `${data?.tdsRate ?? 20}%`}
          </p>
          <p className="text-slate-500 text-xs mt-1">{data?.hasPan ? 'Standard rate (PAN on file)' : 'Higher rate (no PAN)'}</p>
        </div>
      </div>

      {/* History table */}
      <div className="bg-[#0E1220] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-white font-semibold">Payout History</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}</div>
        ) : !data || data.cycles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500">No payout cycles yet</p>
            <p className="text-slate-600 text-xs mt-1">Complete consultations and documents to start earning</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-white/3">
                  <th className="py-3 px-4 text-left text-xs text-slate-500 font-semibold uppercase tracking-wide">Period</th>
                  <th className="py-3 px-4 text-center text-xs text-slate-500 font-semibold uppercase tracking-wide">Txns</th>
                  <th className="py-3 px-4 text-right text-xs text-slate-500 font-semibold uppercase tracking-wide">Gross</th>
                  <th className="py-3 px-4 text-right text-xs text-slate-500 font-semibold uppercase tracking-wide">TDS</th>
                  <th className="py-3 px-4 text-right text-xs text-slate-500 font-semibold uppercase tracking-wide">Net</th>
                  <th className="py-3 px-4 text-right text-xs text-slate-500 font-semibold uppercase tracking-wide">Status</th>
                  <th className="py-3 px-4 w-8" />
                </tr>
              </thead>
              <tbody>
                {data.cycles.map(c => <CycleRow key={c.id} cycle={c} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
