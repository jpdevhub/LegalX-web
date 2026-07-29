'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LAWYERS, SPECIALIZATIONS } from '@/lib/lawyers'
import { FadeUp, StaggerParent, FadeUpChild } from '@/components/motion/MotionWrappers'

// ── Helpers ───────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-primary' : 'text-hairline'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

// ── Lawyer card ───────────────────────────────────────────────────────────────
function LawyerCard({ lawyer }: { lawyer: (typeof LAWYERS)[0] }) {
  return (
    <Link
      href={`/talk-to-lawyer/${lawyer.slug}`}
      className="group flex flex-col bg-white dark:bg-surface-dark border border-hairline dark:border-hairline-dark rounded-md hover:border-primary/50 hover:shadow-card-hover transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 rounded-md flex items-center justify-center"
            style={{ backgroundColor: lawyer.avatarBg }}
          >
            <span className="text-white font-bold text-lg leading-none">{lawyer.initials}</span>
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-surface-dark ${lawyer.online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            aria-label={lawyer.online ? 'Online' : 'Offline'}
          />
        </div>

        {/* Name + spec */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-body-sm font-semibold text-ink dark:text-ink leading-snug group-hover:text-primary transition-colors duration-150">
              {lawyer.name}
            </h2>
            {lawyer.verified && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-sm border border-green-200 dark:border-green-800">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verified
              </span>
            )}
          </div>
          <p className="text-[12px] text-primary font-medium mt-0.5">{lawyer.primarySpec}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Stars rating={lawyer.rating} />
            <span className="text-[12px] font-semibold text-ink dark:text-ink">{lawyer.rating}</span>
            <span className="text-[11px] text-muted">({lawyer.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-5 pb-4 flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center gap-1 text-[12px] text-body-text dark:text-body-text">
          <svg className="w-3 h-3 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {lawyer.location}
        </span>
        <span className="flex items-center gap-1 text-[12px] text-body-text dark:text-body-text">
          <svg className="w-3 h-3 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {lawyer.languages.join(', ')}
        </span>
        <span className="text-[12px] text-muted">{lawyer.experience} yrs exp · {lawyer.casesHandled.toLocaleString()} cases</span>
      </div>

      {/* Fee grid */}
      <div className="mx-5 mb-5 grid grid-cols-3 gap-2 border-t border-hairline dark:border-hairline-dark pt-4">
        {[
          { label: 'Chat', fee: lawyer.fees.chat },
          { label: 'Voice', fee: lawyer.fees.voice },
          { label: 'Video', fee: lawyer.fees.video },
        ].map((opt) => (
          <div
            key={opt.label}
            className="flex flex-col items-center gap-0.5 bg-surface-soft dark:bg-white/5 border border-hairline dark:border-hairline-dark rounded-sm py-2"
          >
            <span className="text-[10px] text-muted font-medium">{opt.label}</span>
            <span className="text-[12px] font-bold text-ink dark:text-ink">₹{opt.fee}/min</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 mt-auto">
        <span className="block w-full text-center bg-primary text-white text-body-sm font-semibold py-2.5 rounded-sm group-hover:bg-primary-hover transition-colors duration-150">
          View Profile
        </span>
      </div>
    </Link>
  )
}

// ── Filter panel — shared between sidebar and mobile sheet ────────────────────
function FilterPanel({
  selectedSpec,
  onSpecChange,
  onlineOnly,
  onOnlineToggle,
  sortBy,
  onSortChange,
}: {
  selectedSpec: string
  onSpecChange: (s: string) => void
  onlineOnly: boolean
  onOnlineToggle: () => void
  sortBy: 'rating' | 'experience' | 'fee-low'
  onSortChange: (s: 'rating' | 'experience' | 'fee-low') => void
}) {
  return (
    <div className="space-y-6">
      {/* Online toggle */}
      <div>
        <button
          id="filter-online"
          onClick={onOnlineToggle}
          className={`flex items-center gap-2.5 w-full text-body-sm py-2 px-3 rounded-sm border transition-colors duration-150 ${
            onlineOnly
              ? 'border-primary bg-primary/8 text-primary font-semibold'
              : 'border-hairline dark:border-hairline-dark text-body-text dark:text-body-text hover:border-primary/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          Online now only
        </button>
      </div>

      {/* Sort */}
      <div>
        <p className="text-label-caps text-muted uppercase tracking-widest mb-2">Sort by</p>
        <div className="space-y-1">
          {([
            ['rating', 'Top Rated'],
            ['experience', 'Most Experienced'],
            ['fee-low', 'Lowest Fee'],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => onSortChange(val)}
              className={`flex items-center gap-2 w-full text-body-sm py-1.5 px-2 rounded-sm transition-colors duration-150 ${
                sortBy === val
                  ? 'text-primary font-semibold bg-primary/8'
                  : 'text-body-text dark:text-body-text hover:text-ink dark:hover:text-ink'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sortBy === val ? 'bg-primary' : 'bg-hairline dark:bg-hairline-dark'}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Practice area */}
      <div>
        <p className="text-label-caps text-muted uppercase tracking-widest mb-2">Practice Area</p>
        <div className="space-y-1">
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              onClick={() => onSpecChange(spec)}
              className={`flex items-center gap-2 w-full text-left text-body-sm py-1.5 px-2 rounded-sm transition-colors duration-150 ${
                selectedSpec === spec
                  ? 'text-primary font-semibold bg-primary/8'
                  : 'text-body-text dark:text-body-text hover:text-ink dark:hover:text-ink'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedSpec === spec ? 'bg-primary' : 'bg-hairline dark:bg-hairline-dark'}`} />
              {spec}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main listing page ─────────────────────────────────────────────────────────
export default function TalkToLawyerPage() {
  const [selectedSpec, setSelectedSpec] = useState('All')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee-low'>('rating')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = [...LAWYERS]
    if (selectedSpec !== 'All') list = list.filter((l) => l.specializations.some((s) => s === selectedSpec) || l.primarySpec === selectedSpec)
    if (onlineOnly) list = list.filter((l) => l.online)
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    else if (sortBy === 'experience') list.sort((a, b) => b.experience - a.experience)
    else list.sort((a, b) => a.fees.chat - b.fees.chat)
    return list
  }, [selectedSpec, onlineOnly, sortBy])

  function clearFilters() {
    setSelectedSpec('All')
    setOnlineOnly(false)
    setSortBy('rating')
  }

  const activeFilterCount = (selectedSpec !== 'All' ? 1 : 0) + (onlineOnly ? 1 : 0) + (sortBy !== 'rating' ? 1 : 0)

  return (
    <main>
      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-ink/50 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed bottom-0 inset-x-0 z-[70] bg-white dark:bg-surface-dark border-t border-hairline dark:border-hairline-dark rounded-t-md shadow-xl lg:hidden overflow-y-auto"
            style={{ maxHeight: '85vh' }}
            aria-label="Filter panel"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-hairline dark:border-hairline-dark sticky top-0 bg-white dark:bg-surface-dark z-10">
              <h2 className="text-body-md font-semibold text-ink dark:text-ink">Filters</h2>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-body-sm text-primary font-medium hover:underline">
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-muted hover:text-ink dark:hover:text-ink transition-colors"
                  aria-label="Close filter panel"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5">
              <FilterPanel
                selectedSpec={selectedSpec}
                onSpecChange={(s) => { setSelectedSpec(s); setMobileFilterOpen(false) }}
                onlineOnly={onlineOnly}
                onOnlineToggle={() => setOnlineOnly(!onlineOnly)}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </aside>
        </>
      )}

      {/* Page header */}
      <section className="bg-white dark:bg-surface-dark border-b border-hairline dark:border-hairline-dark pt-12 pb-10">
        <FadeUp className="max-w-[1400px] mx-auto px-5 md:px-16">
          <span className="text-label-caps text-muted uppercase tracking-widest">Legal Consultation</span>
          <h1
            className="text-ink dark:text-ink mt-2"
            style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, lineHeight: 1.15 }}
          >
            Talk to a Verified Lawyer
          </h1>
          <p className="text-body-md text-body-text dark:text-body-text mt-3 max-w-xl leading-relaxed">
            Connect with Bar Council verified lawyers via chat, voice call, or video call. Consultations are conducted through the LegalX mobile app.
          </p>

          {/* Stat strip */}
          <div className="flex flex-wrap gap-6 mt-7 pt-7 border-t border-hairline dark:border-hairline-dark">
            {[
              { v: '5', l: 'Verified Lawyers' },
              { v: '5', l: 'Practice Areas' },
              { v: '6,200+', l: 'Cases Handled' },
              { v: '4.8★', l: 'Average Rating' },
            ].map((s) => (
              <div key={s.l} className="flex flex-col">
                <span className="text-display-md font-bold text-ink dark:text-ink">{s.v}</span>
                <span className="text-body-sm text-muted">{s.l}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* App notice */}
      <div className="bg-primary/8 border-b border-primary/20">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16 py-3 flex items-center gap-2.5">
          <svg className="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" />
          </svg>
          <p className="text-body-sm text-ink dark:text-ink">
            <span className="font-semibold">Consultations via mobile app only.</span>
            {' '}Browse profiles here — book and pay through the LegalX app (coming soon).
          </p>
        </div>
      </div>

      {/* Filter bar — mobile only */}
      <div className="lg:hidden sticky top-16 z-30 bg-white dark:bg-surface-dark border-b border-hairline dark:border-hairline-dark">
        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <p className="text-body-sm text-body-text dark:text-body-text">
            <span className="font-semibold text-ink dark:text-ink">{filtered.length}</span> lawyers
            {selectedSpec !== 'All' && <span className="text-primary"> · {selectedSpec}</span>}
          </p>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className={`flex items-center gap-2 text-body-sm font-medium px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
              activeFilterCount > 0
                ? 'border-primary bg-primary/8 text-primary'
                : 'border-hairline dark:border-hairline-dark text-body-text dark:text-body-text hover:border-primary/40'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
              <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
              <line x1="11" y1="18" x2="13" y2="18" strokeLinecap="round" />
            </svg>
            Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
        </div>
      </div>

      {/* Main content */}
      <section className="py-10 bg-surface-soft dark:bg-surface-soft-dark">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-white dark:bg-surface-dark border border-hairline dark:border-hairline-dark rounded-md p-5 sticky top-20">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-body-sm font-semibold text-ink dark:text-ink">Filters</h2>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-[12px] text-primary font-medium hover:underline">
                      Clear all
                    </button>
                  )}
                </div>
                <FilterPanel
                  selectedSpec={selectedSpec}
                  onSpecChange={setSelectedSpec}
                  onlineOnly={onlineOnly}
                  onOnlineToggle={() => setOnlineOnly(!onlineOnly)}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1 min-w-0">
              {/* Desktop result count */}
              <div className="hidden lg:flex items-center justify-between mb-5">
                <p className="text-body-sm text-body-text dark:text-body-text">
                  <span className="font-semibold text-ink dark:text-ink">{filtered.length}</span> lawyers found
                  {selectedSpec !== 'All' && <span> in <span className="font-medium text-primary">{selectedSpec}</span></span>}
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white dark:bg-surface-dark border border-hairline dark:border-hairline-dark rounded-md p-12 text-center">
                  <p className="text-body-md text-muted">No lawyers match your filters.</p>
                  <button onClick={clearFilters} className="mt-3 text-body-sm font-semibold text-primary hover:underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((lawyer) => (
                    <FadeUpChild key={lawyer.slug} className="h-full">
                      <LawyerCard lawyer={lawyer} />
                    </FadeUpChild>
                  ))}
                </StaggerParent>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* App CTA */}
      <section className="bg-ink py-14">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="text-center md:text-left">
            <h2 className="text-white font-bold" style={{ fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1.2 }}>
              Ready to consult? Download the LegalX App.
            </h2>
            <p className="text-white/60 text-body-sm mt-2 max-w-md">
              Chat, voice calls, and video consultations are conducted through our mobile app — coming soon on iOS and Android.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {[
              { store: 'App Store', icon: 'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' },
              { store: 'Google Play', icon: 'M3.18 23.76c.3.17.64.24.99.19l12.48-12.48L13.2 8.03 3.18 23.76zm17.58-11.5L17.6 10.4l-3.33 3.33 3.33 3.33 3.2-1.86a1.5 1.5 0 000-2.94zM2.25 1.13l10.95 10.95L16.54 8.7 3.24.94a1.52 1.52 0 00-1-.19zm.93 1.75l10.04 17.4L9.56 12 3.18 2.88z' },
            ].map((app) => (
              <div
                key={app.store}
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-3 rounded-sm cursor-not-allowed opacity-70 select-none"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d={app.icon} />
                </svg>
                <div>
                  <div className="text-[10px] opacity-60">Coming soon</div>
                  <div className="text-[13px] font-semibold">{app.store}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
