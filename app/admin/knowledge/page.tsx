'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  apiGetAdminKnowledge,
  apiGetAdminKnowledgeCounts,
  apiBulkKnowledge,
  type AdminKnowledgeCard,
} from '@/lib/api'
import { rightsLabelFor, rightsToneFor } from '@/lib/knowledge'

/**
 * Know Your Rights review queue.
 *
 * 183 explainers were imported and all but one arrived unpublished, which is
 * the correct default: nothing about criminal law should go live because an
 * import script ran. This is where an editor reads them and decides.
 *
 * Approving stamps the reviewer's name and the date on the card, and those are
 * what the public page and its FAQPage markup display — so the person clicking
 * approve is the person Google will show as having checked it.
 */

type Status = 'pending' | 'published' | 'rejected' | 'all'
const PAGE_SIZE = 25

export default function AdminKnowledgePage() {
  const [cards, setCards] = useState<AdminKnowledgeCard[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<Status>('pending')
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [counts, setCounts] = useState<{
    pending: number; published: number; rejected: number; total: number
    pendingByCategory: { name: string; count: number }[]
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiGetAdminKnowledge({
        status,
        category: category === 'all' ? undefined : category,
        search: search.trim() || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setCards(res.cards)
      setTotal(res.total)
      setSelected(new Set())
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not load the queue')
    } finally {
      setLoading(false)
    }
  }, [status, category, search, page])

  const loadCounts = useCallback(async () => {
    try { setCounts(await apiGetAdminKnowledgeCounts()) } catch { /* header only */ }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadCounts() }, [loadCounts])

  const act = async (action: 'approve' | 'reject') => {
    if (selected.size === 0) return
    const reason = action === 'reject'
      ? window.prompt('Why is this being rejected? (kept on the record)') ?? undefined
      : undefined
    if (action === 'reject' && reason === undefined) return

    setWorking(true)
    setMessage(null)
    try {
      const res = await apiBulkKnowledge([...selected], action, reason)
      setMessage(
        `${action === 'approve' ? 'Published' : 'Rejected'} ${res.changed} card${res.changed === 1 ? '' : 's'}` +
        (res.skipped ? ` · ${res.skipped} unchanged` : '')
      )
      await Promise.all([load(), loadCounts()])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setWorking(false)
    }
  }

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allOnPageSelected = cards.length > 0 && cards.every(c => selected.has(c.id))
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="p-5 sm:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-white">Know Your Rights</h1>
        <p className="mt-1 text-sm text-slate-400">
          Imported rights explainers. Nothing is public until it is approved here.
        </p>

        {counts && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/8 border border-white/8 rounded-sm overflow-hidden max-w-xl">
            {[
              { label: 'Awaiting review', value: counts.pending, tone: 'text-amber-400' },
              { label: 'Published', value: counts.published, tone: 'text-emerald-400' },
              { label: 'Rejected', value: counts.rejected, tone: 'text-rose-400' },
              { label: 'Total', value: counts.total, tone: 'text-white' },
            ].map(s => (
              <div key={s.label} className="bg-[#0E1220] px-4 py-3">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl font-bold tabular-nums mt-0.5 ${s.tone}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['pending', 'published', 'rejected', 'all'] as Status[]).map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold border capitalize transition-colors ${
              status === s
                ? 'bg-[#C9A227] text-[#0A0D14] border-[#C9A227]'
                : 'bg-white/[0.04] text-slate-300 border-white/10 hover:border-white/25'
            }`}
          >
            {s}
          </button>
        ))}

        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1) }}
          className="h-8 px-2 rounded-sm bg-[#0E1220] border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-[#C9A227]/50"
        >
          <option value="all">All topics</option>
          {(counts?.pendingByCategory ?? []).map(c => (
            <option key={c.name} value={c.name}>{rightsLabelFor(c.name)} ({c.count})</option>
          ))}
        </select>

        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search question or section"
          className="h-8 px-3 rounded-sm bg-[#0E1220] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/50 w-56"
        />
      </div>

      {/* Bulk bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-sm bg-[#0E1220] border border-white/8">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={allOnPageSelected}
            onChange={() => setSelected(allOnPageSelected ? new Set() : new Set(cards.map(c => c.id)))}
            className="accent-[#C9A227]"
          />
          Select page ({cards.length})
        </label>

        <span className="text-xs text-slate-500 tabular-nums">{selected.size} selected</span>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => act('approve')}
            disabled={selected.size === 0 || working}
            className="px-3 h-8 rounded-sm bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {working ? 'Working…' : 'Publish'}
          </button>
          <button
            onClick={() => act('reject')}
            disabled={selected.size === 0 || working}
            className="px-3 h-8 rounded-sm bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Reject
          </button>
        </div>
      </div>

      {message && (
        <p className="mb-4 text-xs text-[#D4AF37] bg-[#C9A227]/10 border border-[#C9A227]/25 rounded-sm px-3 py-2">
          {message}
        </p>
      )}

      {/* Queue */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <span className="w-5 h-5 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">Nothing in this view.</p>
      ) : (
        <ul className="space-y-2">
          {cards.map(card => {
            const tone = rightsToneFor(card.category)
            const isOpen = expanded === card.id
            return (
              <li key={card.id} className="rounded-sm bg-[#0E1220] border border-white/8 overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={selected.has(card.id)}
                    onChange={() => toggle(card.id)}
                    className="mt-1 accent-[#C9A227]"
                    aria-label={`Select ${card.title}`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-wide ${tone.pill}`}>
                        {rightsLabelFor(card.category)}
                      </span>
                      {card.case_reference && (
                        <span className="text-[11px] text-slate-500">{card.case_reference}</span>
                      )}
                      {card.is_published && (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Live</span>
                      )}
                      {!card.is_published && card.rejected_reason && (
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Rejected</span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-white leading-snug">{card.title}</p>

                    {card.direct_answer && (
                      <p className="mt-1 text-[13px] text-slate-400 leading-relaxed">{card.direct_answer}</p>
                    )}

                    {card.rejected_reason && (
                      <p className="mt-1.5 text-[11px] text-rose-300/80">Reason: {card.rejected_reason}</p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-[11px]">
                      <button
                        onClick={() => setExpanded(isOpen ? null : card.id)}
                        className="text-slate-400 hover:text-white transition-colors font-medium"
                      >
                        {isOpen ? 'Hide full text' : 'Read full text'}
                      </button>
                      {card.source_url && (
                        <a href={card.source_url} target="_blank" rel="noopener noreferrer"
                           className="text-slate-500 hover:text-[#D4AF37] transition-colors">
                          Source
                        </a>
                      )}
                      {card.is_published && (
                        <a href={`/knowledge-center/know-your-rights/${card.slug}`} target="_blank"
                           rel="noopener noreferrer" className="text-slate-500 hover:text-[#D4AF37] transition-colors">
                          View live
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 pl-11 border-t border-white/5 pt-3">
                    <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {card.explanation || card.card_text || 'No further text.'}
                    </p>
                    {card.suggested_questions && card.suggested_questions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Suggested questions
                        </p>
                        <ul className="space-y-0.5">
                          {card.suggested_questions.map((q, i) => (
                            <li key={i} className="text-[12px] text-slate-400">· {q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Paging */}
      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-3 h-8 rounded-sm border border-white/15 bg-white/5 text-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 tabular-nums">Page {page} of {pageCount}</span>
          <button
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount || loading}
            className="px-3 h-8 rounded-sm border border-white/15 bg-white/5 text-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
