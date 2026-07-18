import type { Metadata } from 'next'
import Link from 'next/link'
import { DOCUMENTS } from '@/lib/documents'

export const metadata: Metadata = {
  title: 'Legal Services — LegalX',
  description:
    'Register your business, protect your brand, and stay compliant. GST Registration, FSSAI Food License, and Trademark Registration — handled online.',
}

const SERVICE_ICONS: Record<string, string> = {
  'gst-registration': '🏛',
  'fssai-registration': '🍽',
  'trademark-registration': '™',
}

export default function DocumentsPage() {
  return (
    <main>
      {/* Page header */}
      <section className="pt-16 pb-10 bg-white border-b border-hairline dark:bg-surface-dark dark:border-hairline-dark">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <span className="text-label-caps text-primary uppercase tracking-widest">Our Services</span>
          <h1
            className="text-ink dark:text-white mt-2 max-w-2xl"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}
          >
            Business registration &amp; compliance — simplified
          </h1>
          <p className="text-body-md text-body-text dark:text-slate-400 mt-4 max-w-xl leading-relaxed">
            Apply online in minutes. Our legal experts handle the paperwork, government filings, and follow-ups — so you can focus on your business.
          </p>
        </div>
      </section>

      {/* Service grid */}
      <section className="py-14 bg-surface-soft dark:bg-surface-soft-dark" aria-label="Available services">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOCUMENTS.map((doc) => (
              <Link
                key={doc.slug}
                href={`/documents/${doc.slug}`}
                className="group bg-white dark:bg-surface-dark rounded-lg p-7 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover"
                aria-label={`${doc.title} — ${doc.price}`}
              >
                {/* Duration badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[12px] font-semibold text-muted bg-surface-soft dark:bg-surface-soft-dark px-2.5 py-1 rounded-full">
                    {doc.duration}
                  </span>
                  <span className="text-body-sm font-bold text-primary">{doc.price}</span>
                </div>

                <h2 className="text-display-md text-ink dark:text-white mb-2 group-hover:text-primary transition-colors duration-150">
                  {doc.title}
                </h2>
                <p className="text-body-sm text-body-text dark:text-slate-400 leading-snug mb-6">{doc.shortDesc}</p>

                <div className="flex items-center gap-1 text-body-sm font-semibold text-primary group-hover:translate-x-0.5 transition-transform duration-150">
                  Apply online
                  <span aria-hidden="true" className="ml-1">→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Trust note */}
          <p className="text-center text-body-sm text-muted mt-10">
            All applications are handled by qualified professionals. Government fees are additional and vary by state.
          </p>
        </div>
      </section>
    </main>
  )
}
