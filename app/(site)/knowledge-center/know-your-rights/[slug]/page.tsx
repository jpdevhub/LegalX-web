import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SectionNav } from '@/components/sections/knowledge/SectionNav'
import { apiGetKnowledgeCard, apiGetKnowledgeSlugs } from '@/lib/api'
import {
  rightsLabelFor,
  rightsToneFor,
  rightsCtaFor,
  displayReviewer,
  requiresIKanoonAttribution,
  metaDescriptionFrom,
  statuteLabelFrom,
  cardTitleTag,
  plainText,
  jsonLd,
  formatDate,
  LEGAL_DISCLAIMER,
} from '@/lib/knowledge'

const SITE = 'https://www.legalxonline.com'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const cards = await apiGetKnowledgeSlugs()
    return cards.map(c => ({ slug: c.slug }))
  } catch {
    // Backend unreachable at build time — dynamicParams renders on demand.
    return []
  }
}

async function load(slug: string) {
  try {
    return await apiGetKnowledgeCard(slug)
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const data = await load(slug)
  if (!data) return { title: 'Not found' }

  const { card } = data
  // The direct answer is already written as a one-line response, so it is the
  // description — no separate summary needed, and none should be invented.
  const description = metaDescriptionFrom(card.direct_answer, card.title)

  // "BNS Section 304 — Can police arrest without a warrant?" rather than the
  // bare question. Section-number searches are where this content is findable
  // and where almost nobody is competing.
  const label = statuteLabelFrom(card.case_reference)
  if (!label) {
    // Fixed on the data side, not here — a half-parsed label is worse than
    // none. Surfaced in the build/server log with enough to act on.
    console.warn(
      `[rights] no statute label — id=${card.id} slug=${card.slug} case_reference=${JSON.stringify(card.case_reference ?? null)}`
    )
  }

  return {
    title: cardTitleTag(card.title, label),
    description,
    alternates: { canonical: `/knowledge-center/know-your-rights/${slug}` },
    openGraph: {
      type: 'article',
      title: card.title,
      description,
      url: `/knowledge-center/know-your-rights/${slug}`,
    },
    twitter: { card: 'summary', title: card.title, description },
  }
}

export default async function RightsCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await load(slug)
  if (!data) notFound()

  const { card, related } = data
  const tone = rightsToneFor(card.category)
  const cta = rightsCtaFor(card.cta_type)
  const reviewer = displayReviewer(card.reviewed_by)
  const showIKanoon = requiresIKanoonAttribution(card.source)
  const reviewedOn = card.last_reviewed_at ?? card.published_at
  const statuteLabel = statuteLabelFrom(card.case_reference)
  const canonical = `${SITE}/knowledge-center/know-your-rights/${card.slug}`

  /**
   * FAQPage markup.
   *
   * The question/answer pairing is exactly what this content is, and it is what
   * makes a card eligible for a featured snippet and for citation by AI answer
   * engines. reviewedBy is included when a real reviewer is recorded: legal
   * content is YMYL, and Google weighs who checked it.
   */
  const faqSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: card.title,
        acceptedAnswer: {
          '@type': 'Answer',
          // The short answer plus the detail. The pair is what an answer
          // engine quotes; the direct answer alone reads as a fragment when
          // lifted out of the page.
          text:
            plainText([card.direct_answer, card.explanation].filter(Boolean).join(' ')) ||
            card.title,
        },
      },
    ],
    inLanguage: 'en-IN',
    isPartOf: { '@type': 'WebSite', name: 'LegalXOnline', url: SITE },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE}/knowledge-center/know-your-rights/${card.slug}`,
    },
    publisher: { '@type': 'Organization', name: 'LegalXOnline', url: SITE },
  }
  if (reviewer) faqSchema.reviewedBy = { '@type': 'Person', name: reviewer }
  if (reviewedOn) faqSchema.dateModified = reviewedOn
  if (card.published_at) faqSchema.datePublished = card.published_at
  if (card.source_url) faqSchema.isBasedOn = card.source_url

  /**
   * Article markup, alongside the FAQPage above.
   *
   * Google restricted FAQ rich results in 2023 to a narrow set of sites, so
   * the visible enhancement may never appear. Article is what carries the
   * authorship, review date and citation that AI answer engines read when
   * deciding whether to attribute an answer to this page — which is the
   * actual goal here, not the snippet.
   */
  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: card.title,
    description: metaDescriptionFrom(card.direct_answer, card.title),
    author: { '@type': 'Organization', name: 'LegalXOnline', url: SITE },
    publisher: { '@type': 'Organization', name: 'LegalXOnline', url: SITE },
    inLanguage: 'en-IN',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  }
  if (card.published_at) articleSchema.datePublished = card.published_at
  if (reviewedOn) articleSchema.dateModified = reviewedOn
  // reviewedBy is deliberately NOT set here. schema.org defines it on WebPage,
  // not on Article, and validator.schema.org reports it as an unknown field on
  // an Article node. The reviewer is already published on the FAQPage node
  // above — FAQPage is a WebPage subtype, so it carries the property validly —
  // which means the review signal reaches a parser either way, without the
  // warning.
  if (card.case_reference) articleSchema.citation = card.case_reference
  if (card.source_url) articleSchema.isBasedOn = card.source_url
  // The statutory provision the card explains, named as its own entity so the
  // section number is machine-readable rather than only present in the title.
  if (statuteLabel) articleSchema.about = { '@type': 'Legislation', name: card.case_reference }
  if (card.explanation || card.direct_answer) {
    articleSchema.articleBody = plainText(
      [card.direct_answer, card.explanation].filter(Boolean).join(' ')
    )
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Knowledge Center', item: `${SITE}/knowledge-center` },
      { '@type': 'ListItem', position: 2, name: 'Know Your Rights', item: `${SITE}/knowledge-center/know-your-rights` },
      { '@type': 'ListItem', position: 3, name: card.title, item: `${SITE}/knowledge-center/know-your-rights/${card.slug}` },
    ],
  }

  return (
    <div className="bg-[#0A0D14] min-h-screen">
      <SectionNav active="know-your-rights" />

      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <article className="max-w-[720px] mx-auto px-5 sm:px-6 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/knowledge-center/know-your-rights"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden suppressHydrationWarning>
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Know Your Rights
          </Link>
        </nav>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className={`px-2.5 py-1 rounded-sm border text-[11px] font-bold uppercase tracking-wide ${tone.pill}`}>
            {rightsLabelFor(card.category)}
          </span>
          {card.case_reference && (
            <span className="px-2.5 py-1 rounded-sm bg-white/5 border border-white/10 text-[11px] text-slate-400">
              {card.case_reference}
            </span>
          )}
        </div>

        {/* The provision, as a kicker. The H1 stays the plain question —
            that is what a human reads — while this gives the page a visible
            match for "BNS Section 304" and the like. */}
        {statuteLabel && (
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#D4AF37] mb-2">
            {statuteLabel}
          </p>
        )}

        <h1 className="text-[26px] sm:text-[32px] font-bold text-white leading-[1.2] tracking-tight">
          {card.title}
        </h1>

        {/* The direct answer, given its own block. This is the part a reader
            came for and the part a snippet lifts. */}
        {card.direct_answer && (
          <div className="mt-5 rounded-sm bg-[#C9A227]/[0.07] border-l-[3px] border-[#C9A227] px-5 py-4">
            <p className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wide mb-1.5">
              Short answer
            </p>
            <p className="text-[16px] text-white leading-relaxed font-medium">
              {card.direct_answer}
            </p>
          </div>
        )}

        {card.explanation && (
          <div className="mt-6">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-2.5">
              In detail
            </h2>
            <p className="text-[15.5px] text-slate-300 leading-[1.75] whitespace-pre-wrap">
              {card.explanation}
            </p>
          </div>
        )}

        {/* Review record. Shown because legal content should say who checked it
            and when — and suppressed rather than faked when no reviewer is on
            record. */}
        <div className="mt-8 pt-5 border-t border-white/8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-slate-500">
          {reviewer ? (
            <span>
              Reviewed by <span className="text-slate-300 font-medium">{reviewer}</span>
              {reviewedOn && <> · {formatDate(reviewedOn)}</>}
            </span>
          ) : reviewedOn ? (
            <span>Last reviewed {formatDate(reviewedOn)}</span>
          ) : null}

          {card.source_url && (
            <a
              href={card.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-[#D4AF37] transition-colors"
            >
              View source
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" aria-hidden suppressHydrationWarning>
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}

          {/*
            Attribution required by indiankanoon.org's terms — not optional.
            Points at this card's own source document, falling back to the site
            root only when the card carries no source_url.
          */}
          {showIKanoon && (
            <a
              href={card.source_url ?? 'https://indiankanoon.org'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Powered by IKanoon
            </a>
          )}
        </div>

        <div className="mt-6">
          <Link
            href={cta.href}
            className="inline-flex items-center justify-center px-5 h-11 rounded-sm bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] text-sm font-bold transition-colors"
          >
            {cta.label}
          </Link>
        </div>

        {/* Related questions. suggested_questions are prompts with no target,
            so the related rail is what actually links pages together. */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">
              Related questions
            </h2>
            <ul className="space-y-2">
              {related.map(r => (
                <li key={r.slug}>
                  <Link
                    href={`/knowledge-center/know-your-rights/${r.slug}`}
                    className="group block rounded-sm bg-[#0E1220] border border-white/8 hover:border-[#C9A227]/40 px-4 py-3 transition-colors"
                  >
                    <p className="text-[14px] font-semibold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                      {r.title}
                    </p>
                    {r.direct_answer && (
                      <p className="mt-1 text-[12.5px] text-slate-500 line-clamp-1">{r.direct_answer}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {card.suggested_questions && card.suggested_questions.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">
              People also ask
            </h2>
            <ul className="space-y-1.5">
              {card.suggested_questions.map((q, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] text-slate-400">
                  <span className="text-[#C9A227] mt-0.5" aria-hidden>·</span>
                  {q}
                </li>
              ))}
            </ul>
            <Link
              href="/talk-to-lawyer"
              className="mt-3 inline-block text-[13px] font-semibold text-[#D4AF37] hover:text-white transition-colors"
            >
              Ask a lawyer these questions
            </Link>
          </section>
        )}

        <div className="mt-10 rounded-sm bg-white/[0.02] border border-white/8 p-4">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-400">Not legal advice. </span>
            {LEGAL_DISCLAIMER}
          </p>
        </div>
      </article>
    </div>
  )
}
