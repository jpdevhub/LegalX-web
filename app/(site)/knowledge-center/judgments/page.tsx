import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionNav } from '@/components/sections/knowledge/SectionNav'

export const metadata: Metadata = {
  title: 'Judgments — Court Decisions Explained',
  description:
    'Plain-language summaries of Indian court judgments, each linked to the full text. This section is being prepared.',
  alternates: { canonical: '/knowledge-center/judgments' },
  // Nothing to index yet. Left out of the sitemap and marked noindex until it
  // holds content — an empty page in the index is a weak result against the
  // domain, and it can be flipped on the day the first judgment lands.
  robots: { index: false, follow: true },
}

export default function JudgmentsPage() {
  return (
    <div className="bg-[#0A0D14] min-h-screen">
      <SectionNav active="judgments" />

      <div className="max-w-[720px] mx-auto px-5 sm:px-6 py-20 text-center">
        <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden suppressHydrationWarning>
            <path d="M12 3v18M5 7l-3 7h6zM19 7l-3 7h6zM7 21h10M4 7h16" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Judgments
        </h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          Court decisions, explained in plain language and linked to the full text. We are
          building this section now — every judgment will carry its citation, the court, and a
          link to the original record.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/knowledge-center/know-your-rights"
            className="px-5 h-10 inline-flex items-center rounded-sm bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] text-sm font-bold transition-colors"
          >
            Read Know Your Rights
          </Link>
          <Link
            href="/knowledge-center"
            className="px-5 h-10 inline-flex items-center rounded-sm border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors"
          >
            Today&rsquo;s legal updates
          </Link>
        </div>
      </div>
    </div>
  )
}
