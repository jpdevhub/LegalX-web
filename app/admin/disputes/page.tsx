'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiGetDisputes, apiUpdateDispute, type AdminDispute, type DisputeStatus } from '@/lib/api'
import {
  StatusBadge, Modal, EmptyState, ErrorState, SkeletonRows,
  Pagination, Toast, formatDateTime,
} from '@/components/admin/AdminUI'

const PAGE_SIZE = 20

const FILTERS: { id: string; label: string }[] = [
  { id: 'open',          label: 'Open' },
  { id: 'investigating', label: 'Investigating' },
  { id: 'escalated',     label: 'Escalated' },
  { id: 'resolved',      label: 'Resolved' },
  { id: 'all',           label: 'All' },
]

// Which states an admin may move a ticket into from where it is now.
const NEXT_STATES: Record<DisputeStatus, DisputeStatus[]> = {
  open:          ['investigating', 'resolved', 'escalated'],
  investigating: ['resolved', 'escalated'],
  escalated:     ['investigating', 'resolved'],
  resolved:      ['investigating'],
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('open')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [active, setActive] = useState<AdminDispute | null>(null)
  const [nextStatus, setNextStatus] = useState<DisputeStatus>('investigating')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetDisputes({ status: filter, page, pageSize: PAGE_SIZE })
      setDisputes(res.items)
      setTotal(res.total)
    } catch (err: any) {
      setError(err?.message || 'Could not load disputes.')
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [filter])

  const openTicket = (d: AdminDispute) => {
    setActive(d)
    setNextStatus(NEXT_STATES[d.status][0] ?? d.status)
    setNote(d.resolution_note ?? '')
    setModalError(null)
  }

  const save = async () => {
    if (!active) return
    // A resolution note is the record of *why* a ticket closed — required.
    if (nextStatus === 'resolved' && note.trim().length < 3) {
      setModalError('A resolution note is required when resolving a dispute.')
      return
    }
    setBusy(true)
    setModalError(null)
    try {
      await apiUpdateDispute(active.id, nextStatus, note.trim() || undefined)
      setActive(null)
      setToast({ msg: `Dispute marked ${nextStatus}.`, tone: 'success' })
      await load()
    } catch (err: any) {
      setModalError(err?.message || 'Could not update the dispute.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Disputes</h1>
        <p className="text-sm text-slate-400">Client and lawyer tickets awaiting resolution.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-full sm:w-fit overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === f.id ? 'text-[#0A0D14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {filter === f.id && (
              <motion.span
                layoutId="disputeTab"
                className="absolute inset-0 bg-[#C9A227] rounded-lg"
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative z-10">{f.label}</span>
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={6} />
      ) : disputes.length === 0 ? (
        <EmptyState
          title={filter === 'open' ? 'No open disputes' : 'No disputes match this filter'}
          hint="Tickets raised by clients or lawyers will appear here."
        />
      ) : (
        <div className="space-y-3">
          {disputes.map(d => (
            <button
              key={d.id}
              onClick={() => openTicket(d)}
              className="w-full text-left rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/20 p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white line-clamp-2">{d.reason}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Client <span className="text-slate-200">{d.client_name ?? '—'}</span>
                    {d.lawyer_name && (
                      <>
                        <span className="mx-2 text-slate-700">·</span>
                        Lawyer <span className="text-slate-200">{d.lawyer_name}</span>
                      </>
                    )}
                    <span className="mx-2 text-slate-700">·</span>
                    {formatDateTime(d.created_at)}
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              {d.resolution_note && (
                <p className="mt-3 text-xs text-slate-400 p-2.5 rounded-lg bg-white/[0.03] border border-white/8">
                  <span className="font-semibold text-slate-300">Resolution: </span>
                  {d.resolution_note}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && !error && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}

      <Modal open={!!active} title="Dispute detail" onClose={busy ? () => {} : () => setActive(null)}>
        {active && (
          <>
            <div className="space-y-3 mb-5">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Reason</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{active.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Client</p>
                  <p className="text-sm text-slate-200">{active.client_name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Lawyer</p>
                  <p className="text-sm text-slate-200">{active.lawyer_name ?? '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Opened</p>
                <p className="text-sm text-slate-200">{formatDateTime(active.created_at)}</p>
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Move to
            </label>
            <select
              value={nextStatus}
              onChange={e => setNextStatus(e.target.value as DisputeStatus)}
              className="w-full h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60 mb-4"
            >
              {NEXT_STATES[active.status].map(s => (
                <option key={s} value={s} className="bg-[#111318]">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Resolution note {nextStatus === 'resolved' && <span className="text-rose-400">*</span>}
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="What was decided, and why."
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 resize-none"
            />
            {modalError && <p className="mt-2 text-xs text-rose-400">{modalError}</p>}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setActive(null)}
                disabled={busy}
                className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={busy}
                className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-60"
              >
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Toast message={toast?.msg ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </div>
  )
}
