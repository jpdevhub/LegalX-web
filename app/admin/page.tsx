'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Clock, Users, UserCircle, ShieldAlert, IndianRupee, Wallet,
  AlertTriangle, ArrowRight,
} from 'lucide-react'
import {
  apiGetAdminStats, apiGetAuditLog,
  type AdminStats, type AuditEntry,
} from '@/lib/api'
import {
  formatCurrency, formatDateTime, ErrorState, SkeletonRows,
} from '@/components/admin/AdminUI'

const ACTION_LABELS: Record<string, string> = {
  APPROVE_LAWYER:        'approved a lawyer',
  REJECT_LAWYER:         'rejected a lawyer',
  SUSPEND_LAWYER:        'suspended a lawyer',
  REINSTATE_LAWYER:      'reinstated a lawyer',
  FLAG_LAWYER:           'flagged a lawyer',
  BULK_APPROVE_LAWYERS:  'bulk-approved lawyers',
  BULK_REJECT_LAWYERS:   'bulk-rejected lawyers',
  ADJUST_CLIENT_WALLET:  'adjusted a client wallet',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // The audit feed depends on a table that may not exist yet; a failure there
  // must not blank out the KPIs, so it's tracked separately.
  const [auditError, setAuditError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setAuditError(false)
    try {
      const s = await apiGetAdminStats()
      setStats(s)
    } catch (err: any) {
      setError(err?.message || 'Could not load dashboard stats.')
      setLoading(false)
      return
    }
    try {
      const log = await apiGetAuditLog({ pageSize: 10 })
      setAudit(log.items)
    } catch {
      setAuditError(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const cards = stats ? [
    { title: 'Pending Verifications', value: stats.pendingApprovals, icon: Clock,       href: '/admin/lawyers', accent: stats.pendingApprovals > 0 },
    { title: 'Active Lawyers',        value: stats.verifiedLawyers,  icon: Users,       href: '/admin/lawyers?tab=directory' },
    { title: 'Total Clients',         value: stats.totalClients,     icon: UserCircle,  href: '/admin/clients' },
    { title: 'Open Disputes',         value: stats.openDisputes,     icon: ShieldAlert, href: '/admin/disputes', accent: stats.openDisputes > 0 },
    { title: 'MTD Revenue',           value: formatCurrency(stats.mtdRevenue), icon: IndianRupee, href: '/admin/analytics' },
    { title: 'Pending Payouts',       value: stats.pendingPayouts,   icon: Wallet,      href: '/admin/payouts' },
  ] : []

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Dashboard</h1>
          <p className="text-sm text-slate-400">Live platform overview.</p>
        </div>
        <Link
          href="/admin/lawyers"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
        >
          Verification queue
          <ArrowRight size={16} />
        </Link>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {/* SLA breach banner */}
      {stats && stats.slaBreaches > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25"
        >
          <AlertTriangle size={18} className="text-rose-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-rose-300">
              {stats.slaBreaches} {stats.slaBreaches === 1 ? 'application has' : 'applications have'} breached the 24-hour review SLA
            </p>
            <p className="text-xs text-rose-400/80 mt-0.5">
              Review the oldest applications first to bring the queue back within target.
            </p>
          </div>
          <Link
            href="/admin/lawyers"
            className="shrink-0 self-center px-3 h-9 inline-flex items-center rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold transition-colors"
          >
            Review
          </Link>
        </motion.div>
      )}

      {/* KPI cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[104px] rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
              >
                <Link
                  href={card.href}
                  className={`block rounded-xl p-5 border transition-colors ${
                    card.accent
                      ? 'bg-[#C9A227]/[0.07] border-[#C9A227]/25 hover:border-[#C9A227]/45'
                      : 'bg-white/[0.03] border-white/8 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className={`p-2 rounded-lg ${card.accent ? 'bg-[#C9A227]/15 text-[#D4AF37]' : 'bg-white/5 text-slate-400'}`}>
                      <Icon size={17} />
                    </span>
                    <p className="text-sm text-slate-400">{card.title}</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">{card.value}</p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Revenue split */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5">
            <p className="text-sm text-slate-400 mb-1">MTD Consultation Revenue</p>
            <p className="text-xl font-bold text-white">{formatCurrency(stats.mtdConsultationRevenue)}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5">
            <p className="text-sm text-slate-400 mb-1">MTD Document Revenue</p>
            <p className="text-xl font-bold text-white">{formatCurrency(stats.mtdDocumentRevenue)}</p>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="rounded-xl bg-white/[0.03] border border-white/8 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">Recent Admin Activity</h2>
          <Link href="/admin/audit-log" className="text-xs text-[#D4AF37] hover:text-white transition-colors">
            View all
          </Link>
        </div>

        <div className="p-5">
          {loading ? (
            <SkeletonRows rows={4} />
          ) : auditError ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Audit log unavailable — the <code className="text-slate-400">audit_log</code> table may not exist yet.
            </p>
          ) : audit.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              No admin actions recorded yet.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {audit.map(entry => (
                <li key={entry.id} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold text-white">{entry.admin_name}</span>{' '}
                      {ACTION_LABELS[entry.action] ?? entry.action.toLowerCase().replace(/_/g, ' ')}
                    </p>
                    {entry.entity_id && (
                      <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                        {entry.entity_type}: {entry.entity_id}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                    {formatDateTime(entry.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
