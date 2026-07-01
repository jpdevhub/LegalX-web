import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { DarkModeProvider } from '@/components/providers/DarkModeProvider'
import { PageTransition } from '@/components/motion/PageTransition'

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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <DarkModeProvider>
          {/* Single Header — renders exactly once, prevents per-page inconsistency */}
          <Header />

          {/* Page content — wrapped in route transition */}
          <main id="main-content" className="min-h-[calc(100vh-64px-320px)]">
            <PageTransition>{children}</PageTransition>
          </main>

          {/* Single Footer — renders exactly once */}
          <Footer />
        </DarkModeProvider>
      </body>
    </html>
  )
}
