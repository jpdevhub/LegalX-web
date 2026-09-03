'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetLawyers, type ApiLawyer } from '@/lib/api'
import { ConsultIcon, SearchIcon } from '@/components/ui/ConsultIcons'

const SPECIALIZATIONS = [
  'All',
  'Criminal & Civil Law',
  'Family & Divorce Law',
  'Corporate & Startup Law',
  'Cheque Bounce & Money Recovery',
  'Property & Real Estate Law',
]

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-[#C9A227]' : 'text-white/20'}`}
          viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[#0E1220] border border-white/8 rounded-sm p-5 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-sm bg-white/8 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/8 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
          <div className="h-3 bg-white/5 rounded w-1/3" />
        </div>
      </div>
      <div className="h-px bg-white/5 mb-4" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-white/5 rounded-lg" />)}
      </div>
    </div>
  )
}

// ── Lawyer Card ───────────────────────────────────────────────────────────────
function LawyerCard({ lawyer }: { lawyer: ApiLawyer }) {
  return (
    <Link
      href={`/talk-to-lawyer/${lawyer.slug}`}
      className="group relative flex flex-col bg-[#0E1220] border border-white/8 rounded-sm overflow-hidden
        hover:border-[#C9A227]/40 hover:shadow-[0_0_40px_rgba(201,162,39,0.08)] transition-all duration-300"
    >
      {/* Availability. A steady dot: this is status, and the pulse animation
          made every card compete for attention. */}
      {lawyer.online && (
        <span className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Online</span>
        </span>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-sm flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: lawyer.avatarBg }}
            >
              {lawyer.initials}
            </div>
            {!lawyer.online && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0E1220] bg-slate-600" />
            )}
          </div>

          {/* Name + spec */}
          <div className="flex-1 min-w-0 pr-16">
            <h2 className="text-white font-semibold text-sm leading-snug group-hover:text-[#C9A227] transition-colors mb-0.5">
              {lawyer.name}
            </h2>
            {lawyer.verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full mb-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verified
              </span>
            )}
            <p className="text-[#C9A227] text-xs font-medium">{lawyer.primarySpec}</p>
          </div>
        </div>

        {/* Rating + meta */}
        <div className="flex items-center gap-2 mb-3">
          <Stars rating={lawyer.rating} />
          <span className="text-white text-xs font-semibold">{lawyer.rating}</span>
          <span className="text-slate-500 text-xs">({lawyer.reviewCount})</span>
          <span className="text-slate-600 text-xs">·</span>
          <span className="text-slate-500 text-xs">{lawyer.experience}y exp</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {lawyer.specializations.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] text-slate-400 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>

        {/* Location */}
        <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {lawyer.location} · {lawyer.languages.join(', ')}
        </p>
      </div>

      {/* Fee grid */}
      <div className="grid grid-cols-3 gap-px bg-white/5 border-t border-white/8 mt-auto">
        {([
          { label: 'Chat', fee: lawyer.fees.chat, channel: 'chat' },
          { label: 'Voice', fee: lawyer.fees.voice, channel: 'voice' },
          { label: 'Video', fee: lawyer.fees.video, channel: 'video' },
        ] as const).map((opt) => (
          <div key={opt.label} className="bg-[#0E1220] px-3 py-3 text-center group-hover:bg-white/[0.02] transition-colors">
            <ConsultIcon channel={opt.channel} className="w-4 h-4 mx-auto mb-1.5 text-slate-500" />
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{opt.label}</div>
            <div className="text-sm font-bold text-white mt-0.5 tabular-nums">
              ₹{opt.fee}<span className="text-[10px] text-slate-500 font-normal">/min</span>
            </div>
          </div>
        ))}
      </div>
    </Link>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TalkToLawyerPage() {
  const [lawyers, setLawyers]         = useState<ApiLawyer[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [selectedSpec, setSelectedSpec] = useState('All')
  const [onlineOnly, setOnlineOnly]   = useState(false)
  const [sortBy, setSortBy]           = useState<'rating' | 'experience' | 'price'>('rating')
  // The filter panel is a full-height column on desktop, but on a phone it sat
  // above the results and pushed every lawyer below the fold. Collapsed by
  // default there, always open from lg up.
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    apiGetLawyers()
      .then(setLawyers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const onlineCount = lawyers.filter((l) => l.online).length

  // Derived from the roster, never asserted. If a number cannot be computed
  // from real lawyers it is not shown.
  const stats = useMemo(() => {
    if (lawyers.length === 0) return []
    const verified = lawyers.filter((l) => l.verified).length
    const areas = new Set(lawyers.flatMap((l) => l.specializations ?? [])).size
    const cases = lawyers.reduce((sum, l) => sum + (l.casesHandled || 0), 0)
    const rated = lawyers.filter((l) => l.rating > 0)
    const avg = rated.length
      ? (rated.reduce((sum, l) => sum + l.rating, 0) / rated.length).toFixed(1)
      : null
    const years = lawyers.reduce((sum, l) => sum + (l.experience || 0), 0)

    return [
      { label: 'Verified', value: String(verified) },
      { label: 'Practice areas', value: String(areas) },
      cases > 0
        ? { label: 'Cases handled', value: cases.toLocaleString('en-IN') }
        : { label: 'Years combined', value: String(years) },
      avg ? { label: 'Avg rating', value: avg } : { label: 'Online now', value: String(onlineCount) },
    ]
  }, [lawyers, onlineCount])

  const filtered = useMemo(() => {
    let list = lawyers

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.primarySpec.toLowerCase().includes(q) ||
        l.specializations.some((s) => s.toLowerCase().includes(q)) ||
        l.location.toLowerCase().includes(q)
      )
    }

    if (selectedSpec !== 'All') {
      list = list.filter((l) =>
        l.primarySpec === selectedSpec ||
        l.specializations.includes(selectedSpec)
      )
    }

    if (onlineOnly) {
      list = list.filter((l) => l.online)
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'rating')     return b.rating - a.rating
      if (sortBy === 'experience') return b.experience - a.experience
      if (sortBy === 'price')      return a.fees.chat - b.fees.chat
      return 0
    })
  }, [lawyers, search, selectedSpec, onlineOnly, sortBy])

  return (
    <main className="min-h-screen bg-[#080B12]">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/8">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A227]/6 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-14 sm:pt-20 pb-12 sm:pb-16">
          {/* Availability. A steady dot, not a pulsing one — this is a status
              readout, and the animation made it read as decoration. */}
          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 text-xs font-medium mb-5"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${onlineCount > 0 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span className={onlineCount > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                {onlineCount > 0
                  ? `${onlineCount} available now`
                  : 'No one online right now'}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">
                {lawyers.length} verified advocate{lawyers.length === 1 ? '' : 's'}
              </span>
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-white font-bold mb-4 leading-[1.08] tracking-tight"
            style={{ fontSize: 'clamp(30px, 4.5vw, 52px)' }}
          >
            Find your expert<br />
            <span className="text-[#C9A227]">legal advisor</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-base mb-8 max-w-xl"
          >
            Consult verified Indian advocates — Chat, Voice or Video Call, billed per minute.
            Your funds are held securely and only charged for time used.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative max-w-xl"
          >
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              id="lawyer-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialization, or location…"
              className="w-full pl-11 pr-4 py-3.5 bg-[#0E1220] border border-white/10 rounded-sm text-white text-sm placeholder-slate-500
                focus:outline-none focus:border-[#C9A227]/50 focus:ring-1 focus:ring-[#C9A227]/20 transition-all"
            />
          </motion.div>

          {/*
            Every figure here is computed from the lawyers actually on the
            platform. These were hardcoded — "6,200+ cases handled", "4.8 avg
            rating" — which is a claim the site cannot support and reads as
            filler next to a real count of five.
          */}
          {!loading && lawyers.length > 0 && (
            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/8 border border-white/8 rounded-sm overflow-hidden max-w-2xl"
            >
              {stats.map((s) => (
                <div key={s.label} className="bg-[#0E1220] px-4 py-3.5">
                  <dt className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    {s.label}
                  </dt>
                  <dd className="text-xl font-bold text-white tabular-nums mt-0.5">
                    {s.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>
      </section>

      {/* ── Filters + Grid ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            aria-expanded={filtersOpen}
            aria-controls="lawyer-filters"
            className="lg:hidden w-full flex items-center justify-between gap-2 bg-[#0E1220] border border-white/8 rounded-sm px-4 py-3 text-sm font-semibold text-white"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#C9A227]" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filters &amp; sort
              {(selectedSpec !== 'All' || onlineOnly) && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#C9A227] text-[#0A0D14] text-[10px] font-bold">
                  {(selectedSpec !== 'All' ? 1 : 0) + (onlineOnly ? 1 : 0)}
                </span>
              )}
            </span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Sidebar */}
          <aside id="lawyer-filters" className={`lg:w-56 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-[#0E1220] border border-white/8 rounded-sm p-5 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-white">Filters</h2>
                {(selectedSpec !== 'All' || onlineOnly) && (
                  <button
                    onClick={() => { setSelectedSpec('All'); setOnlineOnly(false) }}
                    className="text-xs text-[#C9A227] font-medium hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Practice area */}
              <div className="mb-5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Practice Area</p>
                <div className="space-y-0.5">
                  {SPECIALIZATIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSpec(s)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                        selectedSpec === s
                          ? 'bg-[#C9A227]/15 text-[#C9A227] font-semibold border border-[#C9A227]/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Online only toggle */}
              <div className="mb-5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Availability</p>
                <button
                  onClick={() => setOnlineOnly(!onlineOnly)}
                  className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg border transition-colors ${
                    onlineOnly
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'border-white/8 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Online Now
                  {/* The knob was positioned absolute with no left anchor, so
                      its translate-x had no origin and it sat outside the
                      track — the switch read as a solid green bar. */}
                  <span
                    className={`relative shrink-0 w-8 h-[18px] rounded-full transition-colors ${
                      onlineOnly ? 'bg-emerald-500' : 'bg-white/15'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        onlineOnly ? 'translate-x-[14px]' : 'translate-x-0'
                      }`}
                    />
                  </span>
                </button>
              </div>

              {/* Sort */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sort By</p>
                <div className="space-y-0.5">
                  {([
                    { v: 'rating', l: 'Highest Rated' },
                    { v: 'experience', l: 'Most Experienced' },
                    { v: 'price', l: 'Lowest Price' },
                  ] as const).map((s) => (
                    <button
                      key={s.v}
                      onClick={() => setSortBy(s.v)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                        sortBy === s.v
                          ? 'bg-[#C9A227]/15 text-[#C9A227] font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-white">{loading ? '—' : filtered.length}</span> lawyers found
                {selectedSpec !== 'All' && <span className="text-[#C9A227]"> · {selectedSpec}</span>}
              </p>
              {onlineOnly && (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Online only
                </span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-[#0E1220] border border-white/8 border-dashed rounded-sm p-16 text-center">
                <SearchIcon className="w-7 h-7 mx-auto mb-3 text-slate-600" />
                <p className="text-white font-medium mb-1">No lawyers match your filters</p>
                <button
                  onClick={() => { setSearch(''); setSelectedSpec('All'); setOnlineOnly(false) }}
                  className="text-sm text-[#C9A227] hover:underline mt-2"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((lawyer, i) => (
                  <motion.div
                    key={lawyer.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  >
                    <LawyerCard lawyer={lawyer} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────────────────── */}
      <section className="border-t border-white/8 bg-[#0E1220]/60 py-14 mt-4">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-white font-bold text-2xl mb-3">Are you a verified Advocate?</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Join LegalX and connect with clients who need your expertise. Get a verified badge and start earning.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#B08A1E] text-black text-sm font-bold px-6 py-3 rounded-sm transition-colors"
          >
            Apply as a Lawyer →
          </Link>
        </div>
      </section>
    </main>
  )
}
