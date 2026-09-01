'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { apiGetAdminDocuments, type AdminServiceOrder } from '@/lib/api'
import {
  StatusBadge, EmptyState, ErrorState, SkeletonRows, Pagination,
  formatCurrency, formatDateTime, formatAge, hoursSince,
} from '@/components/admin/AdminUI'

const PAGE_SIZE = 20

// Delivery target for a document order. Green while there's comfortable room,
// amber inside the last 6 hours, red once past.
const SLA_HOURS = 48

const FILTERS = [
  { id: 'active',                label: 'In Progress' },
  { id: 'in_review',             label: 'In Review' },
  { id: 'revision_requested',    label: 'Revisions' },
  { id: 'pending_customer_input',label: 'Awaiting Client' },
  { id: 'completed',             label: 'Completed' },
  { id: 'all',                   label: 'All' },
]

function slaState(createdAt: string, done: boolean) {
  if (done) return { label: 'Delivered', cls: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' }
  const elapsed = hoursSince(createdAt)
  const remaining = SLA_HOURS - elapsed
  if (remaining <= 0) {
    return { label: `Breached by ${Math.floor(-remaining)}h`, cls: 'bg-rose-500/10 border-rose-500/25 text-rose-400' }
  }
  if (remaining < 6) {
    return { label: `${Math.floor(remaining)}h left`, cls: 'bg-amber-500/10 border-amber-500/25 text-amber-400' }
  }
  return { label: `${Math.floor(remaining)}h left`, cls: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' }
}

export default function AdminDocumentsPage() {
  const [orders, setOrders] = useState<AdminServiceOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('active')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 'active' is the backend's default (all in-flight statuses), so it is
      // sent as undefined rather than as a literal status value.
      const res = await apiGetAdminDocuments({
        status: filter === 'active' ? undefined : filter,
        page,
        pageSize: PAGE_SIZE,
      })
      setOrders(res.items)
      setTotal(res.total)
    } catch (err: any) {
      setError(err?.message || 'Could not load document orders.')
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [filter])

  const breached = orders.filter(
    o => o.status !== 'completed' && hoursSince(o.created_at) > SLA_HOURS
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Documents</h1>
        <p className="text-sm text-slate-400">
          Drafting and verification orders, with a {SLA_HOURS}-hour delivery target.
        </p>
      </div>

      {breached > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
          <AlertTriangle size={18} className="text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300">
            <span className="font-semibold">{breached}</span> order{breached === 1 ? '' : 's'} on this page
            {breached === 1 ? ' has' : ' have'} passed the {SLA_HOURS}-hour SLA.
          </p>
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-full overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === f.id ? 'bg-[#C9A227] text-[#0A0D14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={6} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders here" hint="Document orders will appear as clients submit them." />
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const done = o.status === 'completed'
            const sla = slaState(o.created_at, done)
            return (
              <div key={o.id} className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-white">
                      {o.service_title}
                      {o.order_number && (
                        <span className="ml-2 text-xs font-mono text-slate-500">#{o.order_number}</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Client <span className="text-slate-200">{o.client_name}</span>
                      <span className="mx-2 text-slate-700">·</span>
                      Lawyer <span className="text-slate-200">{o.lawyer_name ?? 'Unassigned'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={o.status} />
                    <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${sla.cls}`}>
                      {sla.label}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400">
                  <span>Created <span className="text-slate-200">{formatDateTime(o.created_at)}</span></span>
                  <span>Age <span className="text-slate-200">{formatAge(o.created_at)}</span></span>
                  <span>Value <span className="text-slate-200">{formatCurrency(o.price)}</span></span>
                  {o.completed_at && (
                    <span>Delivered <span className="text-emerald-400">{formatDateTime(o.completed_at)}</span></span>
                  )}
                </div>

                {o.status === 'revision_requested' && (
                  <p className="mt-3 text-xs text-amber-400 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    Client has requested revisions — check the revision count against the 3-revision cap.
                  </p>
                )}

                {o.customer_notes && (
                  <p className="mt-3 text-xs text-slate-400 p-2.5 rounded-lg bg-white/[0.03] border border-white/8">
                    <span className="font-semibold text-slate-300">Client notes: </span>
                    {o.customer_notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}
    </div>
  )
}
