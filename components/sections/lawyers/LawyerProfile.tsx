'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lawyer } from '@/lib/lawyers'
import { BookingWidget, type ConsultType } from './BookingWidget'

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-4.5 h-4.5' : 'w-3.5 h-3.5'
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? 'text-[#C9A227]' : 'text-white/20'}`}
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

// ── Profile component ─────────────────────────────────────────────────────────
export function LawyerProfile({ lawyer }: { lawyer: Lawyer }) {

  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'education'>('about')

  /**
   * These buttons used to open a "book this on the LegalX App" modal pointing at
   * App Store and Play Store links marked coming soon — so the one thing the
   * page exists for could not be done on the page. They now select the type in
   * the booking widget and bring it into view, which starts a real call.
   */
  const [consultType, setConsultType] = useState<ConsultType>('chat')

  function chooseConsult(type: ConsultType) {
    setConsultType(type)
    // The desktop widget lives in a `hidden lg:block` sidebar, so on a phone
    // there was nothing to scroll to and tapping a consult button did nothing
    // at all. Each breakpoint gets its own instance; this picks the one that
    // is actually on screen.
    const target =
      document.getElementById('book-consult-mobile')?.offsetParent
        ? document.getElementById('book-consult-mobile')
        : document.getElementById('book-consult')
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const consultOptions = [
    {
      type: 'chat' as const,
      label: 'Chat',
      fee: lawyer.fees.chat,
      desc: 'Text consultation',
      iconPath: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z',
    },
    {
      type: 'voice' as const,
      label: 'Voice Call',
      fee: lawyer.fees.voice,
      desc: 'Phone consultation',
      iconPath: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 7.82 19.79 19.79 0 01-.07 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
    },
    {
      type: 'video' as const,
      label: 'Video Call',
      fee: lawyer.fees.video,
      desc: 'Face-to-face',
      iconPath: 'M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
    },
  ]

  return (
    <>
      {/* Ground matches the listing page. This profile was previously built on
          the light/dark token set while /talk-to-lawyer is permanently dark, so
          following a card into a profile switched the whole page to white. */}
      <main className="bg-[#080B12] min-h-screen">
        {/* Profile header */}
        <section className="bg-[#0E1220] border-b border-white/8">
          <div className="max-w-[1400px] mx-auto px-5 md:px-16">
            {/* Breadcrumb */}
            <nav className="text-label-caps text-slate-500 flex items-center gap-2 pt-6 pb-0" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#C9A227] transition-colors duration-150">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/talk-to-lawyer" className="hover:text-[#C9A227] transition-colors duration-150">Talk to a Lawyer</Link>
              <span aria-hidden>/</span>
              <span className="text-white truncate max-w-[140px]">{lawyer.name}</span>
            </nav>

            {/* Identity block */}
            <div className="flex flex-col sm:flex-row items-start gap-5 py-7">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-md flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: lawyer.avatarBg }}
                >
                  {lawyer.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={lawyer.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-2xl">{lawyer.initials}</span>
                  )}
                </div>
                {lawyer.online && (
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0E1220] rounded-full" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-white font-bold" style={{ fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: 1.2 }}>
                    {lawyer.name}
                  </h1>
                  {lawyer.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm border border-emerald-500/20">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verified
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm border ${
                    lawyer.online
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 text-slate-500 border-white/8'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${lawyer.online ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    {lawyer.online ? 'Online now' : 'Currently offline'}
                  </span>
                </div>

                <p className="text-[#C9A227] font-semibold text-body-sm mb-2">{lawyer.primarySpec}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-slate-400 mb-3">
                  <span>{lawyer.location}</span>
                  <span className="text-slate-500">·</span>
                  <span>{lawyer.languages.join(', ')}</span>
                  <span className="text-slate-500">·</span>
                  <span>Bar No. {lawyer.barNumber}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Stars rating={lawyer.rating} />
                    <span className="text-white font-bold text-body-sm">{lawyer.rating}</span>
                    <span className="text-slate-500 text-body-sm">({lawyer.reviewCount} reviews)</span>
                  </div>
                  <span className="text-body-sm text-slate-400">{lawyer.casesHandled.toLocaleString()} cases · {lawyer.experience} yrs exp</span>
                </div>
              </div>
            </div>

            {/* Consultation type row — 3 columns */}
            <div className="grid grid-cols-3 border-t border-white/8 -mx-5 md:-mx-16">
              {consultOptions.map((opt, i) => (
                <button
                  key={opt.type}
                  onClick={() => chooseConsult(opt.type)}
                  className={`group flex flex-col items-center gap-1.5 py-4 px-3 hover:bg-white/5 transition-colors duration-150 ${i < 2 ? 'border-r border-white/8' : ''}`}
                >
                  <svg className="w-5 h-5 text-slate-500 group-hover:text-[#C9A227] transition-colors duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden suppressHydrationWarning>
                    <path d={opt.iconPath} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-body-sm font-semibold text-white">{opt.label}</span>
                  <span className="text-[11px] text-slate-500 hidden sm:block">{opt.desc}</span>
                  <span className="text-[#C9A227] font-bold text-[12px]">₹{opt.fee}/min</span>
                  <span className="text-[11px] text-[#C9A227] group-hover:underline">Start now →</span>
                </button>
              ))}
            </div>

            {/* Booking widget — phones and tablets.
                The desktop copy sits in a sticky sidebar that is hidden under
                lg, so without this there was no widget on a phone at all and
                the consult buttons above scrolled to nothing. Both instances
                are controlled by the same consultType, so whichever one is on
                screen reflects the button that was tapped. */}
            <div id="book-consult-mobile" className="lg:hidden mt-5">
              <BookingWidget
                lawyer={lawyer}
                type={consultType}
                onTypeChange={setConsultType}
              />
            </div>
          </div>
        </section>

        {/* Profile body */}
        <section className="py-8 bg-[#080B12]">
          <div className="max-w-[1400px] mx-auto px-5 md:px-16">
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Content tabs */}
              <div className="flex-1 min-w-0">
                {/* Tab bar */}
                <div className="flex border border-white/8 bg-[#0E1220] rounded-md overflow-hidden mb-5">
                  {(['about', 'reviews', 'education'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 text-body-sm font-medium capitalize border-b-2 transition-colors duration-150 ${
                        activeTab === tab
                          ? 'border-[#C9A227] text-[#C9A227] bg-[#C9A227]/10'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* About */}
                {activeTab === 'about' && (
                  <div className="space-y-5">
                    <div className="bg-[#0E1220] border border-white/8 rounded-md p-5">
                      <h2 className="text-body-sm font-semibold text-white mb-3">About</h2>
                      <p className="text-body-sm text-slate-400 leading-relaxed">{lawyer.bio}</p>
                    </div>

                    <div className="bg-[#0E1220] border border-white/8 rounded-md p-5">
                      <h2 className="text-body-sm font-semibold text-white mb-3">Areas of Expertise</h2>
                      <div className="flex flex-wrap gap-2">
                        {lawyer.expertise.map((e) => (
                          <span key={e} className="text-body-sm bg-[#C9A227]/10 text-[#C9A227] px-2.5 py-1 rounded-sm font-medium">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0E1220] border border-white/8 rounded-md p-5">
                      <h2 className="text-body-sm font-semibold text-white mb-3">Achievements</h2>
                      <div className="space-y-2">
                        {lawyer.achievements.map((a) => (
                          <div key={a} className="flex items-start gap-2.5">
                            <svg className="w-4 h-4 text-[#C9A227] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden suppressHydrationWarning>
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="text-body-sm text-slate-400">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="bg-[#0E1220] border border-white/8 rounded-md p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="text-center">
                        <div className="text-[44px] font-bold text-white leading-none">{lawyer.rating}</div>
                        <Stars rating={lawyer.rating} />
                        <div className="text-body-sm text-slate-500 mt-1">{lawyer.reviewCount} reviews</div>
                      </div>
                      <div className="flex-1 w-full">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = lawyer.reviews.filter((r) => Math.round(r.rating) === star).length
                          const pct = lawyer.reviews.length ? Math.round((count / lawyer.reviews.length) * 100) : 0
                          return (
                            <div key={star} className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] text-slate-500 w-2.5 text-right">{star}</span>
                              <svg className="w-3 h-3 text-[#C9A227] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <div className="flex-1 bg-white/5 border border-white/8 rounded-full h-1.5">
                                <div className="bg-[#C9A227] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[11px] text-slate-500 w-7">{pct}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {lawyer.reviews.map((review, i) => (
                      <div key={i} className="bg-[#0E1220] border border-white/8 rounded-md p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-sm bg-white/5 border border-white/8 flex items-center justify-center text-[12px] font-semibold text-white">
                              {review.author[0]}
                            </div>
                            <div>
                              <div className="text-body-sm font-semibold text-white">{review.author}</div>
                              <div className="text-[11px] text-slate-500">
                                {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          <Stars rating={review.rating} />
                        </div>
                        <p className="text-body-sm text-slate-400 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    {lawyer.education.map((edu, i) => (
                      <div key={i} className="bg-[#0E1220] border border-white/8 rounded-md p-5 flex items-start gap-4">
                        <div className="w-9 h-9 bg-[#C9A227]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#C9A227]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden suppressHydrationWarning>
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-body-sm font-semibold text-white">{edu.degree}</h3>
                          <p className="text-body-sm text-slate-400 mt-0.5">{edu.institution}</p>
                          <p className="text-[12px] text-slate-500 mt-1">Graduated {edu.year}</p>
                        </div>
                      </div>
                    ))}

                    <div className="bg-[#0E1220] border border-white/8 rounded-md p-5 flex items-start gap-4">
                      <div className="w-9 h-9 bg-emerald-500/10 rounded-sm flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden suppressHydrationWarning>
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-body-sm font-semibold text-white">Bar Council Registration</h3>
                        <p className="text-body-sm text-slate-400 mt-0.5">Enrollment No. {lawyer.barNumber}</p>
                        <p className="text-[12px] text-emerald-400 font-medium mt-1">Verified by LegalX</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky sidebar — desktop only */}
              <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-20 space-y-3">
                  <div id="book-consult">
                    <BookingWidget
                      lawyer={lawyer}
                      type={consultType}
                      onTypeChange={setConsultType}
                    />
                  </div>
                  <Link
                    href="/talk-to-lawyer"
                    className="block text-center text-xs text-slate-500 hover:text-[#C9A227] transition-colors py-2"
                  >
                    ← Back to all lawyers
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile CTA — fixed bottom bar */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0E1220] border-t border-white/8 px-4 py-3 flex items-center gap-3">
              {consultOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => chooseConsult(opt.type)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-sm border transition-colors duration-150 ${
                    opt.type === consultType
                      ? 'bg-[#C9A227] border-[#C9A227] text-white'
                      : 'border-white/8 text-slate-400 hover:border-[#C9A227] hover:text-[#C9A227]'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden suppressHydrationWarning>
                    <path d={opt.iconPath} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[10px] font-semibold">{opt.type}</span>
                  <span className="text-[10px] opacity-80">₹{opt.fee}/min</span>
                </button>
              ))}
            </div>

            {/* Bottom padding for mobile fixed bar */}
            <div className="h-20 lg:hidden" aria-hidden />
          </div>
        </section>
      </main>
    </>
  )
}
