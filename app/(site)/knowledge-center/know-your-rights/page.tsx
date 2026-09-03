import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionNav } from '@/components/sections/knowledge/SectionNav'
import { RightsList } from '@/components/sections/knowledge/RightsList'
import { apiGetKnowledge, apiGetKnowledgeCategories, type KnowledgeCard } from '@/lib/api'
import { LEGAL_DISCLAIMER } from '@/lib/knowledge'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Know Your Rights — Plain-Language Legal Answers',
  description:
    'Straight answers to common questions about Indian law — criminal procedure, cheque bounce, traffic offences, dowry, consumer rights and cyber crime. Each answer cites its section and source.',
  alternates: { canonical: '/knowledge-center/know-your-rights' },
  openGraph: {
    type: 'website',
    title: 'Know Your Rights | LegalXOnline',
    description: 'Plain-language answers to common questions about Indian law, each citing its section and source.',
    url: '/knowledge-center/know-your-rights',
  },
}

export default async function KnowYourRightsPage() {
  // A backend hiccup degrades to an empty list, never a 500. The list
  // re-fetches on mount, so anything published since the last regeneration
  // still appears.
  let initial: { cards: KnowledgeCard[]; total: number; hasMore: boolean } = {
    cards: [], total: 0, hasMore: false,
  }
  let categories: { name: string; count: number }[] = []

  try {
    const res = await apiGetKnowledge({ limit: 24, page: 1 })
    initial = { cards: res.cards, total: res.total, hasMore: res.hasMore }
  } catch { /* empty state */ }

  try {
    categories = await apiGetKnowledgeCategories()
  } catch { /* chips are optional chrome */ }

  return (
    <div className="bg-[#0A0D14] min-h-screen">
      <SectionNav active="know-your-rights" />

      <header className="max-w-[900px] mx-auto px-4 sm:px-6 pt-8 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Know Your Rights
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
          Direct answers to questions people actually ask about Indian law. Every answer names
          the section it comes from and links to the source it was drawn from.
        </p>
      </header>

      <RightsList
        initialCards={initial.cards}
        initialTotal={initial.total}
        initialHasMore={initial.hasMore}
        categories={categories}
      />

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-sm bg-white/[0.02] border border-white/8 p-4">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-400">Not legal advice. </span>
            {LEGAL_DISCLAIMER}{' '}
            <Link href="/talk-to-lawyer" className="text-slate-400 hover:text-[#D4AF37] underline">
              Speak to a lawyer
            </Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
