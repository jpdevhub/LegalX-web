'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Star } from 'lucide-react'
import { apiGetAnalytics, type AdminAnalytics } from '@/lib/api'
import { ErrorState, EmptyState, formatCurrency } from '@/components/admin/AdminUI'

// Sequential, distinguishable in both hue and lightness so the series stay
// readable if the chart is printed or viewed by someone colour-blind.
const GOLD = '#C9A227'
const BLUE = '#60A5FA'
const GREEN = '#34D399'

const AXIS = { stroke: '#64748B', tick: { fill: '#64748B', fontSize: 12 }, axisLine: false, tickLine: false }
const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#fff' },
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await apiGetAnalytics())
    } catch (err: any) {
      setError(err?.message || 'Could not load analytics.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const revenueSeries = useMemo(() => {
    if (!data) return []
    return data.months.map(m => ({
      month: monthLabel(m),
      Consultations: data.consultRevenue[m] ?? 0,
      Documents: data.docRevenue[m] ?? 0,
    }))
  }, [data])

  const growthSeries = useMemo(() => {
    if (!data) return []
    return data.months.map(m => ({
      month: monthLabel(m),
      Clients: data.clientSignups[m] ?? 0,
      Lawyers: data.lawyerSignups[m] ?? 0,
    }))
  }, [data])

  const typeSeries = useMemo(() => {
    if (!data) return []
    return Object.entries(data.consultByType).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      Consultations: count,
    }))
  }, [data])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-48 rounded bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-[340px] rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
      </div>
    )
  }

  if (error || !data) return <ErrorState message={error || 'No analytics available.'} onRetry={load} />

  const hasRevenue = revenueSeries.some(r => r.Consultations > 0 || r.Documents > 0)
  const hasGrowth = growthSeries.some(r => r.Clients > 0 || r.Lawyers > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Analytics</h1>
        <p className="text-sm text-slate-400">Last 6 months. Revenue counts paid consultations and completed orders only.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(data.totals.totalRevenue) },
          { label: 'Consultations', value: data.totals.consultations },
          { label: 'Disputes', value: data.totals.disputes },
          { label: 'Dispute Rate', value: `${data.totals.disputeRate}%` },
        ].map(card => (
          <div key={card.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
            <p className="text-xs text-slate-400 mb-1.5">{card.label}</p>
            <p className="text-xl md:text-2xl font-bold text-white tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5">
        <h2 className="text-base font-semibold text-white mb-4">Revenue by Month</h2>
        {hasRevenue ? (
          <div className="h-[300px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="gradConsult" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BLUE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" {...AXIS} />
                <YAxis {...AXIS} tickFormatter={v => v >= 1000 ? `₹${v / 1000}k` : `₹${v}`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => formatCurrency(Number(v ?? 0))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Consultations" stroke={GOLD} strokeWidth={2} fill="url(#gradConsult)" />
                <Area type="monotone" dataKey="Documents" stroke={BLUE} strokeWidth={2} fill="url(#gradDocs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No revenue in this window" hint="Paid consultations and completed orders will chart here." />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5">
          <h2 className="text-base font-semibold text-white mb-4">Signups by Month</h2>
          {hasGrowth ? (
            <div className="h-[260px] -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" {...AXIS} />
                  <YAxis {...AXIS} allowDecimals={false} />
                  <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Clients" fill={GREEN} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lawyers" fill={GOLD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No signups in this window" />
          )}
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5">
          <h2 className="text-base font-semibold text-white mb-4">Consultations by Type</h2>
          {typeSeries.some(t => t.Consultations > 0) ? (
            <div className="h-[260px] -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeSeries} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" {...AXIS} allowDecimals={false} />
                  <YAxis type="category" dataKey="type" {...AXIS} width={70} />
                  <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="Consultations" fill={GOLD} radius={[0, 4, 4, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No consultations yet" />
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">Top Rated Lawyers</h2>
        </div>
        {data.leaderboard.length === 0 ? (
          <EmptyState title="No rated lawyers yet" hint="Lawyers appear here once they receive their first review." />
        ) : (
          <ul className="divide-y divide-white/5">
            {data.leaderboard.map((l, i) => (
              <li key={l.lawyer_id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-sm text-slate-500 tabular-nums shrink-0">{i + 1}</span>
                  <span className="text-sm text-white font-medium truncate">{l.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="inline-flex items-center gap-1 text-sm text-slate-200">
                    <Star size={13} className="text-[#D4AF37] fill-[#D4AF37]" />
                    {l.avg_rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">{l.total_reviews} reviews</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
