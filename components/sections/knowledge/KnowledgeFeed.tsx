'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetShorts, type LegalShort } from '@/lib/api'

/**
 * Vertical snap-scrolling feed, one judgment per screen.
 *
 * Snapping is CSS (`scroll-snap-type`) rather than JS so it stays smooth on
 * low-end Android, which is most of the Indian mobile market. The observer
 * below only tracks which card is active for the progress dots and prefetch —
 * it never drives the scroll itself.
 */

// One screen per card, so a generous page keeps scrolling smooth without
// hammering the backend.
const PAGE_SIZE = 20

const CATEGORY_TONES: Record<string, string> = {
  Criminal:    'bg-rose-500/15 text-rose-300 border-rose-500/25',
  Civil:       'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Corporate:   'bg-violet-500/15 text-violet-300 border-violet-500/25',
  Family:      'bg-pink-500/15 text-pink-300 border-pink-500/25',
  Property:    'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Tax:         'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Labour:      'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  Constitutional: 'bg-[#C9A227]/15 text-[#D4AF37] border-[#C9A227]/25',
}

function toneFor(category: string): string {
  return CATEGORY_TONES[category] ?? 'bg-white/10 text-slate-300 border-white/15'
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
  const [active, setActive] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  // Always re-fetch on mount.
  //
  // The page is statically generated for a fast first paint, but that snapshot
  // is taken at build/revalidate time — so a card published since then would be
  // invisible until the ISR window expired. The server HTML is the placeholder;
  // this is the source of truth.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const page = await apiGetShorts({ limit: PAGE_SIZE })
        if (cancelled) return
        setShorts(page.shorts)
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
      } catch {
        // Keep whatever the server rendered.
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Track the card in view for the progress rail.
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
      // Root is the viewport, not the container. On mobile the container is
      // exactly viewport-height so the two are equivalent; on desktop the
      // container no longer scrolls, and a non-scrolling root would never fire
      // — which would silently kill infinite scroll there.
      { root: null, threshold: 0.4 }
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

  // Prefetch when the reader is three cards from the end.
  useEffect(() => {
    if (hasMore && active >= shorts.length - 5) loadMore()
  }, [active, shorts.length, hasMore, loadMore])

  const switchCategory = async (next: string) => {
    if (next === category) return
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
  }

  return (
    <div className="relative">
      {/* Category chips */}
      {categories.length > 0 && (
        <div className="sticky top-0 z-20 bg-[#0A0D14]/90 backdrop-blur-md border-b border-white/8">
          <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
            {[{ name: 'all', count: 0 }, ...categories].map(c => (
              <button
                key={c.name}
                onClick={() => switchCategory(c.name)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  category === c.name
                    ? 'bg-[#C9A227] text-[#0A0D14] border-[#C9A227]'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/25'
                }`}
              >
                {c.name === 'all' ? 'All' : c.name}
                {c.count > 0 && <span className="ml-1.5 opacity-60">{c.count}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {shorts.length === 0 ? (
        <EmptyFeed loading={loading} />
      ) : (
        <>
          {/* Progress rail — desktop only, mobile has the scrollbar */}
          {/* Tracks position in the snap feed — meaningless in the desktop grid. */}
          <div className="hidden md:flex lg:hidden fixed right-6 top-1/2 -translate-y-1/2 z-20 flex-col gap-1.5">
            {shorts.slice(0, 12).map((_, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  i === active ? 'h-6 bg-[#C9A227]' : 'h-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/*
            Two layouts, one data source.

            On phones this is a full-bleed snap feed — one judgment per screen,
            thumb-scrolled, which is what the format is for. On a wide desktop
            that same layout wastes most of the viewport and forces a scroll per
            card, so above `lg` it becomes an ordinary two-column reading grid.
            Snapping is disabled there rather than restyled, because snap points
            on a multi-column grid fight the scroll.
          */}
          <div
            ref={containerRef}
            className="
              h-[calc(100vh-64px-53px)] overflow-y-auto no-scrollbar
              snap-y snap-mandatory
              lg:h-auto lg:overflow-visible lg:snap-none
              lg:grid lg:grid-cols-2 lg:gap-5 lg:px-6 lg:py-8 lg:max-w-[1180px] lg:mx-auto
              xl:grid-cols-3
            "
          >
            {shorts.map((short, i) => (
              <article
                key={short.id}
                data-index={i}
                ref={el => { cardRefs.current[i] = el }}
                className="
                  snap-start snap-always h-[calc(100vh-64px-53px)]
                  flex items-center justify-center px-5 py-8
                  lg:h-auto lg:block lg:p-0
                "
              >
                <ShortCard short={short} />
              </article>
            ))}

            {loading && (
              <div className="h-24 lg:col-span-full flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
              </div>
            )}

            {!hasMore && shorts.length > 0 && (
              <div className="h-[40vh] lg:h-auto lg:py-14 lg:col-span-full flex flex-col items-center justify-center text-center px-6 snap-start">
                <p className="text-sm text-slate-400">You've reached the end.</p>
                <p className="text-xs text-slate-600 mt-1">
                  That's every update we've published. New ones are added each morning.
                </p>
                <Link
                  href="/talk-to-lawyer"
                  className="mt-5 px-5 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
                >
                  Talk to a lawyer
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ShortCard({ short }: { short: LegalShort }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = short.slug
      ? `${window.location.origin}/knowledge-center/${short.slug}`
      : window.location.href
    // Native share sheet on mobile; clipboard everywhere else.
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
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="
        w-full max-w-[560px] max-h-full overflow-y-auto no-scrollbar
        rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-7
        lg:max-w-none lg:max-h-none lg:overflow-visible lg:h-full lg:flex lg:flex-col
        lg:hover:border-white/20 lg:transition-colors
      "
    >
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide ${toneFor(short.category)}`}>
          {short.category}
        </span>
        {short.court && (
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400">
            {short.court}
          </span>
        )}
        {short.judgment_date && (
          <span className="text-[11px] text-slate-500">{formatDate(short.judgment_date)}</span>
        )}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-4">
        {short.title}
      </h2>

      <p className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-wrap lg:text-sm lg:line-clamp-[9]">
        {short.summary}
      </p>

      {short.takeaway && (
        <div className="mt-5 p-4 rounded-xl bg-[#C9A227]/8 border-l-4 border-[#C9A227]">
          <p className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wide mb-1.5">
            What it means for you
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">{short.takeaway}</p>
        </div>
      )}

      {short.tags && short.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {short.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-slate-500">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 lg:mt-auto pt-4 border-t border-white/8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
            </svg>
            {copied ? 'Copied' : 'Share'}
          </button>

          {short.source_url && (
            <a
              href={short.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
            >
              Full judgment
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>

        <Link
          href="/talk-to-lawyer"
          className="text-xs font-semibold text-[#D4AF37] hover:text-white transition-colors whitespace-nowrap"
        >
          Ask a lawyer →
        </Link>
      </div>
    </motion.div>
  )
}

function EmptyFeed({ loading }: { loading: boolean }) {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6">
      {loading ? (
        <span className="w-6 h-6 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" suppressHydrationWarning>
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-300">No updates published yet</p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs">
            Daily judgment summaries appear here once they've been reviewed by our team.
          </p>
        </>
      )}
    </div>
  )
}
