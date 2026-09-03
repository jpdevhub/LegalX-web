import type { Metadata } from 'next'
import { KnowledgeFeed } from '@/components/sections/knowledge/KnowledgeFeed'
import { apiGetShorts, apiGetShortCategories, type LegalShort } from '@/lib/api'

/**
 * Incremental Static Regeneration.
 *
 * The server render is a fast first paint that also keeps the Render free-tier
 * backend out of the critical path — a cold start would otherwise add ~50s to a
 * first visit. The feed component re-fetches on mount, so a card published
 * since the last regeneration still appears immediately; this window only
 * affects what shows for the first few hundred milliseconds.
 */
export const revalidate = 60

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
    initial = await apiGetShorts({ limit: 20 })
  } catch {
    // Feed renders its empty state.
  }
  try {
    categories = await apiGetShortCategories()
  } catch {
    // Chips are optional chrome.
  }

  // The archive link and the not-advice notice live on the feed's final slide
  // rather than below it: the feed fills the viewport one card at a time, so
  // anything appended here would sit in dead space nobody scrolls to.
  return (
    <KnowledgeFeed
      initialShorts={initial.shorts}
      initialCursor={initial.nextCursor}
      initialHasMore={initial.hasMore}
      categories={categories}
    />
  )
}
