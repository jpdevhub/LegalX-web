'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Check, X, MessageSquare, Star } from 'lucide-react'
import {
  apiGetAdminLawyers, apiApproveLawyer, apiRejectLawyer,
  apiBulkLawyerAction, apiReinstateLawyer, apiFlagLawyer,
  type AdminLawyer,
} from '@/lib/api'
import {
  StatusBadge, ReasonModal, EmptyState, ErrorState, SkeletonRows,
  Pagination, Toast, formatDate, formatAge, hoursSince, fullName, formatCurrency,
} from '@/components/admin/AdminUI'

type Tab = 'queue' | 'directory' | 'suspended'

const TABS: { id: Tab; label: string; status: string }[] = [
  { id: 'queue',     label: 'Verification Queue', status: 'pending_verification' },
  { id: 'directory', label: 'Directory',          status: 'all' },
  { id: 'suspended', label: 'Suspended',          status: 'suspended' },
]

const PAGE_SIZE = 20

/** SLA colour by wait time: green < 12h, amber 12–24h, red > 24h. */
function slaTone(createdAt: string) {
  const h = hoursSince(createdAt)
  if (h > 24) return { text: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25' }
  if (h > 12) return { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25' }
  return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' }
}

function docCount(l: AdminLawyer): number {
  return [l.enrolment_cert_url, l.bar_id_front_url, l.bar_id_back_url, l.govt_id_url]
    .filter(Boolean).length
}

function AdminLawyersInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialTab = (searchParams.get('tab') as Tab) || 'queue'
  const [tab, setTab] = useState<Tab>(TABS.some(t => t.id === initialTab) ? initialTab : 'queue')

  const [lawyers, setLawyers] = useState<AdminLawyer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [specFilter, setSpecFilter] = useState<string>('all')

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  const [rejectTarget, setRejectTarget] = useState<AdminLawyer | null>(null)
  const [infoTarget, setInfoTarget] = useState<AdminLawyer | null>(null)
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null)

  // Debounce so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const effectiveStatus = useMemo(() => {
    if (tab === 'queue') return 'pending_verification'
    if (tab === 'suspended') return 'suspended'
    return statusFilter === 'all' ? 'all' : statusFilter
  }, [tab, statusFilter])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetAdminLawyers({
        status: effectiveStatus as any,
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setLawyers(res.items)
      setTotal(res.total)
    } catch (err: any) {
      setError(err?.message || 'Could not load lawyers.')
    } finally {
      setLoading(false)
    }
  }, [effectiveStatus, search, page])

  useEffect(() => { load() }, [load])

  const switchTab = (next: Tab) => {
    setTab(next); setPage(1); setSelected(new Set())
    setStatusFilter('all'); setSpecFilter('all')
    router.replace(next === 'queue' ? '/admin/lawyers' : `/admin/lawyers?tab=${next}`)
  }

  // Specialization options come from the loaded page — no separate endpoint.
  const specOptions = useMemo(() => {
    const set = new Set<string>()
    for (const l of lawyers) for (const s of l.specializations ?? []) set.add(s)
    return [...set].sort()
  }, [lawyers])

  const visible = useMemo(() => {
    if (tab !== 'directory' || specFilter === 'all') return lawyers
    return lawyers.filter(l => (l.specializations ?? []).includes(specFilter))
  }, [lawyers, tab, specFilter])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allSelected = visible.length > 0 && visible.every(l => selected.has(l.account_id))
  const toggleSelectAll = () => {
    setSelected(allSelected ? new Set() : new Set(visible.map(l => l.account_id)))
  }

  const approve = async (l: AdminLawyer) => {
    setBusyId(l.account_id)
    try {
      await apiApproveLawyer(l.account_id)
      setToast({ msg: `${fullName(l.first_name, l.last_name)} approved.`, tone: 'success' })
      await load()
    } catch (err: any) {
      setToast({ msg: err?.message || 'Approval failed.', tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  const reject = async (reason: string) => {
    if (!rejectTarget) return
    await apiRejectLawyer(rejectTarget.account_id, reason)
    setToast({ msg: `${fullName(rejectTarget.first_name, rejectTarget.last_name)} rejected.`, tone: 'success' })
    setRejectTarget(null)
    await load()
  }

  const requestInfo = async (reason: string) => {
    if (!infoTarget) return
    await apiFlagLawyer(infoTarget.account_id, 'complaint', `Information requested: ${reason}`)
    setToast({ msg: 'Information request recorded.', tone: 'success' })
    setInfoTarget(null)
    await load()
  }

  const reinstate = async (l: AdminLawyer) => {
    setBusyId(l.account_id)
    try {
      await apiReinstateLawyer(l.account_id)
      setToast({ msg: `${fullName(l.first_name, l.last_name)} reinstated.`, tone: 'success' })
      await load()
    } catch (err: any) {
      setToast({ msg: err?.message || 'Reinstatement failed.', tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  const runBulk = async (reason?: string) => {
    if (!bulkAction) return
    const ids = [...selected]
    const res = await apiBulkLawyerAction(ids, bulkAction, reason)
    const verb = bulkAction === 'approve' ? 'approved' : 'rejected'
    setToast({
      msg: res.failed.length
        ? `${res.succeeded.length} ${verb}, ${res.failed.length} failed.`
        : `${res.succeeded.length} ${verb}.`,
      tone: res.failed.length ? 'error' : 'success',
    })
    setBulkAction(null)
    setSelected(new Set())
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Lawyers</h1>
        <p className="text-sm text-slate-400">Review applications, manage the directory, handle suspensions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-full sm:w-fit overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.id ? 'text-[#0A0D14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="lawyerTab"
                className="absolute inset-0 bg-[#C9A227] rounded-lg"
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search name, email, or bar number…"
            className="w-full h-11 pl-9 pr-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 transition-all"
          />
        </div>

        {tab === 'directory' && (
          <>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
            >
              <option value="all" className="bg-[#111318]">All statuses</option>
              <option value="verified" className="bg-[#111318]">Verified</option>
              <option value="pending_verification" className="bg-[#111318]">Pending</option>
              <option value="rejected" className="bg-[#111318]">Rejected</option>
              <option value="suspended" className="bg-[#111318]">Suspended</option>
              <option value="unverified" className="bg-[#111318]">Unverified</option>
            </select>

            <select
              value={specFilter}
              onChange={e => setSpecFilter(e.target.value)}
              className="h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
            >
              <option value="all" className="bg-[#111318]">All specializations</option>
              {specOptions.map(s => (
                <option key={s} value={s} className="bg-[#111318]">{s}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Bulk bar */}
      {tab === 'queue' && selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/25 flex-wrap"
        >
          <p className="text-sm text-[#D4AF37] font-semibold">{selected.size} selected</p>
          <div className="flex gap-2">
            <button
              onClick={() => setBulkAction('approve')}
              className="px-3 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => setBulkAction('reject')}
              className="px-3 h-9 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold transition-colors"
            >
              Bulk Reject
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={6} />
      ) : visible.length === 0 ? (
        <EmptyState
          title={
            tab === 'queue' ? 'Verification queue is clear'
            : tab === 'suspended' ? 'No suspended lawyers'
            : 'No lawyers match your filters'
          }
          hint={tab === 'queue' ? 'New applications will appear here as they are submitted.' : undefined}
        />
      ) : tab === 'queue' ? (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-[#C9A227] cursor-pointer"
            />
            Select all on this page
          </label>

          {visible.map((l, i) => {
            const sla = slaTone(l.created_at)
            const busy = busyId === l.account_id
            return (
              <motion.div
                key={l.account_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.3 }}
                className="rounded-xl bg-white/[0.03] border border-white/8 p-4"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(l.account_id)}
                    onChange={() => toggleSelect(l.account_id)}
                    className="mt-1 w-4 h-4 rounded accent-[#C9A227] cursor-pointer shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/lawyers/${l.account_id}`}
                          className="text-base font-semibold text-white hover:text-[#D4AF37] transition-colors"
                        >
                          {fullName(l.first_name, l.last_name)}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{l.email}</p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[11px] font-bold ${sla.bg} ${sla.text}`}>
                        Waiting {formatAge(l.created_at)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400">
                      <span>Bar: <span className="text-slate-200">{l.bar_council_number || '—'}</span></span>
                      <span>State: <span className="text-slate-200">{l.bar_council_state || '—'}</span></span>
                      <span>
                        Docs: <span className={docCount(l) === 4 ? 'text-emerald-400' : 'text-amber-400'}>
                          {docCount(l)}/4
                        </span>
                      </span>
                      <span>Applied: <span className="text-slate-200">{formatDate(l.created_at)}</span></span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => approve(l)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        <Check size={15} /> Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(l)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        <X size={15} /> Reject
                      </button>
                      <button
                        onClick={() => setInfoTarget(l)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <MessageSquare size={15} /> Request Info
                      </button>
                      <Link
                        href={`/admin/lawyers/${l.account_id}`}
                        className="inline-flex items-center px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : tab === 'suspended' ? (
        <div className="space-y-3">
          {visible.map(l => (
            <div key={l.account_id} className="rounded-xl bg-white/[0.03] border border-white/8 p-4 flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <Link
                  href={`/admin/lawyers/${l.account_id}`}
                  className="text-base font-semibold text-white hover:text-[#D4AF37] transition-colors"
                >
                  {fullName(l.first_name, l.last_name)}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">{l.email}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Bar: <span className="text-slate-200">{l.bar_council_number || '—'}</span>
                  <span className="mx-2 text-slate-700">·</span>
                  Joined <span className="text-slate-200">{formatDate(l.created_at)}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Full suspension history is on the lawyer's detail page.
                </p>
              </div>
              <button
                onClick={() => reinstate(l)}
                disabled={busyId === l.account_id}
                className="shrink-0 px-3 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {busyId === l.account_id ? 'Working…' : 'Reinstate'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Directory — table on desktop, cards on mobile */
        <>
          <div className="hidden md:block rounded-xl bg-white/[0.03] border border-white/8 overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-white/8 text-left">
                  {['Name', 'Status', 'Services', 'Rating', 'Fee (chat)', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visible.map(l => (
                  <tr
                    key={l.account_id}
                    onClick={() => router.push(`/admin/lawyers/${l.account_id}`)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{fullName(l.first_name, l.last_name)}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[220px]">{l.email}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={l.verification_status} /></td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {[
                        (l.consultation_types?.length ?? 0) > 0 ? 'Consult' : null,
                        (l.document_services?.length ?? 0) > 0 ? 'Docs' : null,
                      ].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {l.avg_rating ? (
                        <span className="inline-flex items-center gap-1 text-slate-200">
                          <Star size={13} className="text-[#D4AF37] fill-[#D4AF37]" />
                          {Number(l.avg_rating).toFixed(1)}
                          <span className="text-slate-600 text-xs">({l.total_reviews ?? 0})</span>
                        </span>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-200 tabular-nums">
                      {l.consultation_fee_chat ? formatCurrency(l.consultation_fee_chat) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {visible.map(l => (
              <Link
                key={l.account_id}
                href={`/admin/lawyers/${l.account_id}`}
                className="block rounded-xl bg-white/[0.03] border border-white/8 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{fullName(l.first_name, l.last_name)}</p>
                    <p className="text-xs text-slate-500 truncate">{l.email}</p>
                  </div>
                  <StatusBadge status={l.verification_status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  {l.avg_rating != null && (
                    <span className="inline-flex items-center gap-1">
                      <Star size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
                      {Number(l.avg_rating).toFixed(1)}
                    </span>
                  )}
                  <span>{l.consultation_fee_chat ? formatCurrency(l.consultation_fee_chat) + '/min' : 'No fee set'}</span>
                  <span>{formatDate(l.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {!loading && !error && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}

      <ReasonModal
        open={!!rejectTarget}
        title={`Reject ${fullName(rejectTarget?.first_name, rejectTarget?.last_name, 'application')}`}
        label="Reason for rejection"
        placeholder="This is emailed to the lawyer and recorded in the audit log."
        confirmLabel="Reject application"
        destructive
        onCancel={() => setRejectTarget(null)}
        onConfirm={reject}
      />

      <ReasonModal
        open={!!infoTarget}
        title="Request additional information"
        label="What do you need from them?"
        placeholder="e.g. Bar ID card back image is unreadable — please re-upload."
        confirmLabel="Record request"
        onCancel={() => setInfoTarget(null)}
        onConfirm={requestInfo}
      />

      <ReasonModal
        open={!!bulkAction}
        title={bulkAction === 'approve'
          ? `Approve ${selected.size} ${selected.size === 1 ? 'lawyer' : 'lawyers'}`
          : `Reject ${selected.size} ${selected.size === 1 ? 'lawyer' : 'lawyers'}`}
        label={bulkAction === 'approve' ? 'Note (recorded in audit log)' : 'Reason for rejection'}
        placeholder={bulkAction === 'approve'
          ? 'e.g. Credentials verified against Bar Council portal.'
          : 'This is emailed to each lawyer.'}
        confirmLabel={bulkAction === 'approve' ? 'Approve all' : 'Reject all'}
        destructive={bulkAction === 'reject'}
        onCancel={() => setBulkAction(null)}
        onConfirm={runBulk}
      />

      <Toast message={toast?.msg ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </div>
  )
}

export default function AdminLawyersPage() {
  return (
    <Suspense fallback={<SkeletonRows rows={6} />}>
      <AdminLawyersInner />
    </Suspense>
  )
}
