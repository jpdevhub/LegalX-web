import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingTable } from '@/components/ui/PricingTable'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Legal Documents',
  description:
    'Browse professionally drafted legal document templates — NDAs, Rental Agreements, Trademark Registration, Company Registration, and more.',
}

const DOCUMENT_TYPES = [
  {
    id: 'nda',
    label: 'Non-Disclosure Agreement',
    shortLabel: 'NDA',
    desc: 'Protect confidential information shared between parties in business relationships.',
    price: '₹1,999',
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'rental',
    label: 'Rental Agreement',
    shortLabel: 'Rental',
    desc: 'Legally binding lease agreements for residential or commercial property.',
    price: '₹1,499',
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'poa',
    label: 'Power of Attorney',
    shortLabel: 'POA',
    desc: 'Authorize someone to act on your behalf for legal or financial matters.',
    price: '₹2,499',
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'will',
    label: 'Will & Testament',
    shortLabel: 'Will',
    desc: 'Ensure your assets are distributed according to your final wishes.',
    price: '₹3,999',
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'partnership',
    label: 'Partnership Deed',
    shortLabel: 'Partnership',
    desc: 'Define terms, profit sharing, and responsibilities in a business partnership.',
    price: '₹4,999',
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'employment',
    label: 'Employment Contract',
    shortLabel: 'Employment',
    desc: 'Formalize the relationship between employer and employee with clear terms.',
    price: '₹1,999',
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
        <line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'affidavit',
    label: 'Affidavit',
    shortLabel: 'Affidavit',
    desc: 'A sworn written statement of fact for use in legal proceedings.',
    price: '₹999',
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
        <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
        <polyline points="10,9 9,9 8,9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'sale-deed',
    label: 'Sale Deed',
    shortLabel: 'Sale Deed',
    desc: 'Transfer ownership of property from seller to buyer with full legal protection.',
    price: '₹5,999',
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function LegalDocumentsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-soft dark:bg-surface-soft-dark py-16 md:py-20 border-b border-hairline dark:border-hairline-dark">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <span className="text-label-caps text-primary uppercase tracking-widest">Documents</span>
          <h1
            className="text-ink dark:text-white text-balance mt-3"
            style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}
          >
            Legal Documents, Delivered Fast.
          </h1>
          <p className="text-body-md text-body-text dark:text-slate-400 max-w-2xl mt-4 leading-relaxed">
            Browse our full catalog of professionally drafted legal documents. Select any document to begin your request — we'll have it ready within 24 hours.
          </p>
        </div>
      </section>

      {/* Document grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-surface-dark">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            style={{ gridAutoRows: '1fr' }}
          >
            {DOCUMENT_TYPES.map((doc) => (
              <Link
                key={doc.id}
                href={`/request?doc=${doc.id}`}
                className="group flex flex-col gap-4 p-6 rounded-md border border-hairline dark:border-hairline-dark bg-white dark:bg-surface-dark h-full min-h-[180px] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={`Request ${doc.label} — starting at ${doc.price}`}
              >
                <div className="w-11 h-11 rounded-sm bg-primary/8 flex items-center justify-center flex-shrink-0">
                  {doc.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-display-md text-ink dark:text-white">{doc.label}</h2>
                  <p className="text-body-sm text-body-text dark:text-slate-400 mt-1.5 leading-snug line-clamp-2">
                    {doc.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-body-sm font-semibold text-primary">
                    From {doc.price}
                  </span>
                  <span className="text-label-caps text-primary group-hover:translate-x-0.5 transition-transform duration-150">
                    Request →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing table */}
      <section className="py-16 md:py-24 bg-surface-soft dark:bg-surface-soft-dark border-t border-hairline dark:border-hairline-dark">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="max-w-3xl">
            <PricingTable title="Transparent Pricing" showViewAll={false} />
          </div>
        </div>
      </section>
    </>
  )
}
