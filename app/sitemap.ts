import type { MetadataRoute } from 'next'
import { apiGetShortsArchive, apiGetKnowledgeSlugs } from '@/lib/api'
import { isGone } from '@/lib/gonePaths'

const SITE = 'https://www.legalxonline.com'

/**
 * Regenerated hourly, and on every deploy.
 *
 * The Knowledge Centre is the discovery funnel, so both content sections need
 * to be in here. Judgments is deliberately absent: it holds nothing yet and is
 * marked noindex, and advertising an empty page is worse than not listing it.
 */
export const revalidate = 3600

/**
 * Retry the content fetches before giving up.
 *
 * The frontend and the backend deploy independently, and the backend is on a
 * free tier that cold-starts. A Vercel build can therefore run while Render is
 * still rolling out, and a single failed fetch here produced a sitemap missing
 * every card URL — cached for the next hour, which is the whole point of the
 * file gone. Three attempts with a widening pause covers both a cold start and
 * a deploy that is a few seconds behind.
 */
async function withRetry<T>(fn: () => Promise<T>, label: string, attempts = 3): Promise<T | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch {
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
      }
    }
  }
  console.warn(`[sitemap] ${label} unavailable after ${attempts} attempts — omitted`)
  return null
}

const STATIC_ROUTES: [string, MetadataRoute.Sitemap[number]['changeFrequency'], number][] = [
  ['',                                    'weekly',  1.0],
  ['/knowledge-center',                   'daily',   0.9],
  ['/knowledge-center/know-your-rights',  'weekly',  0.9],
  ['/knowledge-center/archive',           'daily',   0.6],
  ['/talk-to-lawyer',                     'weekly',  0.9],
  ['/documents',                          'weekly',  0.8],
  ['/about',                              'monthly', 0.5],
  ['/awards',                             'monthly', 0.4],
  ['/privacy',                            'yearly',  0.3],
  ['/terms',                              'yearly',  0.3],
  ['/compliance',                         'yearly',  0.3],
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(([path, changeFrequency, priority]) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  // Daily legal updates. A backend hiccup must not break the sitemap — the
  // static routes still get served.
  //
  // Paged, because the archive endpoint caps a single request at 50 rows. A
  // lone page-1 fetch silently dropped every card past the fiftieth once the
  // feed outgrew that, which is invisible from the file itself — the sitemap
  // still looked healthy and simply stopped advertising the newest content.
  const MAX_FEED_PAGES = 40 // 2,000 URLs; a guard against an unbounded loop
  for (let page = 1; page <= MAX_FEED_PAGES; page++) {
    const archive = await withRetry(
      () => apiGetShortsArchive({ limit: 50, page }),
      `legal updates (page ${page})`
    )
    if (!archive) break

    for (const s of archive.shorts ?? []) {
      if (!s.slug) continue
      // A withdrawn card can still be published in the database until the
      // data-side unpublish runs. Submitting a URL the proxy then answers with
      // 410 reads to Search Console as a broken site rather than a deliberate
      // removal, so the sitemap drops it here regardless.
      if (isGone(`/knowledge-center/${s.slug}`)) continue
      entries.push({
        url: `${SITE}/knowledge-center/${s.slug}`,
        lastModified: s.published_at ? new Date(s.published_at) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }

    if (page * 50 >= (archive.total ?? 0)) break
  }

  // Know Your Rights. Only published cards are returned by the endpoint, so an
  // unreviewed explainer can never be advertised to a crawler. lastmod is the
  // review date: a re-review is a real change to a legal page even when the
  // wording is untouched.
  const cards = await withRetry(() => apiGetKnowledgeSlugs(), 'rights explainers')
  for (const c of cards ?? []) {
    const stamp = c.last_reviewed_at ?? c.published_at
    entries.push({
      url: `${SITE}/knowledge-center/know-your-rights/${c.slug}`,
      lastModified: stamp ? new Date(stamp) : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  return entries
}
