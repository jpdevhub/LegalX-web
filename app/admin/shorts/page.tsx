'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, Plus, Trash2, ExternalLink, Check } from 'lucide-react'
import {
  apiGetAdminShorts, apiUpdateShort, apiDeleteShort, apiGetShortsFeeds,
  apiAutoIngestShorts, apiIngestShort,
  type AdminShort, type ShortsFeedOption,
} from '@/lib/api'
import {
  StatusBadge, Modal, EmptyState, ErrorState, SkeletonRows,
  Pagination, Toast, formatDateTime,
} from '@/components/admin/AdminUI'

const PAGE_SIZE = 20

const CATEGORIES = [
  'Criminal', 'Civil', 'Corporate', 'Family', 'Property',
  'Tax', 'Labour', 'Constitutional', 'Consumer',
]

export default function AdminShortsPage() {
  const [shorts, setShorts] = useState<AdminShort[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'draft' | 'published' | 'all'>('draft')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [feeds, setFeeds] = useState<ShortsFeedOption[]>([])
  const [showFetch, setShowFetch] = useState(false)
  const [showPaste, setShowPaste] = useState(false)
  const [editing, setEditing] = useState<AdminShort | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetAdminShorts({ status, page, pageSize: PAGE_SIZE })
      setShorts(res.items)
      setTotal(res.total)
    } catch (err: any) {
      setError(err?.message || 'Could not load shorts.')
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [status])
  useEffect(() => { apiGetShortsFeeds().then(setFeeds).catch(() => {}) }, [])

  const publish = async (s: AdminShort) => {
    setBusyId(s.id)
    try {
      await apiUpdateShort(s.id, { isPublished: !s.is_published })
      setToast({ msg: s.is_published ? 'Moved back to drafts.' : 'Published to the feed.', tone: 'success' })
      await load()
    } catch (err: any) {
      setToast({ msg: err?.message || 'Could not update.', tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (s: AdminShort) => {
    setBusyId(s.id)
    try {
      await apiDeleteShort(s.id)
      setToast({ msg: 'Deleted.', tone: 'success' })
      await load()
    } catch (err: any) {
      setToast({ msg: err?.message || 'Could not delete.', tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Legal Shorts</h1>
          <p className="text-sm text-slate-400">
            Drafts are AI-summarised from Indian Kanoon. Nothing reaches the public feed until you publish it.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowPaste(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors"
          >
            <Plus size={15} /> Paste judgment
          </button>
          <button
            onClick={() => setShowFetch(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
          >
            <Sparkles size={15} /> Fetch & summarise
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-full sm:w-fit">
        {(['draft', 'published', 'all'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
              status === s ? 'bg-[#C9A227] text-[#0A0D14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {s === 'draft' ? 'Review queue' : s}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={5} />
      ) : shorts.length === 0 ? (
        <EmptyState
          title={status === 'draft' ? 'Review queue is empty' : 'Nothing here'}
          hint='Use "Fetch & summarise" to pull recent judgments from Indian Kanoon.'
        />
      ) : (
        <div className="space-y-3">
          {shorts.map(s => (
            <div key={s.id} className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <StatusBadge status={s.is_published ? 'verified' : 'pending_signup'} />
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-slate-400">{s.category}</span>
                    {s.court && <span className="text-[11px] text-slate-500">{s.court}</span>}
                  </div>
                  <p className="text-base font-semibold text-white">{s.title}</p>
                  <p className="text-sm text-slate-400 mt-1.5 line-clamp-3">{s.summary}</p>
                  {s.takeaway && (
                    <p className="text-xs text-[#D4AF37] mt-2">💡 {s.takeaway}</p>
                  )}
                  <p className="text-[11px] text-slate-600 mt-2">
                    Ingested {formatDateTime(s.created_at)}
                    {s.tags && s.tags.length > 0 && <> · {s.tags.join(', ')}</>}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => publish(s)}
                  disabled={busyId === s.id}
                  className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                    s.is_published
                      ? 'border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  }`}
                >
                  <Check size={14} /> {s.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => setEditing(s)}
                  className="px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors"
                >
                  Edit
                </button>
                {s.source_url && (
                  <a
                    href={s.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors"
                  >
                    Source <ExternalLink size={13} />
                  </a>
                )}
                <button
                  onClick={() => remove(s)}
                  disabled={busyId === s.id}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-sm font-semibold transition-colors disabled:opacity-50 ml-auto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}

      <FetchModal
        open={showFetch}
        feeds={feeds}
        onClose={() => setShowFetch(false)}
        onDone={async (msg, tone) => { setShowFetch(false); setToast({ msg, tone }); await load() }}
      />
      <PasteModal
        open={showPaste}
        onClose={() => setShowPaste(false)}
        onDone={async (msg, tone) => { setShowPaste(false); setToast({ msg, tone }); await load() }}
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

// ── Fetch from Indian Kanoon ──────────────────────────────────────────────────

function FetchModal({ open, feeds, onClose, onDone }: {
  open: boolean
  feeds: ShortsFeedOption[]
  onClose: () => void
  onDone: (msg: string, tone: 'success' | 'error') => void | Promise<void>
}) {
  const [feed, setFeed] = useState('supreme_court')
  const [limit, setLimit] = useState(3)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (open) { setError(null); setBusy(false) } }, [open])

  const run = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await apiAutoIngestShorts(feed, limit)
      if (res.created === 0) {
        setError(res.message || `Nothing new — ${res.skipped} already ingested, ${res.failed} failed.`)
        setBusy(false)
        return
      }
      await onDone(
        `Created ${res.created} draft${res.created === 1 ? '' : 's'}${res.failed ? `, ${res.failed} failed` : ''}.`,
        'success'
      )
    } catch (err: any) {
      setError(err?.message || 'Fetch failed.')
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="Fetch & summarise" onClose={busy ? () => {} : onClose}>
      <p className="text-sm text-slate-400 mb-4">
        Pulls recent documents from Indian Kanoon and summarises them into drafts.
        Already-ingested judgments are skipped before any credit is spent.
      </p>

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Feed</label>
      <select
        value={feed}
        onChange={e => setFeed(e.target.value)}
        className="w-full h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60 mb-4"
      >
        {feeds.map(f => (
          <option key={f.id} value={f.id} className="bg-[#111318]">
            {f.label}{f.withinDays ? ` · last ${f.withinDays}d` : ''}
          </option>
        ))}
      </select>

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        How many
      </label>
      <input
        type="number"
        min={1}
        max={10}
        value={limit}
        onChange={e => setLimit(Number(e.target.value))}
        className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
      />
      <p className="mt-1.5 text-xs text-slate-600">
        Each one costs an Indian Kanoon call plus an LLM call. Keep it low — the free
        summarisation tier is 8,000 tokens per minute.
      </p>

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
          onClick={run}
          disabled={busy}
          className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-60"
        >
          {busy ? 'Fetching…' : 'Fetch'}
        </button>
      </div>
    </Modal>
  )
}

// ── Paste a judgment manually ─────────────────────────────────────────────────

function PasteModal({ open, onClose, onDone }: {
  open: boolean
  onClose: () => void
  onDone: (msg: string, tone: 'success' | 'error') => void | Promise<void>
}) {
  const [sourceUrl, setSourceUrl] = useState('')
  const [rawText, setRawText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setSourceUrl(''); setRawText(''); setError(null); setBusy(false) }
  }, [open])

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await apiIngestShort({ sourceUrl: sourceUrl.trim(), rawText })
      await onDone('Draft created.', 'success')
    } catch (err: any) {
      setError(err?.message || 'Could not summarise.')
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="Paste a judgment" onClose={busy ? () => {} : onClose}>
      <p className="text-sm text-slate-400 mb-4">
        For judgments not on Indian Kanoon. Paste the text from the official court site.
      </p>

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        Source URL
      </label>
      <input
        value={sourceUrl}
        onChange={e => setSourceUrl(e.target.value)}
        placeholder="https://www.sci.gov.in/..."
        className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 mb-4"
      />

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        Judgment text
      </label>
      <textarea
        value={rawText}
        onChange={e => setRawText(e.target.value)}
        rows={9}
        placeholder="Paste the full judgment…"
        className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 resize-none"
      />
      <p className="mt-1.5 text-xs text-slate-600">{rawText.length.toLocaleString()} characters (minimum 200)</p>

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
          disabled={busy || rawText.length < 200 || !sourceUrl.trim()}
          className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-50"
        >
          {busy ? 'Summarising…' : 'Summarise'}
        </button>
      </div>
    </Modal>
  )
}

// ── Edit before publishing ────────────────────────────────────────────────────

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
    <Modal open={!!short} title="Edit short" onClose={busy ? () => {} : onClose}>
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
          {busy ? 'Saving…' : 'Save draft'}
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
