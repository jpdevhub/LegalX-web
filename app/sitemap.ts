import type { MetadataRoute } from 'next'
import { apiGetShortsArchive, apiGetKnowledgeSlugs } from '@/lib/api'

const SITE = 'https://www.legalxonline.com'

/**
 * Regenerated hourly, and on every deploy.
 *
 * The Knowledge Centre is the discovery funnel, so both content sections need
 * to be in here. Judgments is deliberately absent: it holds nothing yet and is
 * marked noindex, and advertising an empty page is worse than not listing it.
 */
export const revalidate = 3600

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
  try {
    const { shorts } = await apiGetShortsArchive({ limit: 50, page: 1 })
    for (const s of shorts) {
      if (!s.slug) continue
      entries.push({
        url: `${SITE}/knowledge-center/${s.slug}`,
        lastModified: s.published_at ? new Date(s.published_at) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch { /* static routes only */ }

  // Know Your Rights. Only published cards are returned by the endpoint, so an
  // unreviewed explainer can never be advertised to a crawler. lastmod is the
  // review date: a re-review is a real change to a legal page even when the
  // wording is untouched.
  try {
    const cards = await apiGetKnowledgeSlugs()
    for (const c of cards) {
      const stamp = c.last_reviewed_at ?? c.published_at
      entries.push({
        url: `${SITE}/knowledge-center/know-your-rights/${c.slug}`,
        lastModified: stamp ? new Date(stamp) : now,
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    }
  } catch { /* section page is still listed above */ }

  return entries
}
