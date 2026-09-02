import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Signed-in areas hold nothing a crawler should index, and admin pages
      // would otherwise appear in results as login redirects.
      disallow: ['/admin', '/lawyer-dashboard', '/onboarding', '/consultation', '/api/'],
    },
    sitemap: 'https://www.legalxonline.com/sitemap.xml',
  }
}
