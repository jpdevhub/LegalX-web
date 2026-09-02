import type { Metadata } from 'next'
import Link from 'next/link'
import { labelFor } from '@/components/sections/knowledge/KnowledgeFeed'
import { notFound } from 'next/navigation'
import { apiGetShort } from '@/lib/api'

export const revalidate = 3600

// Shared links are the main way these spread, so the card needs real metadata
// rather than the site-wide default.
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const short = await apiGetShort(slug)
  if (!short) return { title: 'Not found | LegalXOnline' }

  return {
    title: `${short.title} | LegalX Knowledge Center`,
    description: short.summary.slice(0, 160),
    openGraph: {
      title: short.title,
      description: short.summary.slice(0, 200),
      type: 'article',
    },
  }
}

export default async function ShortPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const short = await apiGetShort(slug)
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
              {new Date(short.judgment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
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
            href="/talk-to-lawyer"
            className="px-4 h-10 inline-flex items-center rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] text-sm font-bold transition-colors"
          >
            Ask a lawyer about this
          </Link>
        </div>

        <p className="mt-8 text-[11px] text-slate-600 leading-relaxed">
          This summary is drawn from the official source record and reviewed before publication.
          It is general information, not legal advice, and does not create a lawyer–client relationship.
        </p>
      </article>
    </div>
  )
}
