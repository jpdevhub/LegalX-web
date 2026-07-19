'use client'

import { useState } from 'react'
import type { LegalDocument } from '@/lib/documents'
import Link from 'next/link'

// ── Document-type icons (SVG, inline) ────────────────────────────────────────
function DocIcon({ iconKey }: { iconKey: string }) {
  const cls = 'w-10 h-10 text-primary'
  switch (iconKey) {
    case 'pan':
    case 'pan-card':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 9h4M6 13h2M14 9h4M14 13h2" strokeLinecap="round" />
        </svg>
      )
    case 'aadhaar':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="11" r="2.5" strokeLinecap="round" />
          <path d="M13 9h5M13 12h4M13 15h3" strokeLinecap="round" />
        </svg>
      )
    case 'biz-cert':
    case 'biz-proof':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6M9 12h6M9 16h4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17" cy="18" r="3" fill="none" />
          <path d="M15.5 18l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'id-proof':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="11" r="2" strokeLinecap="round" />
          <path d="M5 17c0-1.657 1.343-3 3-3s3 1.343 3 3M14 9h5M14 12h3" strokeLinecap="round" />
        </svg>
      )
    case 'address':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'bank':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 12h2M2 11h20M6 7V5a6 6 0 0112 0v2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'auth-letter':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 9l1 1-2 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'rent':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14h4M10 17h2" strokeLinecap="round" />
          <circle cx="16" cy="16" r="3" />
          <path d="M14.5 16l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'photo':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="3" strokeLinecap="round" />
          <path d="M7 21c0-2.761 2.239-5 5-5s5 2.239 5 5" strokeLinecap="round" />
        </svg>
      )
    case 'noc':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6M9 15l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'food-list':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12h6M9 16h3" strokeLinecap="round" />
        </svg>
      )
    case 'logo':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'udyam':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DocHero({ doc }: { doc: LegalDocument }) {
  return (
    <section className="pt-14 pb-12 bg-white dark:bg-[#0d0d0d] border-b border-hairline dark:border-white/10">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        {/* Breadcrumb */}
        <nav className="text-label-caps text-muted mb-6 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/documents" className="hover:text-primary transition-colors">Services</Link>
          <span>/</span>
          <span className="text-ink dark:text-white">{doc.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <span className="text-label-caps text-primary uppercase tracking-widest mb-3 block">
              Legal Service
            </span>
            <h1
              className="text-ink dark:text-white mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}
            >
              {doc.title}
            </h1>
            <p className="text-body-md text-body-text dark:text-slate-400 leading-relaxed mb-6 max-w-md">
              {doc.definition.split('.')[0]}.
            </p>
            <ul className="space-y-2 mb-8">
              {doc.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-body-sm text-body-text dark:text-slate-400">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <Link
                href={`/request/${doc.slug}`}
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-md hover:bg-primary-hover transition-colors duration-150 text-body-sm"
              >
                Apply online
              </Link>
              <div className="text-body-sm">
                <span className="font-semibold text-ink dark:text-white">{doc.price}</span>
                <span className="text-muted ml-1">· {doc.duration}</span>
              </div>
            </div>
          </div>

          {/* Right — key points preview card */}
          <div className="hidden lg:block">
            <div className="bg-surface-soft dark:bg-white/5 rounded-xl p-7 border border-hairline dark:border-white/10">
              <p className="text-label-caps text-muted uppercase tracking-widest mb-4">Key Details</p>
              <div className="space-y-3">
                {doc.keyPoints.slice(0, 5).map((kp, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-body-sm text-body-text dark:text-slate-300 leading-snug">{kp}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-hairline dark:border-white/10 flex items-center justify-between">
                <span className="text-label-caps text-muted">Estimated time to apply</span>
                <span className="font-semibold text-ink dark:text-white text-body-sm">{doc.estimatedTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DocDefinition({ doc }: { doc: LegalDocument }) {
  return (
    <section className="py-14 bg-white dark:bg-[#0d0d0d]" aria-labelledby={`what-is-${doc.slug}`}>
      <div className="max-w-3xl mx-auto px-5 md:px-16">
        <h2
          id={`what-is-${doc.slug}`}
          className="text-ink dark:text-white mb-4 text-center"
          style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}
        >
          What is {doc.title}?
        </h2>
        <p className="text-body-md text-body-text dark:text-slate-400 leading-relaxed text-center mb-6">
          {doc.definition}
        </p>
        <div className="border-l-4 border-primary pl-5 mt-6">
          <p className="text-body-sm text-body-text dark:text-slate-400 italic leading-relaxed">{doc.definitionQuote}</p>
        </div>
      </div>
    </section>
  )
}

// ── NEW: Benefits section ─────────────────────────────────────────────────────
function DocBenefits({ doc }: { doc: LegalDocument }) {
  return (
    <section className="py-16 bg-surface-soft dark:bg-[#111]" aria-labelledby={`benefits-${doc.slug}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <div className="text-center mb-10">
          <span className="text-label-caps text-primary uppercase tracking-widest">Why Register?</span>
          <h2
            id={`benefits-${doc.slug}`}
            className="text-ink dark:text-white mt-2"
            style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, lineHeight: 1.25 }}
          >
            Benefits of {doc.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doc.benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white dark:bg-white/5 rounded-xl p-5 border border-hairline dark:border-white/10 hover:border-primary/30 transition-colors duration-200"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-body-sm text-body-text dark:text-slate-300 leading-relaxed">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── NEW: Required Documents — icon-above, name-below grid ────────────────────
function DocRequiredDocs({ doc }: { doc: LegalDocument }) {
  const required = doc.requiredDocs.filter((d) => d.required)
  const optional = doc.requiredDocs.filter((d) => !d.required)

  return (
    <section className="py-16 bg-white dark:bg-[#0d0d0d]" aria-labelledby={`req-docs-${doc.slug}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        {/* Section heading */}
        <div className="text-center mb-3">
          <span className="text-label-caps text-primary uppercase tracking-widest">Checklist</span>
          <h2
            id={`req-docs-${doc.slug}`}
            className="text-ink dark:text-white mt-2"
            style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, lineHeight: 1.25 }}
          >
            Required Documents for {doc.title}
          </h2>
          {/* Yellow underline accent */}
          <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>

        {/* Required docs grid */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
          {required.map((d) => (
            <div key={d.id} className="flex flex-col items-center text-center group">
              {/* Icon container */}
              <div className="w-20 h-20 rounded-2xl bg-primary/8 dark:bg-primary/12 border border-primary/20 dark:border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors duration-200">
                <DocIcon iconKey={d.iconKey} />
              </div>
              <p className="text-body-sm font-semibold text-ink dark:text-white leading-snug max-w-[140px]">{d.name}</p>
              <p className="text-[11px] text-muted mt-1">{d.acceptedFormats}</p>
            </div>
          ))}
        </div>

        {/* Optional docs — smaller, secondary row */}
        {optional.length > 0 && (
          <div className="mt-14 pt-10 border-t border-hairline dark:border-white/10">
            <p className="text-label-caps text-muted uppercase tracking-widest text-center mb-8">
              Additional Documents (if applicable)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8">
              {optional.map((d) => (
                <div key={d.id} className="flex flex-col items-center text-center group opacity-75 hover:opacity-100 transition-opacity duration-200">
                  <div className="w-16 h-16 rounded-xl bg-surface-soft dark:bg-white/5 border border-hairline dark:border-white/10 flex items-center justify-center mb-3 group-hover:border-primary/30 transition-colors duration-200">
                    <DocIcon iconKey={d.iconKey} />
                  </div>
                  <p className="text-[12px] font-medium text-ink dark:text-slate-300 leading-snug max-w-[130px]">{d.name}</p>
                  <span className="text-[10px] text-muted mt-1 bg-surface-soft dark:bg-white/5 px-2 py-0.5 rounded-full">Optional</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function DocKeyPoints({ doc }: { doc: LegalDocument }) {
  return (
    <section className="py-14 bg-surface-soft dark:bg-[#111]" aria-labelledby={`included-${doc.slug}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <h2
          id={`included-${doc.slug}`}
          className="text-ink dark:text-white mb-8"
          style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}
        >
          What&apos;s included
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doc.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3 bg-white dark:bg-white/5 rounded-xl p-4 border border-hairline dark:border-white/10">
              <span className="text-[13px] font-bold text-primary w-5 flex-shrink-0">{i + 1}</span>
              <p className="text-body-sm text-body-text dark:text-slate-300 leading-snug">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DocSteps({ doc }: { doc: LegalDocument }) {
  const steps = [
    { n: '1', title: 'Requirements', desc: 'Answer a short questionnaire about your specific needs.' },
    { n: '2', title: 'Your Details', desc: 'Provide the names, addresses, and relevant party information.' },
    { n: '3', title: 'Review', desc: 'Preview the draft before proceeding.' },
    { n: '4', title: 'Payment', desc: `Pay securely. ${doc.price} — no hidden charges.` },
  ]
  return (
    <section className="py-14 bg-white dark:bg-[#0d0d0d]" aria-labelledby={`steps-${doc.slug}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <h2
          id={`steps-${doc.slug}`}
          className="text-ink dark:text-white mb-10"
          style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}
        >
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((s, i) => (
            <div key={s.n} className="relative pr-6 pb-8 lg:pb-0">
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-5 left-[calc(2.5rem+1px)] right-0 h-px bg-hairline dark:bg-white/10"
                  aria-hidden="true"
                />
              )}
              <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0 bg-white dark:bg-[#0d0d0d] relative z-10 mb-4">
                <span className="text-primary font-bold text-[15px]">{s.n}</span>
              </div>
              <h3 className="text-display-md text-ink dark:text-white mb-1">{s.title}</h3>
              <p className="text-body-sm text-body-text dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href={`/request/${doc.slug}`}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-md hover:bg-primary-hover transition-colors duration-150 text-body-sm"
          >
            Get started — {doc.price}
          </Link>
        </div>
      </div>
    </section>
  )
}

function DocFaq({ doc }: { doc: LegalDocument }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-14 bg-surface-soft dark:bg-[#111]" aria-labelledby={`faq-${doc.slug}`}>
      <div className="max-w-2xl mx-auto px-5 md:px-16">
        <h2
          id={`faq-${doc.slug}`}
          className="text-ink dark:text-white mb-8 text-center"
          style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {doc.faqs.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-white/5 rounded-xl overflow-hidden border border-hairline dark:border-white/10">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-body-sm font-medium text-ink dark:text-white text-left gap-3"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <ChevronIcon open={open === i} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-body-sm text-body-text dark:text-slate-400 leading-relaxed border-t border-hairline dark:border-white/10 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main exported component ───────────────────────────────────────────────────
export function DocumentDetail({ doc }: { doc: LegalDocument }) {
  return (
    <>
      <DocHero doc={doc} />
      <DocDefinition doc={doc} />
      <DocBenefits doc={doc} />
      <DocRequiredDocs doc={doc} />
      <DocKeyPoints doc={doc} />
      <DocSteps doc={doc} />
      <DocFaq doc={doc} />
    </>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 flex-shrink-0 text-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
