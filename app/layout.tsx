import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DarkModeProvider } from '@/components/providers/DarkModeProvider'
import { CsrfProvider } from '@/components/providers/CsrfProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'LegalX — Legal Services Simplified',
    template: '%s | LegalX',
  },
  description:
    "India's trusted legal tech platform. From document generation to expert counsel — professional legal protection for individuals and businesses.",
  keywords: ['legal services', 'legal documents', 'NDA', 'trademark registration', 'company registration', 'legal consultation', 'India'],
  authors: [{ name: 'LegalX Technologies Pvt. Ltd.' }],
  metadataBase: new URL('https://legalx.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://legalx.in',
    siteName: 'LegalX',
    title: 'LegalX — Legal Services Simplified',
    description:
      'Navigate the complexities of law with precision. Instant document generation, expert attorneys, and business law — all in one platform.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LegalX — Legal Services Simplified',
    description: "India's trusted legal tech platform.",
  },
  icons: {
    icon: '/favicon.ico',
  },
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
          THEME INIT — runs synchronously before any paint.
          Reads localStorage and applies dark class to <html> immediately,
          eliminating the white flash (FOUC) when dark mode is active.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('legalx-theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
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
        <CsrfProvider>
          <DarkModeProvider>
            {children}
          </DarkModeProvider>
        </CsrfProvider>
      </body>
    </html>
  )
}
