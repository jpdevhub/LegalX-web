import type { Metadata } from 'next'
import Link from 'next/link'
import { KnowledgeFeed } from '@/components/sections/knowledge/KnowledgeFeed'
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
  title: 'Knowledge Center — Daily Legal Updates | LegalXOnline',
  description:
    'Bite-sized summaries of Indian legal and government updates, curated daily. Every card is grounded in an official source and reviewed by our team before publication.',
  openGraph: {
    title: 'LegalX Knowledge Center',
    description: 'Two-minute summaries of the legal updates that matter, every morning.',
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
      <KnowledgeFeed
        initialShorts={initial.shorts}
        initialCursor={initial.nextCursor}
        initialHasMore={initial.hasMore}
        categories={categories}
      />

      {/* Not-advice notice. This is a legal-services brand publishing summaries
          of case law — the boundary needs to be stated on the page itself, not
          buried in the terms. */}
      <div className="px-5 py-3 border-t border-white/8 text-center">
        <Link href="/knowledge-center/archive" className="text-xs font-semibold text-[#D4AF37] hover:text-white transition-colors">
          Browse the full archive →
        </Link>
        <p className="mt-2 text-[11px] text-slate-600">
          Summaries are drawn from official sources and reviewed before publication.
          They are general information, not legal advice.{' '}
          <Link href="/talk-to-lawyer" className="text-slate-500 hover:text-[#D4AF37] underline">
            Speak to a lawyer
          </Link>{' '}
          about your situation.
        </p>
      </div>
    </div>
  )
}
