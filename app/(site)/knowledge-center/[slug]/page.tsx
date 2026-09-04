import type { Metadata } from 'next'
import Link from 'next/link'
import { labelFor, ctaFor, formatDate } from '@/lib/knowledge'
import { notFound } from 'next/navigation'
import { apiGetShort } from '@/lib/api'

export const revalidate = 3600

/**
 * A card published since the last regeneration must still resolve rather than
 * 404 — the feed links to it the moment it goes live.
 */
export const dynamicParams = true

/**
 * apiGetShort swallows its own errors and returns null, but a network-level
 * throw would still surface as a 500. The page is public and indexed, so an
 * unreachable backend has to degrade to "not found", never to an error screen.
 */
async function loadShort(slug: string) {
  try {
    return await apiGetShort(slug)
  } catch {
    return null
  }
}

// Shared links are the main way these spread, so the card needs real metadata
// rather than the site-wide default.
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const short = await loadShort(slug)
  if (!short) return { title: 'Not found' }

  return {
    title: `${short.title} — Knowledge Center`,
    description: short.summary.slice(0, 160),
    alternates: { canonical: `/knowledge-center/${slug}` },
    openGraph: {
      title: short.title,
      description: short.summary.slice(0, 200),
      type: 'article',
      url: `/knowledge-center/${slug}`,
    },
  }
}

export default async function ShortPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const short = await loadShort(slug)
  if (!short) notFound()

  return (
    <div className="bg-[#0A0D14] min-h-[70vh] px-5 py-10">
      <article className="max-w-[680px] mx-auto">
        <Link href="/knowledge-center" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          ← Knowledge Center
        </Link>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="px-2.5 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/25 text-[11px] font-bold uppercase tracking-wide text-[#D4AF37]">
            {labelFor(short.category)}
          </span>
          {short.court && (
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400">
              {short.court}
            </span>
          )}
          {short.judgment_date && (
            <span className="text-[11px] text-slate-500">
              {formatDate(short.judgment_date)}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-5">{short.title}</h1>

        <p className="text-[16px] text-slate-300 leading-relaxed whitespace-pre-wrap">{short.summary}</p>

        {short.takeaway && (
          <div className="mt-6 p-5 rounded-xl bg-[#C9A227]/8 border-l-4 border-[#C9A227]">
            <p className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wide mb-2">
              What it means for you
            </p>
            <p className="text-[15px] text-slate-200 leading-relaxed">{short.takeaway}</p>
          </div>
        )}

        {short.tags && short.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {short.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-slate-500">#{tag}</span>
            ))}
          </div>
        )}

        {/*
          Article structured data. The Knowledge Centre is the discovery funnel
          and had no schema at all, so search engines had nothing to work with
          beyond raw text.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: short.title,
              description: short.summary.slice(0, 250),
              datePublished: short.published_at ?? short.created_at,
              dateModified: short.published_at ?? short.created_at,
              articleSection: labelFor(short.category),
              keywords: (short.tags ?? []).join(', '),
              inLanguage: 'en-IN',
              author: { '@type': 'Organization', name: 'LegalXOnline' },
              publisher: {
                '@type': 'Organization',
                name: 'LegalXOnline',
                url: 'https://www.legalxonline.com',
              },
              isBasedOn: short.source_url ?? undefined,
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://www.legalxonline.com/knowledge-center/${short.slug}`,
              },
            }),
          }}
        />

        {(short.affects_whom || short.action_required === 'yes' || short.deadline) && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {short.affects_whom && (
              <div className="rounded-lg bg-white/[0.03] border border-white/8 p-3.5">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Who this affects</p>
                <p className="text-sm text-slate-200">{short.affects_whom}</p>
              </div>
            )}
            {short.deadline && (
              <div className="rounded-lg bg-amber-500/[0.07] border border-amber-500/25 p-3.5">
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide mb-1">Deadline</p>
                <p className="text-sm text-amber-200">
                  {formatDate(short.deadline)}
                </p>
              </div>
            )}
          </div>
        )}

        {short.key_points && short.key_points.length > 0 && (
          <div className="mt-6">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Key points</p>
            <ul className="space-y-1.5">
              {short.key_points.map((point, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                  <span className="text-[#C9A227] mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {short.statute_reference && (
          <p className="mt-5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Reference: </span>
            {short.statute_reference}
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-white/8 flex flex-wrap gap-3">
          {short.source_url && (
            <a
              href={short.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 h-10 inline-flex items-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors"
            >
              Read the original source
            </a>
          )}
          <Link
            href={ctaFor(short.category).href}
            className="px-4 h-10 inline-flex items-center rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] text-sm font-bold transition-colors"
          >
            {ctaFor(short.category).label}
          </Link>
        </div>

        {/* Stated on the card itself, not only in the terms — this is a legal
            services brand publishing summaries of law. */}
        <div className="mt-8 rounded-lg bg-white/[0.02] border border-white/8 p-4">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-400">Not legal advice. </span>
            This summary is drawn from
            {short.source_name ? ` ${short.source_name}` : ' the official source record'} and reviewed
            by our team before publication. It is general information about the law as stated in that
            source, does not account for your circumstances, and does not create a lawyer–client
            relationship. Laws change and summaries can lag — check the original source, linked above,
            before relying on anything here.
          </p>
        </div>
      </article>
    </div>
  )
}
