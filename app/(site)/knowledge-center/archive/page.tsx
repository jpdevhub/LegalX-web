import type { Metadata } from 'next'
import Link from 'next/link'
import { labelFor } from '@/components/sections/knowledge/KnowledgeFeed'
import { apiGetShortsArchive, apiGetShortsMonths, type LegalShort } from '@/lib/api'

// The archive changes only when something is published, so it can be cached
// harder than the live feed.
export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Archive — Knowledge Center | LegalXOnline',
  description:
    'Every legal update we have published, browsable by month and category. Summaries of Indian court judgments and government notifications, grounded in official sources.',
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  let shorts: LegalShort[] = []
  let total = 0
  let months: { month: string; count: number }[] = []

  try {
    const res = await apiGetShortsArchive({
      month: params.month,
      category: params.category,
      page,
      limit: 24,
    })
    shorts = res.shorts
    total = res.total
  } catch {
    // Falls through to the empty state rather than a 500 page.
  }
  try {
    months = await apiGetShortsMonths()
  } catch { /* month rail is optional chrome */ }

  const pages = Math.max(1, Math.ceil(total / 24))
  const qs = (over: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { month: params.month, category: params.category, ...over }
    for (const [k, v] of Object.entries(merged)) {
      // Omit page=1 so the canonical URL has no redundant query.
      if (v === undefined || v === '') continue
      if (k === 'page' && Number(v) === 1) continue
      sp.set(k, String(v))
    }
    const s = sp.toString()
    return s ? `?${s}` : ''
  }

  return (
    <div className="bg-[#0A0D14] min-h-[70vh] px-5 py-10">
      <div className="max-w-[1000px] mx-auto">
        <Link href="/knowledge-center" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          ← Knowledge Center
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Browse by month</h1>
        <p className="text-sm text-slate-400 mb-7">
          {total > 0
            ? `${total} update${total === 1 ? '' : 's'}${params.month ? ` published in ${monthLabel(params.month)}` : ' published so far'}. Everything here also appears in the main feed.`
            : 'Nothing published yet.'}
        </p>

        {months.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-7">
            <Link
              href="/knowledge-center/archive"
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                !params.month
                  ? 'bg-[#C9A227] text-[#0A0D14] border-[#C9A227]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/25'
              }`}
            >
              All time
            </Link>
            {months.map(m => (
              <Link
                key={m.month}
                href={`/knowledge-center/archive${qs({ month: m.month, page: undefined })}`}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  params.month === m.month
                    ? 'bg-[#C9A227] text-[#0A0D14] border-[#C9A227]'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/25'
                }`}
              >
                {monthLabel(m.month)}
                <span className="ml-1.5 opacity-60">{m.count}</span>
              </Link>
            ))}
          </div>
        )}

        {shorts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-slate-400">No updates in this period.</p>
            <Link href="/knowledge-center" className="mt-4 inline-block text-sm font-semibold text-[#D4AF37] hover:text-white transition-colors">
              Back to the feed
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shorts.map(s => (
              <Link
                key={s.id}
                href={s.slug ? `/knowledge-center/${s.slug}` : '/knowledge-center'}
                className="flex flex-col rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/20 p-5 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="px-2 py-0.5 rounded bg-[#C9A227]/15 text-[10px] font-bold uppercase tracking-wide text-[#D4AF37]">
                    {labelFor(s.category)}
                  </span>
                  {s.published_at && (
                    <span className="text-[11px] text-slate-600">
                      {new Date(s.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <p className="text-[15px] font-semibold text-white leading-snug">{s.title}</p>
                <p className="mt-2 text-xs text-slate-400 line-clamp-3 flex-1">{s.summary}</p>
                {s.source_name && (
                  <p className="mt-3 text-[11px] text-slate-600">{s.source_name}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={`/knowledge-center/archive${qs({ page: page - 1 })}`}
                className="px-4 h-10 inline-flex items-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="text-xs text-slate-500 tabular-nums">{page} / {pages}</span>
            {page < pages && (
              <Link
                href={`/knowledge-center/archive${qs({ page: page + 1 })}`}
                className="px-4 h-10 inline-flex items-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
