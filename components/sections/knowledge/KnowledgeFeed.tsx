'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { apiGetShorts, apiSearchShorts, type LegalShort } from '@/lib/api'
import { ctaFor, labelFor, toneFor, timeAgo } from '@/lib/knowledge'

/**
 * The Knowledge Centre feed — one card per screen.
 *
 * Snapping is CSS (`scroll-snap-type`) rather than JS so it stays smooth on
 * low-end Android, which is most of the Indian mobile market. The observer
 * below only tracks which card is active for the rail and prefetch; it never
 * drives the scroll.
 *
 * The earlier attempt at a scrolling list was meant to fix desktop, where one
 * card per viewport left most of the screen empty. That is solved here without
 * giving up the format: the card is centred at a readable width, and desktop
 * gets a rail, arrow keys and explicit next/previous controls, since a desktop
 * reader has no swipe gesture to discover.
 */

const PAGE_SIZE = 20

/**
 * Chrome above the feed: site header (64px) + section nav (49px) + this
 * component's own filter bar (53px). The snap container is sized against the
 * total, so a card fills exactly the space left and one swipe moves exactly
 * one card. Change any of these and the snap drifts.
 */
const HEADER_PX = 64
const SECTION_NAV_PX = 49
const FILTER_BAR_PX = 53
const CHROME_PX = HEADER_PX + SECTION_NAV_PX + FILTER_BAR_PX
const VIEWPORT = `calc(100dvh - ${CHROME_PX}px)`

// ── Bookmarks ─────────────────────────────────────────────────────────────────
// Kept in localStorage rather than the database: reading the feed needs no
// account, and requiring one to save a card would be the wrong trade.
const BOOKMARK_KEY = 'lx_bookmarks'

function useBookmarks() {
  const [ids, setIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOOKMARK_KEY)
      if (raw) setIds(new Set(JSON.parse(raw)))
    } catch { /* corrupt or unavailable storage — start empty */ }
  }, [])

  const toggle = useCallback((id: string) => {
    setIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }, [])

  return { ids, toggle }
}

