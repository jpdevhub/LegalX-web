'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { apiGetShorts, apiSearchShorts, type LegalShort } from '@/lib/api'

/**
 * The Knowledge Centre feed.
 *
 * A vertically scrolling list rather than a snap feed: the same layout reads
 * correctly on a phone and on a desktop, where one-card-per-viewport wasted
 * most of the screen and forced a scroll gesture per item.
 */

const PAGE_SIZE = 20

/**
 * Categories describe the reader's situation, not a legal discipline. The
 * previous set (Civil / Corporate / Consumer) gave a model with no legal
 * subject in front of it nothing to anchor on, so tagging was arbitrary.
 */
const CATEGORY_LABELS: Record<string, string> = {
  property_rent:       'Property',
  family_marriage:     'Family',
  money_consumer:      'Consumer',
  crime_safety:        'Crime & Safety',
  business_compliance: 'Business',
  cyber_online:        'Cyber',
}

const CATEGORY_TONES: Record<string, { pill: string; accent: string }> = {
  property_rent:       { pill: 'bg-emerald-500/15 text-emerald-300', accent: 'bg-emerald-400/70' },
  family_marriage:     { pill: 'bg-pink-500/15 text-pink-300',       accent: 'bg-pink-400/70' },
  money_consumer:      { pill: 'bg-blue-500/15 text-blue-300',       accent: 'bg-blue-400/70' },
  crime_safety:        { pill: 'bg-rose-500/15 text-rose-300',       accent: 'bg-rose-400/70' },
  business_compliance: { pill: 'bg-[#C9A227]/20 text-[#D4AF37]',     accent: 'bg-[#C9A227]' },
  cyber_online:        { pill: 'bg-violet-500/15 text-violet-300',   accent: 'bg-violet-400/70' },
}

/**
 * Where a card's call-to-action should point.
 *
 * A generic "Ask a lawyer" under every card wastes the intent the reader
 * arrived with — someone reading about GST wants the GST service, not a
 * consultation booking.
 */
const CATEGORY_CTA: Record<string, { label: string; href: string }> = {
  property_rent:       { label: 'Get property documents drafted', href: '/documents' },
  family_marriage:     { label: 'Talk to a family lawyer',        href: '/talk-to-lawyer' },
  money_consumer:      { label: 'Send a legal notice',            href: '/documents' },
  crime_safety:        { label: 'Talk to a lawyer now',           href: '/talk-to-lawyer' },
  business_compliance: { label: 'Get compliance help',            href: '/documents' },
  cyber_online:        { label: 'Talk to a cyber-law expert',     href: '/talk-to-lawyer' },
}

export function ctaFor(category: string) {
  return CATEGORY_CTA[category] ?? { label: 'Ask a lawyer', href: '/talk-to-lawyer' }
}

export function labelFor(category: string): string {
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, ' ')
}

