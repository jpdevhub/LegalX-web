import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DarkModeProvider } from '@/components/providers/DarkModeProvider'
import { CsrfProvider } from '@/components/providers/CsrfProvider'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

/**
 * Status-bar colour in the installed PWA.
 *
 * Declared explicitly and per colour-scheme. Without a theme-color meta tag
 * Android falls back to whatever manifest it cached at install time, which is
 * why the bar was showing gold long after the manifest said otherwise. These
 * values match the page background, so the bar reads as part of the OS rather
 * than as branding painted over it.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0D14' },
  ],
  width: 'device-width',
  initialScale: 1,
  // Let the page paint behind the status bar rather than under a coloured band.
  viewportFit: 'cover',
}

/**
 * Site metadata.
 *
 * metadataBase pointed at legalx.in — a domain this site is not served from —
 * so every canonical, Open Graph and Twitter URL Next generated resolved to the
 * wrong host. Search engines had nothing authoritative tying the pages to
 * legalxonline.com, which is why the indexed result carried a stale
 * description rather than this one.
 */
const SITE_URL = 'https://www.legalxonline.com'

export const metadata: Metadata = {
  title: {
    default: 'LegalXOnline — Talk to a Verified Lawyer Online in India',
    template: '%s | LegalXOnline',
  },
  description:
    'Consult verified Indian advocates by chat, voice or video — billed per minute. Draft legal documents, send notices, and follow daily legal updates in the Knowledge Center.',
  keywords: ['talk to a lawyer', 'online legal consultation', 'legal documents India', 'legal notice', 'rent agreement', 'advocate consultation', 'LegalXOnline'],
  authors: [{ name: 'LegalXOnline' }],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'LegalXOnline',
    title: 'LegalXOnline — Talk to a Verified Lawyer Online in India',
    description:
      'Consult verified Indian advocates by chat, voice or video, billed per minute. Legal documents, notices and daily legal updates.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LegalXOnline — Talk to a Verified Lawyer Online in India',
    description: 'Consult verified Indian advocates by chat, voice or video — billed per minute.',
  },
  // Explicit rather than inherited: the previous indexed snippet came from a
  // parked page, so the crawler needs unambiguous permission for this one.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // No explicit icons entry: app/icon.tsx and app/apple-icon.tsx are picked up
  // automatically. The previous '/favicon.ico' pointed at the create-next-app
  // default — the Vercel triangle — which is what browsers and Google were
  // showing as this site's mark.
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/*
          THEME INIT — runs synchronously before any paint, so there is no white
          flash before React mounts. The app is dark-surfaced only: this used to
          read a stored preference, which meant a visitor who had once chosen
          light got a header and a handful of sections in light over pages that
          are painted dark regardless.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('dark');`,
          }}
        />
        {/*
          DARK READER CLEANUP — removes extension-injected attrs before React hydrates
          so there are no server/client HTML mismatches.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var els=document.querySelectorAll('[data-darkreader-inline-stroke],[data-darkreader-inline-fill],[data-darkreader-inline-color]');for(var i=0;i<els.length;i++){els[i].removeAttribute('data-darkreader-inline-stroke');els[i].removeAttribute('data-darkreader-inline-fill');els[i].removeAttribute('data-darkreader-inline-color');els[i].style.removeProperty('--darkreader-inline-stroke');els[i].style.removeProperty('--darkreader-inline-fill');els[i].style.removeProperty('--darkreader-inline-color');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {/*
          Organization identity for search engines. Without it the crawler had
          to infer who this site belongs to, and was still carrying details
          from the domain's parked page.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'LegalXOnline',
              url: SITE_URL,
              logo: `${SITE_URL}/icon.svg`,
              description:
                'Consult verified Indian advocates by chat, voice or video, billed per minute. Legal documents, notices and daily legal updates.',
              email: 'contact@legalxonline.com',
              areaServed: 'IN',
              sameAs: ['https://youtube.com/@legalxonline'],
            }),
          }}
        />
        <CsrfProvider>
          <DarkModeProvider>
            {children}
            {/* Sitewide, so support is one tap away from any page. */}
            <WhatsAppButton />
          </DarkModeProvider>
        </CsrfProvider>
      </body>
    </html>
  )
}
