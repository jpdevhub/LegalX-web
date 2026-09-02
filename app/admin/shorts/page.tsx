'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Sparkles, Plus, ExternalLink, Check, X, Quote } from 'lucide-react'
import {
  apiGetAdminShorts, apiUpdateShort, apiBulkShorts, apiGetShortsFeeds,
  apiRunIngest, apiIngestShort,
  type AdminShort, type ShortsFeedOption, type IngestReport,
} from '@/lib/api'
import {
  Modal, ReasonModal, EmptyState, ErrorState, SkeletonRows,
  Pagination, Toast, formatDateTime,
} from '@/components/admin/AdminUI'

const PAGE_SIZE = 20

const CATEGORIES = [
  'Criminal', 'Civil', 'Corporate', 'Family', 'Property',
  'Tax', 'Labour', 'Constitutional', 'Consumer',
]

const CONFIDENCE_TONE: Record<string, string> = {
  high:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  low:    'bg-rose-500/15 text-rose-400 border-rose-500/25',
}

export default function AdminShortsPage() {
  const [shorts, setShorts] = useState<AdminShort[]>([])
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [feeds, setFeeds] = useState<ShortsFeedOption[]>([])
  const [showFetch, setShowFetch] = useState(false)
  const [showPaste, setShowPaste] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [editing, setEditing] = useState<AdminShort | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetAdminShorts({ status, page, pageSize: PAGE_SIZE })
      setShorts(res.items)
      setTotal(res.total)
      setCounts(res.counts)
    } catch (err: any) {
      setError(err?.message || 'Could not load the queue.')
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1); setSelected(new Set()) }, [status])
  useEffect(() => { apiGetShortsFeeds().then(setFeeds).catch(() => {}) }, [])

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allSelected = shorts.length > 0 && shorts.every(s => selected.has(s.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(shorts.map(s => s.id)))

  const runBulk = async (action: 'approve' | 'reject', reason?: string) => {
    setBusy(true)
    try {
      const res = await apiBulkShorts([...selected], action, reason)
      setToast({
        msg: action === 'approve'
          ? `Published ${res.changed} to the Knowledge Center.`
          : `Rejected ${res.changed}.`,
        tone: 'success',
      })
      setSelected(new Set())
      setShowReject(false)
      await load()
    } catch (err: any) {
      setToast({ msg: err?.message || 'Action failed.', tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const tabs = useMemo(() => ([
    { id: 'pending' as const,  label: 'Suggestions', count: counts.pending },
    { id: 'approved' as const, label: 'Published',   count: counts.approved },
    { id: 'rejected' as const, label: 'Rejected',    count: counts.rejected },
  ]), [counts])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Knowledge Center</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            The pipeline proposes more than you need — pick the best 3–4. Every suggestion
            carries a verbatim quote from its source; anything the model could not ground
            in the text was discarded before it reached this queue.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowPaste(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors"
          >
            <Plus size={15} /> Add source
          </button>
          <button
            onClick={() => setShowFetch(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
          >
            <Sparkles size={15} /> Generate suggestions
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-full sm:w-fit overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setStatus(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              status === t.id ? 'bg-[#C9A227] text-[#0A0D14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
            {t.count > 0 && <span className="ml-1.5 opacity-70">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Batch action bar */}
      {status === 'pending' && selected.size > 0 && (
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 p-3 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 backdrop-blur-md flex-wrap">
          <p className="text-sm font-semibold text-[#D4AF37]">{selected.size} selected</p>
          <div className="flex gap-2">
            <button
              onClick={() => runBulk('approve')}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Check size={15} /> Approve & publish
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <X size={15} /> Reject
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={5} />
      ) : shorts.length === 0 ? (
        <EmptyState
          title={status === 'pending' ? 'No suggestions waiting' : `Nothing ${status}`}
          hint={status === 'pending' ? 'Use "Generate suggestions" to run the pipeline now.' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {status === 'pending' && (
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-4 h-4 rounded accent-[#C9A227] cursor-pointer"
              />
              Select all on this page
            </label>
          )}

          {shorts.map(s => (
            <div
              key={s.id}
              className={`rounded-xl border p-4 transition-colors ${
                selected.has(s.id)
                  ? 'bg-[#C9A227]/[0.07] border-[#C9A227]/40'
                  : 'bg-white/[0.03] border-white/8'
              }`}
            >
              <div className="flex items-start gap-3">
                {status === 'pending' && (
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    className="mt-1 w-4 h-4 rounded accent-[#C9A227] cursor-pointer shrink-0"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-slate-300">{s.category}</span>
                    {s.relevance_score != null && (
                      <span className="px-2 py-0.5 rounded bg-[#C9A227]/15 text-[11px] font-bold text-[#D4AF37]">
                        Relevance {s.relevance_score}/5
                      </span>
                    )}
                    {s.confidence && (
                      <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold uppercase ${CONFIDENCE_TONE[s.confidence]}`}>
                        {s.confidence} confidence
                      </span>
                    )}
                    {s.source_name && (
                      <span className="text-[11px] text-slate-500">{s.source_name}</span>
                    )}
                  </div>

                  <p className="text-base font-semibold text-white">{s.title}</p>
                  <p className="text-sm text-slate-400 mt-1.5">{s.summary}</p>

                  {s.takeaway && (
                    <p className="text-sm text-[#D4AF37] mt-2">💡 {s.takeaway}</p>
                  )}

                  {/* The grounding anchor. Shown so the editor can check the
                      summary against the source in one glance. */}
                  {s.evidence && (
                    <div className="mt-3 flex gap-2 p-2.5 rounded-lg bg-black/30 border border-white/8">
                      <Quote size={13} className="text-slate-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 italic leading-relaxed">{s.evidence}</p>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 mt-2">
                    {formatDateTime(s.created_at)}
                    {s.tags && s.tags.length > 0 && <> · {s.tags.join(', ')}</>}
                  </p>

                  {s.rejected_reason && (
                    <p className="mt-2 text-xs text-rose-400">Rejected: {s.rejected_reason}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setEditing(s)}
                      className="px-3 h-8 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Edit
                    </button>
                    {s.source_url && (
                      <a
                        href={s.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Source <ExternalLink size={12} />
                      </a>
                    )}
                    {s.is_published && s.slug && (
                      <a
                        href={`/knowledge-center/${s.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 h-8 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 text-xs font-semibold transition-colors"
                      >
                        View live
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}

      <GenerateModal
        open={showFetch}
        feeds={feeds}
        onClose={() => setShowFetch(false)}
        onDone={async (msg, tone) => { setShowFetch(false); setToast({ msg, tone }); await load() }}
      />
      <AddSourceModal
        open={showPaste}
        onClose={() => setShowPaste(false)}
        onDone={async (msg, tone) => { setShowPaste(false); setToast({ msg, tone }); await load() }}
      />
      <ReasonModal
        open={showReject}
        title={`Reject ${selected.size} suggestion${selected.size === 1 ? '' : 's'}`}
        label="Why?"
        placeholder="Kept on record so the same item is not re-suggested tomorrow."
        confirmLabel="Reject"
        destructive
        onCancel={() => setShowReject(false)}
        onConfirm={reason => runBulk('reject', reason)}
      />
      <EditModal
        short={editing}
        onClose={() => setEditing(null)}
        onDone={async (msg, tone) => { setEditing(null); setToast({ msg, tone }); await load() }}
      />

      <Toast message={toast?.msg ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </div>
  )
}

// ── Generate suggestions ──────────────────────────────────────────────────────

function GenerateModal({ open, feeds, onClose, onDone }: {
  open: boolean
  feeds: ShortsFeedOption[]
  onClose: () => void
  onDone: (msg: string, tone: 'success' | 'error') => void | Promise<void>
}) {
  const [limit, setLimit] = useState(8)
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState<IngestReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (open) { setError(null); setBusy(false); setReport(null) } }, [open])

  const run = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await apiRunIngest(limit)
      setReport(res)
      if (res.proposed === 0) {
        setError('Nothing new proposed. See the reasons below.')
        setBusy(false)
        return
      }
      await onDone(`Proposed ${res.proposed} suggestion${res.proposed === 1 ? '' : 's'} for review.`, 'success')
    } catch (err: any) {
      setError(err?.message || 'Generation failed.')
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="Generate suggestions" onClose={busy ? () => {} : onClose}>
      <p className="text-sm text-slate-400 mb-4">
        Pulls from the enabled sources, summarises each under the grounding rules, and
        files whatever survives for your review. Items already seen — including ones you
        rejected before — are skipped.
      </p>

      {feeds.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/8">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Active sources</p>
          {feeds.filter(f => f.enabled).map(f => (
            <div key={f.id} className="mb-1.5 last:mb-0">
              <p className="text-xs text-slate-300">{f.label}</p>
              <p className="text-[11px] text-slate-600">{f.licenceNote}</p>
            </div>
          ))}
          {feeds.filter(f => f.enabled).length === 0 && (
            <p className="text-xs text-rose-400">No sources enabled.</p>
          )}
        </div>
      )}

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        How many to propose
      </label>
      <input
        type="number"
        min={1}
        max={20}
        value={limit}
        onChange={e => setLimit(Number(e.target.value))}
        className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
      />
      <p className="mt-1.5 text-xs text-slate-600">
        Aim for roughly twice what you intend to publish. The free summarisation tier is
        8,000 tokens per minute, so a large batch takes a few minutes.
      </p>

      {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

      {report && (report.skipped.length > 0 || report.failed.length > 0) && (
        <div className="mt-4 max-h-40 overflow-y-auto rounded-lg bg-black/30 border border-white/8 p-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Rejected by the grounding checks
          </p>
          {report.skipped.map((s, i) => (
            <p key={i} className="text-[11px] text-slate-500 mb-1.5">
              <span className="text-slate-400">{s.title}</span> — {s.reason}
            </p>
          ))}
          {report.failed.map((f, i) => (
            <p key={`f${i}`} className="text-[11px] text-rose-400/70 mb-1">{f.error}</p>
          ))}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          onClick={onClose}
          disabled={busy}
          className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
        >
          Close
        </button>
        <button
          onClick={run}
          disabled={busy}
          className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-60"
        >
          {busy ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </Modal>
  )
}

// ── Add a source manually ─────────────────────────────────────────────────────

function AddSourceModal({ open, onClose, onDone }: {
  open: boolean
  onClose: () => void
  onDone: (msg: string, tone: 'success' | 'error') => void | Promise<void>
}) {
  const [sourceUrl, setSourceUrl] = useState('')
  const [rawText, setRawText] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setSourceUrl(''); setRawText(''); setSourceName(''); setError(null); setBusy(false) }
  }, [open])

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await apiIngestShort({
        sourceUrl: sourceUrl.trim(),
        rawText: rawText.trim() || undefined,
        sourceName: sourceName.trim() || undefined,
      })
      await onDone('Suggestion created.', 'success')
    } catch (err: any) {
      setError(err?.message || 'Could not summarise.')
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="Add a source" onClose={busy ? () => {} : onClose}>
      <p className="text-sm text-slate-400 mb-4">
        Paste the URL of an official source and the backend will fetch and summarise it.
        The Text box is only for when the fetch fails (PDFs, captcha-gated portals) — paste
        the <em className="not-italic text-slate-300">actual document</em> there, not a topic
        or a search phrase. There is no web search: every card must be grounded in a real
        source document.
      </p>

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        Source URL
      </label>
      <input
        value={sourceUrl}
        onChange={e => setSourceUrl(e.target.value)}
        placeholder="https://pib.gov.in/..."
        className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 mb-4"
      />

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        Source name <span className="text-slate-600 normal-case font-normal">(optional)</span>
      </label>
      <input
        value={sourceName}
        onChange={e => setSourceName(e.target.value)}
        placeholder="Supreme Court of India"
        className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 mb-4"
      />

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        Document text <span className="text-slate-600 normal-case font-normal">(optional — leave blank to fetch the URL)</span>
      </label>
      <textarea
        value={rawText}
        onChange={e => setRawText(e.target.value)}
        rows={8}
        placeholder="Paste the full text of the judgment, notification or press release…"
        className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 resize-none"
      />
      {rawText.length > 0 && (
        <p className={`mt-1.5 text-xs ${rawText.length < 250 ? 'text-amber-400' : 'text-slate-600'}`}>
          {rawText.length.toLocaleString()} characters
          {rawText.length < 250 && ' — under 250, so the URL will be fetched instead'}
        </p>
      )}

      {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

      <div className="mt-5 flex gap-3">
        <button
          onClick={onClose}
          disabled={busy}
          className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={busy || !sourceUrl.trim()}
          className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-50"
        >
          {busy ? 'Summarising…' : 'Summarise'}
        </button>
      </div>
    </Modal>
  )
}

// ── Edit ──────────────────────────────────────────────────────────────────────

function EditModal({ short, onClose, onDone }: {
  short: AdminShort | null
  onClose: () => void
  onDone: (msg: string, tone: 'success' | 'error') => void | Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [takeaway, setTakeaway] = useState('')
  const [category, setCategory] = useState('Civil')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (short) {
      setTitle(short.title)
      setSummary(short.summary)
      setTakeaway(short.takeaway ?? '')
      setCategory(short.category)
      setError(null)
      setBusy(false)
    }
  }, [short])

  const save = async (publish: boolean) => {
    if (!short) return
    setBusy(true)
    setError(null)
    try {
      await apiUpdateShort(short.id, {
        title: title.trim(),
        summary: summary.trim(),
        takeaway: takeaway.trim(),
        category,
        ...(publish ? { isPublished: true } : {}),
      })
      await onDone(publish ? 'Edited and published.' : 'Saved.', 'success')
    } catch (err: any) {
      setError(err?.message || 'Could not save.')
      setBusy(false)
    }
  }

  return (
    <Modal open={!!short} title="Edit suggestion" onClose={busy ? () => {} : onClose}>
      {short?.evidence && (
        <div className="mb-4 p-3 rounded-lg bg-black/30 border border-white/8">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Source quote — check your edit against this
          </p>
          <p className="text-xs text-slate-400 italic">{short.evidence}</p>
        </div>
      )}

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Title</label>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={255}
        className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60 mb-4"
      />

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Summary</label>
      <textarea
        value={summary}
        onChange={e => setSummary(e.target.value)}
        rows={5}
        className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60 resize-none mb-4"
      />

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Takeaway</label>
      <textarea
        value={takeaway}
        onChange={e => setTakeaway(e.target.value)}
        rows={3}
        className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60 resize-none mb-4"
      />

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Category</label>
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="w-full h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
      >
        {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111318]">{c}</option>)}
      </select>

      {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => save(false)}
          disabled={busy}
          className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        {short && !short.is_published && (
          <button
            onClick={() => save(true)}
            disabled={busy}
            className="flex-1 h-11 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-colors disabled:opacity-60"
          >
            Save & publish
          </button>
        )}
      </div>
    </Modal>
  )
}
