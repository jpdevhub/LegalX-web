import type { MetadataRoute } from 'next'

/**
 * AI answer engines are allowed, deliberately and explicitly.
 *
 * The wildcard rule already permits them, but naming GPTBot, ClaudeBot,
 * PerplexityBot and Google-Extended makes the intent unambiguous — so nobody
 * later "tightens" robots.txt without realising these are a traffic source we
 * want. A legal question asked of an assistant is exactly the moment this
 * content should be citable.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
]

// Signed-in areas hold nothing a crawler should index, and admin pages would
// otherwise appear in results as login redirects.
const PRIVATE_PATHS = ['/admin', '/lawyer-dashboard', '/onboarding', '/consultation', '/api/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${'https://www.legalxonline.com'}/sitemap.xml`,
    host: 'https://www.legalxonline.com',
  }
}