function toneFor(category: string) {
  return CATEGORY_TONES[category] ?? { pill: 'bg-white/10 text-slate-300', accent: 'bg-white/25' }
}

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 3600) return `${Math.max(1, Math.floor(secs / 60))}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

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
      next.has(id) ? next.delete(id) : next.add(id)
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

  const sentinelRef = useRef<HTMLDivElement>(null)
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

  // Load the next page when the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0]?.isIntersecting) loadMore() },
      { rootMargin: '600px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  const switchCategory = async (next: string) => {
    if (next === category) return
    setCategory(next)
    setLoading(true)
    try {
      const page = await apiGetShorts({ category: next === 'all' ? undefined : next, limit: PAGE_SIZE })
      setShorts(page.shorts)
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setShorts([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

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
      try {
        const results = await apiSearchShorts(term)
        setShorts(results)
        setHasMore(false)
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

  return (
    <div className="bg-[#0A0D14] min-h-screen">
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-[820px] mx-auto flex items-center gap-4 px-4 sm:px-6 py-3">
          <h1 className="hidden sm:block text-[17px] font-bold text-white whitespace-nowrap">
            Knowledge Center
          </h1>

          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 flex-1">
            <FilterPill
              label="All"
              count={totalCount}
              active={category === 'all'}
              onClick={() => switchCategory('all')}
            />
            {categories.map(c => (
              <FilterPill
                key={c.name}
                label={labelFor(c.name)}
                count={c.count}
                active={category === c.name}
                onClick={() => switchCategory(c.name)}
              />
            ))}
          </div>

          <div className="relative shrink-0">
            <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search updates"
              className="w-[120px] focus:w-[200px] h-8 pl-8 pr-2.5 rounded-full bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {searching && (
          <p className="text-xs text-slate-500">
            {shorts.length > 0
              ? `${shorts.length} result${shorts.length === 1 ? '' : 's'} for "${query.trim()}"`
              : `No results for "${query.trim()}"`}
          </p>
        )}

        {shorts.length === 0 && !loading ? (
          searching ? null : <EmptyFeed />
        ) : (
          shorts.map((short, i) => (
            <KnowledgeCard
              key={short.id}
              short={short}
              index={i}
              bookmarked={bookmarks.ids.has(short.id)}
              onBookmark={() => bookmarks.toggle(short.id)}
            />
          ))
        )}

        {loading && (
          <div className="py-8 flex justify-center">
            <span className="w-5 h-5 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
          </div>
        )}

        <div ref={sentinelRef} aria-hidden className="h-px" />

        {!hasMore && shorts.length > 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-400">You've reached the end.</p>
            <p className="text-xs text-slate-600 mt-1">
              New updates are reviewed and published each morning.
            </p>
            <Link
              href="/talk-to-lawyer"
              className="mt-5 inline-block px-5 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
            >
              Talk to a lawyer
            </Link>
          </div>
        )}
      </div>
    </div>
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
  short, index, bookmarked, onBookmark,
}: {
  short: LegalShort
  index: number
  bookmarked: boolean
  onBookmark: () => void
}) {
  const [copied, setCopied] = useState(false)
  const tone = toneFor(short.category)
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
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.15), ease: 'easeOut' }}
      className="relative rounded-xl bg-[#111318] border border-white/8 overflow-hidden hover:border-white/15 transition-colors"
    >
      {/* Category accent down the left edge */}
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${tone.accent}`} aria-hidden />

      <div className="pl-5 pr-4 sm:pl-6 sm:pr-5 py-5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${tone.pill}`}>
            {labelFor(short.category)}
          </span>
          <span className="text-[11px] text-slate-500">
            {timeAgo(short.published_at ?? short.created_at)}
          </span>
        </div>

        <Link href={href} className="block group">
          <h2 className="text-[17px] sm:text-lg font-bold text-white leading-snug group-hover:text-[#D4AF37] transition-colors">
            {short.title}
          </h2>
        </Link>

        <p className="mt-2.5 text-[14px] text-slate-400 leading-relaxed line-clamp-3">
          {short.summary}
        </p>

        {short.takeaway && (
          <div className="mt-4 flex gap-2.5 rounded-lg bg-[#C9A227]/[0.06] border-l-[3px] border-[#C9A227] px-3.5 py-3">
            <span className="text-sm leading-none mt-0.5" aria-hidden>💡</span>
            <p className="text-[13px] leading-relaxed">
              <span className="font-semibold text-[#D4AF37]">What it means: </span>
              <span className="text-slate-300">{short.takeaway}</span>
            </p>
          </div>
        )}

        <div className="mt-4 pt-3.5 border-t border-white/8 flex items-center justify-between gap-3">
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
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#D4AF37] hover:text-white transition-colors"
          >
            Read full update
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" suppressHydrationWarning>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {short.tags && short.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {short.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[11px] text-slate-600">
                #{tag.replace(/\s+/g, '')}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
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

function EmptyFeed() {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" suppressHydrationWarning>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-300">No updates published yet</p>
      <p className="mt-1 text-xs text-slate-500 max-w-xs">
        Legal updates appear here once they've been reviewed by our team.
      </p>
    </div>
  )
}
