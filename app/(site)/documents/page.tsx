import type { Metadata } from 'next'
import Link from 'next/link'
import { DOCUMENTS } from '@/lib/documents'
import { FadeUp, StaggerParent, FadeUpChild } from '@/components/motion/MotionWrappers'

export const metadata: Metadata = {
  title: 'Legal Services',
  description:
    'GST Registration, Trademark, Udyam, DPIIT Recognition, Legal Notice, Rent Agreement, Affidavit — handled online by qualified professionals.',
}

export default function DocumentsPage() {
  return (
    <main>
      {/* Page header */}
      <section className="pt-16 pb-10 bg-white border-b border-hairline dark:bg-surface-dark dark:border-hairline-dark">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <FadeUp>
            <span className="text-label-caps text-muted uppercase tracking-widest">Our Services</span>
            <h1
              className="text-ink dark:text-white mt-2 max-w-2xl"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}
            >
              Business registration &amp; legal services — simplified
            </h1>
            <p className="text-body-md text-body-text dark:text-slate-400 mt-4 max-w-xl leading-relaxed">
              Apply online in minutes. Our legal experts handle the paperwork, government filings, and follow-ups — so you can focus on your business.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Service grid */}
      <section className="py-14 bg-surface-soft dark:bg-surface-soft-dark" aria-label="Available services">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {DOCUMENTS.map((doc) => (
              <FadeUpChild key={doc.slug}>
                <Link
                  href={`/documents/${doc.slug}`}
                  className="group flex flex-col h-full bg-white dark:bg-surface-dark border border-hairline dark:border-hairline-dark rounded-md p-6 hover:border-primary/40 transition-colors duration-150"
                  aria-label={`${doc.title} — ${doc.price}`}
                >
                  {/* Tag + price row */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wide">
                      {doc.tag}
                    </span>
                    <span className="text-body-sm font-bold text-primary">{doc.price}</span>
                  </div>

                  <h2 className="text-body-md font-semibold text-ink dark:text-white mb-2 group-hover:text-primary transition-colors duration-150">
                    {doc.title}
                  </h2>
                  <p className="text-body-sm text-body-text dark:text-slate-400 leading-snug mb-5 flex-1">{doc.shortDesc}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-hairline dark:border-hairline-dark mt-auto">
                    <span className="text-[11px] text-muted">{doc.duration}</span>
                    <span className="flex items-center gap-1 text-body-sm font-semibold text-primary">
                      {doc.tagline}
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </FadeUpChild>
            ))}
          </StaggerParent>

          {/* Trust note */}
          <FadeUp delay={0.2}>
            <p className="text-center text-body-sm text-muted mt-10">
              All applications are handled by qualified professionals. Government fees are additional and shown separately, upfront.
            </p>
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
