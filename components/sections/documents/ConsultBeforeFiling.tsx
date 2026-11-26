'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiCountOnlineLawyers } from '@/lib/api'

/**
 * Talk to an advocate before you file.
 *
 * A filing is not a form. The wrong entity type on a GST registration, the
 * wrong class on a trademark, a notice that misses a limitation period — each
 * is cheap to get right beforehand and expensive to undo afterwards, and
 * somebody filling in a questionnaire has no way to know which applies to
 * them.
 *
 * The count is live, so this offers a conversation that can actually be had
 * rather than a button that rings an empty room. With nobody online it still
 * shows, because the point is the advice, not the availability.
 */
export function ConsultBeforeFiling({
  serviceTitle,
  variant = 'section',
}: {
  serviceTitle: string
  /** `section` for the service page, `inline` inside the request flow. */
  variant?: 'section' | 'inline'
}) {
  const [online, setOnline] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const n = await apiCountOnlineLawyers()
      if (!cancelled) setOnline(n)
    })()
    return () => { cancelled = true }
  }, [])

  const availability =
    online === null ? null
    : online > 0 ? `${online} advocate${online === 1 ? '' : 's'} available now`
    : 'Request a callback — no one is online this minute'

  const body = (
    <>
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 w-9 h-9 rounded-full bg-primary/12 border border-primary/25 flex items-center justify-center flex-none"
          aria-hidden="true"
        >
          <svg className="w-4.5 h-4.5 text-primary" width="18" height="18" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 10h8M8 14h5M21 12a9 9 0 11-3.6-7.2L21 3v6h-6" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="text-ink dark:text-white font-semibold text-[17px] leading-snug">
            Consult a lawyer before you file
          </h3>
          <p className="text-body-sm text-body-text dark:text-slate-400 mt-1.5 leading-relaxed max-w-prose">
            {serviceTitle} has choices that are hard to reverse once submitted — the
            entity type, the category you register under, the dates you declare. A
            few minutes with an advocate first is cheaper than an amendment later.
          </p>
          {availability && (
            <p className="text-[12px] mt-2 flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${online && online > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                aria-hidden="true"
              />
              <span className={online && online > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted'}>
                {availability}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 mt-4 sm:mt-0 sm:flex-none">
        <Link
          href="/talk-to-lawyer"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-white font-semibold text-body-sm whitespace-nowrap hover:bg-primary-hover transition-colors"
        >
          Talk to an advocate
        </Link>
      </div>
    </>
  )

  if (variant === 'inline') {
    return (
      <div className="rounded-xl border border-primary/25 bg-primary/[0.04] dark:bg-primary/[0.07] p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {body}
      </div>
    )
  }

  return (
    <section className="py-12 bg-surface-soft dark:bg-[#111]" aria-labelledby="consult-first">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <div
          id="consult-first"
          className="rounded-2xl border border-primary/25 bg-white dark:bg-white/[0.03] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
        >
          {body}
        </div>
      </div>
    </section>
  )
}
