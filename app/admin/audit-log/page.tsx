'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { apiGetAuditLog, type AuditEntry } from '@/lib/api'
import {
  EmptyState, ErrorState, SkeletonRows, Pagination, formatDateTime,
} from '@/components/admin/AdminUI'

const PAGE_SIZE = 50

const ENTITY_TYPES = ['all', 'lawyer', 'client', 'dispute', 'payout', 'article']

function toCsv(rows: AuditEntry[]): string {
  const header = ['Timestamp', 'Admin', 'Action', 'Entity Type', 'Entity ID', 'IP', 'Before', 'After']
  // Escape by doubling quotes — the standard CSV rule, and JSON payloads are
  // full of quotes and commas.
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map(r => [
    r.created_at, r.admin_name, r.action, r.entity_type, r.entity_id ?? '',
    r.ip_address ?? '', JSON.stringify(r.before_data ?? {}), JSON.stringify(r.after_data ?? {}),
  ].map(esc).join(','))
  return [header.join(','), ...lines].join('\n')
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [entityType, setEntityType] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetAuditLog({
        entity_type: entityType === 'all' ? undefined : entityType,
        // Widen the end date to the whole day, otherwise "to = today" excludes today.
        from: from ? new Date(from + 'T00:00:00').toISOString() : undefined,
        to: to ? new Date(to + 'T23:59:59').toISOString() : undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setEntries(res.items)
      setTotal(res.total)
    } catch (err: any) {
      setError(err?.message || 'Could not load the audit log.')
    } finally {
      setLoading(false)
    }
  }, [entityType, from, to, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [entityType, from, to])

  const exportCsv = () => {
    const blob = new Blob([toCsv(entries)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `legalx-audit-log-page-${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Audit Log</h1>
          <p className="text-sm text-slate-400">
            Every admin mutation, oldest to newest. Records are append-only.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={entries.length === 0}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors disabled:opacity-40"
        >
          <Download size={15} /> Export page CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={entityType}
          onChange={e => setEntityType(e.target.value)}
          className="h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
        >
          {ENTITY_TYPES.map(t => (
            <option key={t} value={t} className="bg-[#111318]">
              {t === 'all' ? 'All entity types' : t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
        />
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
        />
        {(from || to || entityType !== 'all') && (
          <button
            onClick={() => { setEntityType('all'); setFrom(''); setTo('') }}
            className="h-11 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={8} />
      ) : entries.length === 0 ? (
        <EmptyState title="No audit entries" hint="Admin actions will appear here as they happen." />
      ) : (
        <div className="rounded-xl bg-white/[0.03] border border-white/8 divide-y divide-white/5">
          {entries.map(e => {
            const open = expanded === e.id
            const hasPayload = e.before_data || e.after_data
            return (
              <div key={e.id}>
                <button
                  onClick={() => setExpanded(open ? null : e.id)}
                  disabled={!hasPayload}
                  className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors disabled:cursor-default"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-semibold">
                        {e.action.replace(/_/g, ' ')}
                        <span className="ml-2 px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold uppercase text-slate-400">
                          {e.entity_type}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        by <span className="text-slate-300">{e.admin_name}</span>
                        {e.entity_id && (
                          <>
                            <span className="mx-2 text-slate-700">·</span>
                            <span className="font-mono">{e.entity_id.slice(0, 8)}…</span>
                          </>
                        )}
                        {e.ip_address && (
                          <>
                            <span className="mx-2 text-slate-700">·</span>
                            {e.ip_address}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(e.created_at)}
                      </span>
                      {hasPayload && (
                        <ChevronDown
                          size={15}
                          className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </div>
                </button>

                {open && hasPayload && (
                  <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Before</p>
                      <pre className="text-xs text-slate-300 bg-black/40 border border-white/8 rounded-lg p-3 overflow-x-auto">
                        {JSON.stringify(e.before_data ?? {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">After</p>
                      <pre className="text-xs text-slate-300 bg-black/40 border border-white/8 rounded-lg p-3 overflow-x-auto">
                        {JSON.stringify(e.after_data ?? {}, null, 2)}
                      </pre>
                    </div>
                  </div>
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
