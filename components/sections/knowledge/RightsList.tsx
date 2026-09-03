'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { apiGetKnowledge, apiGetKnowledgeCategories, apiSearchKnowledge, type KnowledgeCard } from '@/lib/api'
import { rightsLabelFor, rightsToneFor } from '@/lib/knowledge'

/**
 * Know Your Rights — a scannable list, not a card feed.
 *
 * Each row leads with the question and the direct answer, because that pairing
 * is what a reader arriving from a search result came to see, and what a search
 * engine lifts into a snippet. A one-per-screen treatment would bury 182 of
 * them behind scroll gestures; these are looked up, not browsed.
 */

const PAGE_SIZE = 24

export function RightsList({
  initialCards,
  initialTotal,
  initialHasMore,
  categories,
}: {
  initialCards: KnowledgeCard[]
  initialTotal: number
  initialHasMore: boolean
  categories: { name: string; count: number }[]
}) {
  const [cards, setCards] = useState(initialCards)
  const [total, setTotal] = useState(initialTotal)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [chips, setChips] = useState(categories)

  const totalCount = useMemo(
    () => chips.reduce((sum, c) => sum + c.count, 0),
    [chips]
  )

  /**
   * Re-fetch on mount, always.
   *
   * This page is prerendered and then served from the ISR cache. Vercel and
   * Render deploy independently, so a frontend build can land while the backend
   * is still rolling out — the server render then gets nothing and that empty
   * page is cached for the whole revalidate window. Without this the section
   * reads "0 questions answered" on production while the API is returning 183.
   *
   * The client fetch costs one request and makes the page self-healing rather
   * than dependent on two deploys finishing in the right order.
   */
  useEffect(() => {
    if (initialCards.length > 0) return
    let cancelled = false
    ;(async () => {
      try {
        const [res, cats] = await Promise.all([
          apiGetKnowledge({ page: 1, limit: PAGE_SIZE }),
          apiGetKnowledgeCategories().catch(() => [] as { name: string; count: number }[]),
        ])
        if (cancelled) return
        setCards(res.cards)
        setTotal(res.total)
        setHasMore(res.hasMore)
        if (cats.length) setChips(cats)
      } catch { /* keep the empty state */ }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const switchCategory = useCallback(async (next: string) => {
    setCategory(next)
    setPage(1)
    setLoading(true)
    try {
      const res = await apiGetKnowledge({
        category: next === 'all' ? undefined : next,
        page: 1,
        limit: PAGE_SIZE,
      })
      setCards(res.cards)
      setTotal(res.total)
      setHasMore(res.hasMore)
    } catch {
      setCards([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const next = page + 1
      const res = await apiGetKnowledge({
        category: category === 'all' ? undefined : category,
        page: next,
        limit: PAGE_SIZE,
      })
      setCards(prev => [...prev, ...res.cards])
      setPage(next)
      setHasMore(res.hasMore)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search. People arrive here with a specific question.
  useEffect(() => {
    const term = query.trim()
    if (term.length === 0) {
      if (searching) { setSearching(false); switchCategory('all') }
      return
    }
    if (term.length < 2) return

    const timer = setTimeout(async () => {
      setLoading(true)
      setSearching(true)
      try {
        const results = await apiSearchKnowledge(term)
        setCards(results)
        setTotal(results.length)
        setHasMore(false)
      } catch {
        setCards([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6">
      {/* Controls */}
      <div className="flex items-center gap-2.5 mb-5">
        <button
          onClick={() => setFiltersOpen(o => !o)}
          aria-expanded={filtersOpen}
          className={`sm:hidden shrink-0 inline-flex items-center gap-1.5 pl-3 pr-2.5 h-9 rounded-sm text-xs font-semibold border transition-colors ${
            category !== 'all' && !searching
              ? 'bg-[#C9A227] text-[#0A0D14] border-[#C9A227]'
              : 'bg-white/[0.04] text-slate-200 border-white/12'
          }`}
        >
          {searching ? 'Results' : category === 'all' ? 'All topics' : rightsLabelFor(category)}
          <svg className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
               strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <div className="hidden sm:flex gap-2 overflow-x-auto no-scrollbar flex-1 -mx-1 px-1">
          <Chip label="All" count={totalCount} active={category === 'all' && !searching}
                onClick={() => switchCategory('all')} />
          {chips.map(c => (
            <Chip key={c.name} label={rightsLabelFor(c.name)} count={c.count}
                  active={category === c.name && !searching}
                  onClick={() => switchCategory(c.name)} />
          ))}
        </div>

        <div className="relative flex-1 sm:flex-none sm:w-[220px] min-w-0">
          <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your question"
            aria-label="Search rights explainers"
            className="w-full h-9 pl-9 pr-3 rounded-sm bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/50 transition-colors"
          />
        </div>
      </div>

      {filtersOpen && (
        <div className="sm:hidden mb-5 flex flex-wrap gap-2 p-3 rounded-sm bg-[#0E1220] border border-white/10">
          <Chip label="All" count={totalCount} active={category === 'all' && !searching}
                onClick={() => { switchCategory('all'); setFiltersOpen(false) }} />
          {chips.map(c => (
            <Chip key={c.name} label={rightsLabelFor(c.name)} count={c.count}
                  active={category === c.name && !searching}
                  onClick={() => { switchCategory(c.name); setFiltersOpen(false) }} />
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500 mb-4 tabular-nums">
        {searching
          ? `${cards.length} result${cards.length === 1 ? '' : 's'} for “${query.trim()}”`
          : `${total} question${total === 1 ? '' : 's'} answered`}
      </p>

      {cards.length === 0 && !loading ? (
        <EmptyState searching={searching} />
      ) : (
        <ul className="space-y-3">
          {cards.map(card => <RightsRow key={card.id} card={card} />)}
        </ul>
      )}

      {loading && (
        <div className="py-8 flex justify-center">
          <span className="w-5 h-5 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
        </div>
      )}

      {hasMore && !loading && (
        <div className="pt-6 flex justify-center">
          <button
            onClick={loadMore}
            className="px-5 h-10 rounded-sm border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}

function Chip({
  label, count, active, onClick,
}: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold border transition-colors ${
        active
          ? 'bg-[#C9A227] text-[#0A0D14] border-[#C9A227]'
          : 'bg-white/[0.04] text-slate-300 border-white/10 hover:border-white/25'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`px-1.5 rounded-sm text-[10px] tabular-nums ${
          active ? 'bg-[#0A0D14]/20 text-[#0A0D14]' : 'bg-white/10 text-slate-400'
        }`}>{count}</span>
      )}
    </button>
  )
}

function RightsRow({ card }: { card: KnowledgeCard }) {
  const tone = rightsToneFor(card.category)

  return (
    <li>
      <Link
        href={`/knowledge-center/know-your-rights/${card.slug}`}
        className="group relative block rounded-sm bg-[#0E1220] border border-white/8 hover:border-[#C9A227]/40 transition-colors overflow-hidden"
      >
        <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${tone.accent}`} aria-hidden />
        <div className="pl-5 pr-4 sm:pl-6 sm:pr-5 py-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-wide ${tone.pill}`}>
              {rightsLabelFor(card.category)}
            </span>
            {card.case_reference && (
              <span className="text-[11px] text-slate-500 truncate max-w-[260px]">
                {card.case_reference}
              </span>
            )}
          </div>

          <h2 className="text-[15px] sm:text-base font-semibold text-white leading-snug group-hover:text-[#D4AF37] transition-colors">
            {card.title}
          </h2>

          {card.direct_answer && (
            <p className="mt-1.5 text-[13.5px] text-slate-400 leading-relaxed line-clamp-2">
              {card.direct_answer}
            </p>
          )}
        </div>
      </Link>
    </li>
  )
}

function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="py-20 text-center">
      <p className="text-sm font-medium text-slate-300">
        {searching ? 'No answers match that question yet' : 'No explainers published yet'}
      </p>
      <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
        {searching
          ? 'Try fewer words, or browse the topics above.'
          : 'Explainers appear here once our team has reviewed them.'}
      </p>
      <Link
        href="/talk-to-lawyer"
        className="mt-6 inline-block px-5 py-2.5 rounded-sm bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
      >
        Ask a lawyer directly
      </Link>
    </div>
  )
}
