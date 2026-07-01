import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PricingRow {
  service: string
  price: string
  asterisk?: boolean
}

interface PricingTableProps {
  title?: string
  showViewAll?: boolean
  className?: string
}

const pricingData: PricingRow[] = [
  { service: 'GST Registration', price: '₹999' },
  { service: 'GST Filing', price: '₹499/month' },
  { service: 'ITR Filing', price: '₹499' },
  { service: 'FSSAI Registration', price: '₹999' },
  { service: 'Trademark Registration', price: '₹2,999', asterisk: true },
  { service: 'Company Registration', price: '₹6,999', asterisk: true },
]

export function PricingTable({
  title = 'Transparent Pricing',
  showViewAll = true,
  className,
}: PricingTableProps) {
  return (
    <div className={cn('w-full', className)}>
      {title && (
        <div className="mb-6">
          <span className="text-label-caps text-primary uppercase tracking-widest">
            Pricing
          </span>
          <h2 className="text-display-xl text-ink dark:text-white mt-1 text-balance">
            {title}
          </h2>
        </div>
      )}

      <div className="rounded-md border border-hairline dark:border-hairline-dark overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-2 bg-surface-soft dark:bg-surface-soft-dark px-6 py-3 border-b border-hairline dark:border-hairline-dark">
          <span className="text-label-caps text-muted uppercase tracking-widest">Service</span>
          <span className="text-label-caps text-muted uppercase tracking-widest text-right">
            Starting Price
          </span>
        </div>

        {/* Table rows */}
        {pricingData.map((row, i) => (
          <div
            key={row.service}
            className={cn(
              'grid grid-cols-2 px-6 py-4 items-center',
              'transition-colors duration-150 hover:bg-surface-soft dark:hover:bg-surface-soft-dark',
              i < pricingData.length - 1 &&
                'border-b border-hairline dark:border-hairline-dark'
            )}
          >
            <span className="text-body-md text-body-text dark:text-slate-300">
              {row.service}
              {row.asterisk && (
                <span className="text-primary ml-0.5">*</span>
              )}
            </span>
            <span className="text-display-md text-primary font-semibold text-right">
              {row.price}
            </span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-body-sm text-muted mt-3">
        *Government fees additional, subject to state.
      </p>

      {showViewAll && (
        <div className="mt-5">
          <Link
            href="/legal-documents"
            className="inline-flex items-center gap-1.5 text-primary font-semibold text-body-sm hover:underline group"
          >
            View All Services
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform duration-150 group-hover:translate-x-0.5"
            >
              <path
                d="M3 8H13M9 4L13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}
