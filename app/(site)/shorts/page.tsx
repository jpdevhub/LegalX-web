import type { Metadata } from 'next'
import { ShortsFeed } from '@/components/sections/shorts/ShortsFeed'
import { apiGetShorts, apiGetShortCategories, type LegalShort } from '@/lib/api'

/**
 * Incremental Static Regeneration.
 *
 * The feed is public, read-only content that changes a handful of times a day,
 * so it is rendered once and served from the edge. This also keeps the Render
 * free-tier backend out of the reader's path — a cold start would otherwise add
 * ~50s to a first visit.
 */
export const revalidate = 900 // 15 minutes

export const metadata: Metadata = {
  title: 'Legal Shorts — Daily Court Updates | LegalXOnline',
  description:
    'Bite-sized summaries of the latest Indian court judgments, updated daily. Sourced from official court records and reviewed by our legal team.',
  openGraph: {
    title: 'Legal Shorts — Daily Indian Court Updates',
    description: 'Two-minute summaries of the judgments that matter, every morning.',
    type: 'website',
  },
}

export default async function ShortsPage() {
  // Fetched at build/revalidate time, not per request. A backend hiccup must
  // degrade to an empty feed rather than a 500 page.
  let initial: { shorts: LegalShort[]; hasMore: boolean; nextCursor: string | null } = {
    shorts: [], hasMore: false, nextCursor: null,
  }
  let categories: { name: string; count: number }[] = []

  try {
    initial = await apiGetShorts({ limit: 10 })
  } catch {
    // Feed renders its empty state.
  }
  try {
    categories = await apiGetShortCategories()
  } catch {
    // Chips are optional chrome.
  }

  return (
    <div className="bg-[#0A0D14]">
      <ShortsFeed
        initialShorts={initial.shorts}
        initialCursor={initial.nextCursor}
        initialHasMore={initial.hasMore}
        categories={categories}
      />

      {/* Not-advice notice. This is a legal-services brand publishing summaries
          of case law — the boundary needs to be stated on the page itself, not
          buried in the terms. */}
      <p className="px-5 py-3 text-center text-[11px] text-slate-600 border-t border-white/8">
        Summaries are drawn from official court records and reviewed before publication.
        They are general information, not legal advice.{' '}
        <a href="/talk-to-lawyer" className="text-slate-500 hover:text-[#D4AF37] underline">
          Speak to a lawyer
        </a>{' '}
        about your situation.
      </p>
    </div>
  )
}
