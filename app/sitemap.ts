import type { MetadataRoute } from 'next'
import { apiGetShortsArchive } from '@/lib/api'

const SITE = 'https://www.legalxonline.com'

// Regenerated hourly. The Knowledge Centre is the discovery funnel, so its
// cards need to be in here — the site had no sitemap at all, which meant none
// of them were being indexed.
export const revalidate = 3600

const STATIC_ROUTES: [string, MetadataRoute.Sitemap[number]['changeFrequency'], number][] = [
  ['',                          'weekly',  1.0],
  ['/knowledge-center',         'daily',   0.9],
  ['/knowledge-center/archive', 'daily',   0.6],
  ['/talk-to-lawyer',           'weekly',  0.9],
  ['/documents',                'weekly',  0.8],
  ['/about',                    'monthly', 0.5],
  ['/awards',                   'monthly', 0.4],
  ['/privacy',                  'yearly',  0.3],
  ['/terms',                    'yearly',  0.3],
  ['/compliance',               'yearly',  0.3],
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(([path, changeFrequency, priority]) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  // Every published card gets its own entry. A backend hiccup must not break
  // the sitemap — the static routes still get served.
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
  } catch {
    // Static routes only.
  }

  return entries
}
