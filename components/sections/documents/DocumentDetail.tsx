'use client'

import { useState } from 'react'
import type { LegalDocument } from '@/lib/documents'
import Link from 'next/link'

// ── Sub-components are colocated since they are only used here ──────────────

function DocHero({ doc }: { doc: LegalDocument }) {
  return (
    <section className="pt-14 pb-12 bg-white border-b border-hairline">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        {/* Breadcrumb */}
        <nav className="text-label-caps text-muted mb-6 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/documents" className="hover:text-primary transition-colors">Documents</Link>
          <span>/</span>
          <span className="text-ink">{doc.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <span className="text-label-caps text-primary uppercase tracking-widest mb-3 block">
              Legal Service
            </span>
            <h1
              className="text-ink mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}
            >
              {doc.title}
            </h1>
            <p className="text-body-md text-body-text leading-relaxed mb-6 max-w-md">
              {doc.definition.split('.')[0]}.
            </p>
            <ul className="space-y-2 mb-8">
              {doc.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-body-sm text-body-text">
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
                <span className="font-semibold text-ink">{doc.price}</span>
                <span className="text-muted ml-1">· {doc.duration}</span>
              </div>
            </div>
          </div>

          {/* Right — document preview mockup */}
          <div className="hidden lg:block">
            <div className="bg-surface-soft rounded-lg p-8 border border-hairline">
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-hairline" />
                  <div className="w-2.5 h-2.5 rounded-full bg-hairline" />
                  <div className="w-2.5 h-2.5 rounded-full bg-hairline" />
                </div>
                <span className="text-label-caps text-muted">PREVIEW</span>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-hairline rounded w-3/4" />
                <div className="h-3 bg-hairline rounded w-full" />
                <div className="h-3 bg-hairline rounded w-5/6" />
                <div className="h-3 bg-hairline rounded w-2/3 mt-4" />
                <div className="h-3 bg-hairline rounded w-full" />
                <div className="h-3 bg-hairline rounded w-4/5" />
                <div className="h-3 bg-hairline rounded w-full" />
                <div className="mt-5 h-16 bg-hairline/50 rounded" />
                <div className="h-3 bg-hairline rounded w-3/5 mt-4" />
                <div className="h-3 bg-hairline rounded w-full" />
                <div className="h-3 bg-hairline rounded w-5/6" />
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
    <section className="py-14 bg-white" aria-labelledby={`what-is-${doc.slug}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-16 max-w-3xl">
        <h2
          id={`what-is-${doc.slug}`}
          className="text-ink mb-4 text-center"
          style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}
        >
          What is a {doc.title}?
        </h2>
        <p className="text-body-md text-body-text leading-relaxed text-center mb-6">
          {doc.definition}
        </p>
        {/* Legal quote — plain, no blue box */}
        <div className="border-l-4 border-primary pl-5 mt-6">
          <p className="text-body-sm text-body-text italic leading-relaxed">{doc.definitionQuote}</p>
        </div>
      </div>
    </section>
  )
}

function DocKeyPoints({ doc }: { doc: LegalDocument }) {
  return (
    <section className="py-14 bg-surface-soft" aria-labelledby={`included-${doc.slug}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <h2
          id={`included-${doc.slug}`}
          className="text-ink mb-8"
          style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}
        >
          What&apos;s included
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doc.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-md p-4">
              <span className="text-[13px] font-bold text-ink w-5 flex-shrink-0">{i + 1}</span>
              <p className="text-body-sm text-body-text leading-snug">{point}</p>
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
    { n: '3', title: 'Review', desc: 'Preview the generated draft before proceeding.' },
    { n: '4', title: 'Payment', desc: `Pay securely. ${doc.price} — no hidden charges.` },
  ]
  return (
    <section className="py-14 bg-white" aria-labelledby={`steps-${doc.slug}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <h2
          id={`steps-${doc.slug}`}
          className="text-ink mb-10"
          style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}
        >
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((s, i) => (
            <div key={s.n} className="relative pr-6 pb-8 lg:pb-0">
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-5 left-[calc(2.5rem+1px)] right-0 h-px bg-hairline"
                  aria-hidden="true"
                />
              )}
              <div className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center flex-shrink-0 bg-white relative z-10 mb-4">
                <span className="text-ink font-bold text-[15px]">{s.n}</span>
              </div>
              <h3 className="text-display-md text-ink mb-1">{s.title}</h3>
              <p className="text-body-sm text-body-text leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href={`/request/${doc.slug}`}
            className="inline-flex items-center gap-2 bg-ink text-white font-semibold px-6 py-2.5 rounded-md hover:bg-ink/90 transition-colors duration-150 text-body-sm"
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
    <section className="py-14 bg-surface-soft" aria-labelledby={`faq-${doc.slug}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-16 max-w-2xl">
        <h2
          id={`faq-${doc.slug}`}
          className="text-ink mb-8 text-center"
          style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {doc.faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-md overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-body-sm font-medium text-ink text-left gap-3"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <ChevronIcon open={open === i} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-body-sm text-body-text leading-relaxed border-t border-hairline pt-3">
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

// ── Main exported component ──────────────────────────────────────────────────
export function DocumentDetail({ doc }: { doc: LegalDocument }) {
  return (
    <>
      <DocHero doc={doc} />
      <DocDefinition doc={doc} />
      <DocKeyPoints doc={doc} />
      <DocSteps doc={doc} />
      <DocFaq doc={doc} />
    </>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────
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
