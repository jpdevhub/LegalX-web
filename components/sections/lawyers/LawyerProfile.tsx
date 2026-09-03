'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lawyer } from '@/lib/lawyers'
import { BookingWidget } from './BookingWidget'

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

// ── Book from App modal ───────────────────────────────────────────────────────
function BookFromAppModal({
  open,
  onClose,
  consultType,
  lawyerName,
  fee,
}: {
  open: boolean
  onClose: () => void
  consultType: string
  lawyerName: string
  fee: number
}) {
  if (!open) return null

  const icons = {
    Chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" strokeLinecap="round" strokeLinejoin="round" />,
    'Voice Call': <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 7.82 19.79 19.79 0 01-.07 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />,
    'Video Call': <path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />,
  } as Record<string, React.ReactNode>

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div className="relative bg-[#0E1220] w-full sm:max-w-md rounded-t-md sm:rounded-md shadow-2xl z-10 overflow-hidden">
        {/* Modal header */}
        <div className="bg-[#080B12] px-6 pt-6 pb-8 text-center relative">
          <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-md flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden suppressHydrationWarning>
              {icons[consultType]}
            </svg>
          </div>
          <h2 className="text-white font-bold text-[18px] mb-0.5">{consultType} with {lawyerName}</h2>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-[#C9A227]/20 border border-[#C9A227]/30 text-[#C9A227] px-3 py-1 rounded-sm text-body-sm font-semibold">
            ₹{fee}/min
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden suppressHydrationWarning>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-6">
          <div className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-md p-4 mb-5">
            <svg className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden suppressHydrationWarning>
              <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-body-sm font-semibold text-white mb-1">Available on the LegalX App</p>
              <p className="text-body-sm text-slate-400 leading-relaxed">
                All lawyer consultations are booked and conducted through the LegalX mobile app. Payment is processed securely in-app, per minute.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 mb-6">
            {[
              'Secure per-minute billing — no advance payment required',
              'Real-time chat with document and photo sharing',
              'HD voice and video calls with screen lock protection',
              'Consultation notes and history saved in-app',
            ].map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-[#C9A227] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden suppressHydrationWarning>
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-body-sm text-slate-400">{f}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'App Store',
                icon: 'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z',
              },
              {
                label: 'Google Play',
                icon: 'M3.18 23.76c.3.17.64.24.99.19l12.48-12.48L13.2 8.03 3.18 23.76zm17.58-11.5L17.6 10.4l-3.33 3.33 3.33 3.33 3.2-1.86a1.5 1.5 0 000-2.94zM2.25 1.13l10.95 10.95L16.54 8.7 3.24.94a1.52 1.52 0 00-1-.19zm.93 1.75l10.04 17.4L9.56 12 3.18 2.88z',
              },
            ].map((app) => (
              <div
                key={app.label}
                className="flex items-center gap-2 bg-[#080B12] text-white px-4 py-3 rounded-sm cursor-not-allowed opacity-70 select-none justify-center"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d={app.icon} />
                </svg>
                <div>
                  <div className="text-[9px] opacity-60">Coming soon</div>
                  <div className="text-[12px] font-semibold">{app.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Profile component ─────────────────────────────────────────────────────────
export function LawyerProfile({ lawyer }: { lawyer: Lawyer }) {

  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'education'>('about')
  const [modalOpen, setModalOpen] = useState(false)
  const [consultType, setConsultType] = useState<'Chat' | 'Voice Call' | 'Video Call'>('Chat')
  const [consultFee, setConsultFee] = useState(lawyer.fees.chat)

  function openModal(type: 'Chat' | 'Voice Call' | 'Video Call', fee: number) {
    setConsultType(type)
    setConsultFee(fee)
    setModalOpen(true)
  }

  const consultOptions = [
    {
      type: 'Chat' as const,
      fee: lawyer.fees.chat,
      desc: 'Text consultation',
      iconPath: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z',
    },
    {
      type: 'Voice Call' as const,
      fee: lawyer.fees.voice,
      desc: 'Phone consultation',
      iconPath: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 7.82 19.79 19.79 0 01-.07 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
    },
    {
      type: 'Video Call' as const,
      fee: lawyer.fees.video,
      desc: 'Face-to-face',
      iconPath: 'M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
    },
  ]

  return (
    <>
      <BookFromAppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        consultType={consultType}
        lawyerName={lawyer.name}
        fee={consultFee}
      />

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
                  className="w-20 h-20 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: lawyer.avatarBg }}
                >
                  <span className="text-white font-bold text-2xl">{lawyer.initials}</span>
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
                  onClick={() => openModal(opt.type, opt.fee)}
                  className={`group flex flex-col items-center gap-1.5 py-4 px-3 hover:bg-white/5 transition-colors duration-150 ${i < 2 ? 'border-r border-white/8' : ''}`}
                >
                  <svg className="w-5 h-5 text-slate-500 group-hover:text-[#C9A227] transition-colors duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden suppressHydrationWarning>
                    <path d={opt.iconPath} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-body-sm font-semibold text-white">{opt.type}</span>
                  <span className="text-[11px] text-slate-500 hidden sm:block">{opt.desc}</span>
                  <span className="text-[#C9A227] font-bold text-[12px]">₹{opt.fee}/min</span>
                  <span className="text-[11px] text-[#C9A227] group-hover:underline">Book via App →</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* App notice */}
        <div className="bg-[#C9A227]/10 border-b border-[#C9A227]/20">
          <div className="max-w-[1400px] mx-auto px-5 md:px-16 py-3 flex items-center gap-2.5">
            <svg className="w-4 h-4 text-[#C9A227] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden suppressHydrationWarning>
              <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" />
            </svg>
            <p className="text-body-sm text-white">
              Consultations with <span className="font-semibold">{lawyer.name}</span> are booked through the <span className="font-semibold">LegalX mobile app</span> — coming soon.
            </p>
          </div>
        </div>

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
                  <BookingWidget lawyer={lawyer} />
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
                  onClick={() => openModal(opt.type, opt.fee)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-sm border transition-colors duration-150 ${
                    opt.type === 'Chat'
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