export function KnowledgeFeed({
  initialShorts,
  initialCursor,
  initialHasMore,
  categories,
}: {
  initialShorts: LegalShort[]
  initialCursor: string | null
  initialHasMore: boolean
  categories: { name: string; count: number }[]
}) {
  const [shorts, setShorts] = useState(initialShorts)
  const [cursor, setCursor] = useState(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [active, setActive] = useState(0)
  // Mobile only. The pill row and the search box together left no room on a
  // phone, so on small screens the categories collapse behind a single control
  // that names the current one.
  const [filtersOpen, setFiltersOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const bookmarks = useBookmarks()

  // Always re-fetch on mount. The page is statically generated for a fast first
  // paint, so a card published since the last regeneration would otherwise be
  // invisible until the cache expired.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const page = await apiGetShorts({ limit: PAGE_SIZE })
        if (cancelled) return
        setShorts(page.shorts)
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
      } catch { /* keep the server-rendered content */ }
    })()
    return () => { cancelled = true }
  }, [])

  // Track the card in view, for the rail and for prefetch.
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index)
            if (!Number.isNaN(index)) setActive(index)
          }
        }
      },
      { root: containerRef.current, threshold: 0.6 }
    )
    cardRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [shorts.length])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursor) return
    setLoading(true)
    try {
      const page = await apiGetShorts({
        category: category === 'all' ? undefined : category,
        before: cursor,
        limit: PAGE_SIZE,
      })
      setShorts(prev => [...prev, ...page.shorts])
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, cursor, category])

  // Fetch the next page while the reader still has three cards left.
  useEffect(() => {
    if (hasMore && active >= shorts.length - 3) loadMore()
  }, [active, shorts.length, hasMore, loadMore])

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, cardRefs.current.length - 1))
    cardRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Arrow keys and j/k. A desktop reader has no swipe gesture, so without these
  // the only way down is dragging the (hidden) scrollbar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault(); goTo(active + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault(); goTo(active - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, goTo])

  const switchCategory = useCallback(async (next: string) => {
    setCategory(next)
    setLoading(true)
    setActive(0)
    try {
      const page = await apiGetShorts({ category: next === 'all' ? undefined : next, limit: PAGE_SIZE })
      setShorts(page.shorts)
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
      containerRef.current?.scrollTo({ top: 0 })
    } catch {
      setShorts([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search. People arriving from Google come with a question, so the
  // feed needs to answer one directly rather than only offering categories.
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
      setActive(0)
      try {
        const results = await apiSearchShorts(term)
        setShorts(results)
        setHasMore(false)
        containerRef.current?.scrollTo({ top: 0 })
      } catch {
        setShorts([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const totalCount = useMemo(
    () => categories.reduce((sum, c) => sum + c.count, 0),
    [categories]
  )

  const atStart = active === 0
  const atEnd = active >= shorts.length - 1 && !hasMore

  return (
    <div className="bg-[#0A0D14]">
      {/* Filter bar. Height is fixed at 53px because the feed viewport is
          measured against it — the mobile category panel therefore overlays
          rather than pushing the feed down. */}
      <div
        className="sticky z-20 h-[53px] bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/8"
        style={{ top: `${HEADER_PX + SECTION_NAV_PX}px` }}
      >
        <div className="max-w-[900px] mx-auto h-full flex items-center gap-2.5 px-4 sm:px-6">
          <h1 className="hidden lg:block text-[15px] font-bold text-white whitespace-nowrap">
            Knowledge Center
          </h1>

          {/* Mobile: one control naming the active category */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            aria-expanded={filtersOpen}
            aria-controls="kc-filters"
            className={`sm:hidden shrink-0 inline-flex items-center gap-1.5 pl-3 pr-2.5 h-8 rounded-full text-xs font-semibold border transition-colors ${
              category !== 'all' && !searching
                ? 'bg-[#C9A227] text-[#0A0D14] border-[#C9A227]'
                : 'bg-white/[0.04] text-slate-200 border-white/12'
            }`}
          >
            {searching ? 'Results' : category === 'all' ? 'All updates' : labelFor(category)}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Desktop: pills inline */}
          <div className="hidden sm:flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 flex-1">
            <FilterPill
              label="All"
              count={totalCount}
              active={category === 'all' && !searching}
              onClick={() => switchCategory('all')}
            />
            {categories.map(c => (
              <FilterPill
                key={c.name}
                label={labelFor(c.name)}
                count={c.count}
                active={category === c.name && !searching}
                onClick={() => switchCategory(c.name)}
              />
            ))}
          </div>

          <div className="relative flex-1 sm:flex-none sm:shrink-0 min-w-0">
            <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search updates"
              className="w-full sm:w-[110px] sm:focus:w-[190px] h-8 pl-8 pr-2.5 rounded-full bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/50 transition-all"
            />
          </div>
        </div>

        {/* Mobile category panel — overlays the feed, so the viewport maths hold */}
        {filtersOpen && (
          <>
            <button
              className="sm:hidden fixed inset-0 z-10 bg-black/40 cursor-default"
              style={{ top: `${CHROME_PX}px` }}
              onClick={() => setFiltersOpen(false)}
              aria-label="Close categories"
              tabIndex={-1}
            />
            <div
              id="kc-filters"
              className="sm:hidden absolute inset-x-0 top-[53px] z-20 bg-[#0A0D14] border-b border-white/10 px-4 py-3 shadow-xl shadow-black/50"
            >
              <div className="flex flex-wrap gap-2">
                <FilterPill
                  label="All"
                  count={totalCount}
                  active={category === 'all' && !searching}
                  onClick={() => { switchCategory('all'); setFiltersOpen(false) }}
                />
                {categories.map(c => (
                  <FilterPill
                    key={c.name}
                    label={labelFor(c.name)}
                    count={c.count}
                    active={category === c.name && !searching}
                    onClick={() => { switchCategory(c.name); setFiltersOpen(false) }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {shorts.length === 0 && !loading ? (
        <EmptyFeed searching={searching} query={query} />
      ) : (
        <div className="relative">
          {/* Progress rail — desktop only; on mobile the swipe itself is the affordance */}
          {shorts.length > 1 && (
            <div className="hidden lg:flex fixed right-7 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-1.5">
              {shorts.slice(0, 14).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to update ${i + 1}`}
                  className={`w-1 rounded-full transition-all duration-300 hover:bg-[#C9A227] ${
                    i === active ? 'h-6 bg-[#C9A227]' : 'h-1.5 bg-white/25'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Next / previous — desktop needs an explicit control, not a gesture */}
          {shorts.length > 1 && (
            <div className="hidden lg:flex fixed right-6 bottom-8 z-20 flex-col gap-2">
              <NavButton label="Previous update" disabled={atStart} onClick={() => goTo(active - 1)}>
                <path d="M18 15l-6-6-6 6" />
              </NavButton>
              <NavButton label="Next update" disabled={atEnd} onClick={() => goTo(active + 1)}>
                <path d="M6 9l6 6 6-6" />
              </NavButton>
            </div>
          )}

          <div
            ref={containerRef}
            className="overflow-y-auto snap-y snap-mandatory no-scrollbar overscroll-contain"
            style={{ height: VIEWPORT }}
          >
            {searching && (
              <p className="max-w-[640px] mx-auto px-5 pt-3 text-xs text-slate-500">
                {shorts.length} result{shorts.length === 1 ? '' : 's'} for &ldquo;{query.trim()}&rdquo;
              </p>
            )}

            {shorts.map((short, i) => (
              <article
                key={short.id}
                data-index={i}
                ref={el => { cardRefs.current[i] = el }}
                className="snap-start snap-always flex items-center justify-center px-4 sm:px-6 py-5"
                style={{ height: VIEWPORT }}
              >
                <KnowledgeCard
                  short={short}
                  position={i + 1}
                  bookmarked={bookmarks.ids.has(short.id)}
                  onBookmark={() => bookmarks.toggle(short.id)}
                />
              </article>
            ))}

            {loading && (
              <div className="h-28 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
              </div>
            )}

            {!hasMore && shorts.length > 0 && (
              <div
                className="snap-start flex flex-col items-center justify-center text-center px-6"
                style={{ height: VIEWPORT }}
              >
                <p className="text-base font-semibold text-slate-300">You&rsquo;re all caught up.</p>
                <p className="text-xs text-slate-600 mt-1.5 max-w-xs">
                  New updates are reviewed and published each morning.
                </p>
                <Link
                  href="/talk-to-lawyer"
                  className="mt-6 px-5 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
                >
                  Talk to a lawyer
                </Link>
                <Link
                  href="/knowledge-center/archive"
                  className="mt-4 text-xs text-slate-500 hover:text-[#D4AF37] transition-colors"
                >
                  Browse by month
                </Link>
                <p className="mt-6 text-[11px] text-slate-600 max-w-sm leading-relaxed">
                  Summaries are drawn from official sources and reviewed before publication.
                  They are general information, not legal advice.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NavButton({
  children, label, onClick, disabled,
}: { children: React.ReactNode; label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-9 h-9 rounded-full border border-white/12 bg-white/[0.06] backdrop-blur-sm text-slate-300
                 hover:bg-white/12 hover:text-white disabled:opacity-25 disabled:hover:bg-white/[0.06]
                 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
           strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
        {children}
      </svg>
    </button>
  )
}

function FilterPill({
  label, count, active, onClick,
}: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? 'bg-[#C9A227] text-[#0A0D14] border-[#C9A227]'
          : 'bg-white/[0.04] text-slate-300 border-white/10 hover:border-white/25'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`px-1.5 rounded-full text-[10px] tabular-nums ${
          active ? 'bg-[#0A0D14]/20 text-[#0A0D14]' : 'bg-white/10 text-slate-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

function KnowledgeCard({
  short, position, bookmarked, onBookmark,
}: {
  short: LegalShort
  position: number
  bookmarked: boolean
  onBookmark: () => void
}) {
  const [copied, setCopied] = useState(false)
  const tone = toneFor(short.category)
  const cta = ctaFor(short.category)
  const href = short.slug ? `/knowledge-center/${short.slug}` : '/knowledge-center'

  const share = async () => {
    const url = `${window.location.origin}${href}`
    if (navigator.share) {
      try { await navigator.share({ title: short.title, url }); return } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked */ }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="relative w-full max-w-[640px] max-h-full overflow-y-auto no-scrollbar
                 rounded-2xl bg-[#111318] border border-white/10 overflow-hidden"
      style={{ boxShadow: `0 0 60px ${tone.glow}` }}
    >
      {/* Category accent down the left edge */}
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${tone.accent}`} aria-hidden />

      <div className="pl-6 pr-5 sm:pl-7 sm:pr-6 py-6 sm:py-7">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide ${tone.pill}`}>
            {labelFor(short.category)}
          </span>
          {short.court && (
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400">
              {short.court}
            </span>
          )}
          <span className="text-[11px] text-slate-500">
            {timeAgo(short.published_at ?? short.created_at)}
          </span>
          <span className="ml-auto text-[11px] tabular-nums text-slate-600">#{position}</span>
        </div>

        <Link href={href} className="block group">
          <h2 className="text-xl sm:text-[26px] font-bold text-white leading-snug group-hover:text-[#D4AF37] transition-colors">
            {short.title}
          </h2>
        </Link>

        <p className="mt-4 text-[15px] text-slate-300 leading-relaxed whitespace-pre-wrap">
          {short.summary}
        </p>

        {short.takeaway && (
          <div className="mt-5 flex gap-2.5 rounded-xl bg-[#C9A227]/[0.07] border-l-[3px] border-[#C9A227] px-4 py-3.5">
                        <p className="text-[13.5px] leading-relaxed">
              <span className="font-semibold text-[#D4AF37]">What it means: </span>
              <span className="text-slate-300">{short.takeaway}</span>
            </p>
          </div>
        )}

        {(short.affects_whom || short.deadline) && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {short.affects_whom && (
              <div className="rounded-lg bg-white/[0.03] border border-white/8 p-3">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Who this affects</p>
                <p className="text-[13px] text-slate-200">{short.affects_whom}</p>
              </div>
            )}
            {short.deadline && (
              <div className="rounded-lg bg-amber-500/[0.07] border border-amber-500/25 p-3">
                <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide mb-1">Deadline</p>
                <p className="text-[13px] text-amber-200">
                  {new Date(short.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        )}

        {short.tags && short.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
            {short.tags.slice(0, 5).map(tag => (
              <span key={tag} className="text-[11px] text-slate-600">#{tag.replace(/\s+/g, '')}</span>
            ))}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <IconButton
              label={bookmarked ? 'Remove bookmark' : 'Save for later'}
              active={bookmarked}
              onClick={onBookmark}
            >
              <svg viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" suppressHydrationWarning>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>

            <IconButton label={copied ? 'Link copied' : 'Share'} onClick={share}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
              </svg>
            </IconButton>

            {copied && <span className="text-[11px] text-emerald-400">Copied</span>}

            <Link
              href={href}
              className="ml-1 text-[12.5px] font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Read full
            </Link>
          </div>

          <Link
            href={cta.href}
            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] text-[12.5px] font-bold transition-colors whitespace-nowrap"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function IconButton({
  children, label, onClick, active,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`p-2 rounded-lg transition-colors [&>svg]:w-4 [&>svg]:h-4 ${
        active ? 'text-[#C9A227]' : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyFeed({ searching, query }: { searching: boolean; query: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6"
      style={{ height: VIEWPORT }}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" suppressHydrationWarning>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-300">
        {searching ? `No results for “${query.trim()}”` : 'No updates published yet'}
      </p>
      <p className="mt-1 text-xs text-slate-500 max-w-xs">
        {searching
          ? 'Try a broader term, or browse the categories above.'
          : "Legal updates appear here once they've been reviewed by our team."}
      </p>
    </div>
  )
}
