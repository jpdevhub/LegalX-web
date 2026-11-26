'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  apiGetMe, apiGetOrders, apiGetSavedLawyers, apiGetSavedArticles, apiGetTickets,
  apiUnsaveLawyer, apiUnsaveArticle, apiOpenTicket, apiReplyToTicket,
  apiAssetUrl, SUPPORT_CATEGORIES,
  type AccountOrder, type SavedLawyer, type SavedArticle, type SupportTicket,
} from '@/lib/api'

/**
 * Everything a client has done here, in one place.
 *
 * Until now the website had no account area at all: someone who paid for a
 * service had nowhere to go and see it, and the Android screens for the same
 * four things had no endpoint behind them.
 */

type Tab = 'orders' | 'lawyers' | 'articles' | 'support'

const TABS: { key: Tab; label: string }[] = [
  { key: 'orders',   label: 'Orders' },
  { key: 'lawyers',  label: 'Saved advocates' },
  { key: 'articles', label: 'Saved reading' },
  { key: 'support',  label: 'Support' },
]

const STATUS_TONE: Record<string, string> = {
  Completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  Pending:   'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
  Cancelled: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25',
  Refunded:  'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25',
  Open:         'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
  'In Progress':'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25',
  Resolved:  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  Closed:    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25',
}

function Pill({ value }: { value: string }) {
  const tone = STATUS_TONE[value] ?? STATUS_TONE.Cancelled
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${tone}`}>
      {value}
    </span>
  )
}

function when(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Empty({ title, body, href, cta }: { title: string; body: string; href?: string; cta?: string }) {
  return (
    <div className="text-center py-16 px-6 border border-dashed border-hairline dark:border-white/10 rounded-xl">
      <p className="text-ink dark:text-white font-semibold mb-1.5">{title}</p>
      <p className="text-body-sm text-muted dark:text-slate-400 max-w-sm mx-auto mb-5">{body}</p>
      {href && cta && (
        <Link href={href} className="inline-block px-5 py-2.5 rounded-lg bg-primary text-white font-semibold text-body-sm">
          {cta}
        </Link>
      )}
    </div>
  )
}

function AccountInner() {
  const router = useRouter()
  const params = useSearchParams()

  const initial = (params.get('tab') as Tab) || 'orders'
  const [tab, setTab] = useState<Tab>(TABS.some(t => t.key === initial) ? initial : 'orders')
  const [ready, setReady] = useState(false)

  const [orders, setOrders] = useState<AccountOrder[]>([])
  const [lawyers, setLawyers] = useState<SavedLawyer[]>([])
  const [articles, setArticles] = useState<SavedArticle[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  // Only a client has an account area; an advocate or admin has a portal.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const me = await apiGetMe()
      if (cancelled) return
      if (!me) { router.replace('/login?redirect_to=/account'); return }
      if (me.role !== 'client') { router.replace(me.role === 'admin' ? '/admin' : '/lawyer-dashboard'); return }
      setReady(true)
    })()
    return () => { cancelled = true }
  }, [router])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // All four at once: four serial round trips would be four seconds.
      const [o, l, a, t] = await Promise.all([
        apiGetOrders(), apiGetSavedLawyers(), apiGetSavedArticles(), apiGetTickets(),
      ])
      setOrders(o); setLawyers(l); setArticles(a); setTickets(t)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (ready) void load() }, [ready, load])

  const switchTab = (next: Tab) => {
    setTab(next)
    // Keeps the tab across a reload and makes it linkable.
    router.replace(`/account?tab=${next}`, { scroll: false })
  }

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto px-5 md:px-8 py-10 md:py-14">
      <header className="mb-8">
        <h1 className="text-ink dark:text-white font-bold" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>
          Your account
        </h1>
        <p className="text-body-sm text-muted dark:text-slate-400 mt-1">
          Orders, saved advocates and reading, and anything you have asked us about.
        </p>
      </header>

      {/* Scrolls inside itself on a narrow screen, so the page never does. */}
      <div className="w-full overflow-x-auto mb-7">
        <div className="flex gap-1 p-1 rounded-xl bg-surface-soft dark:bg-white/5 border border-hairline dark:border-white/10 w-full sm:w-fit">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`px-4 py-2 rounded-lg text-body-sm font-medium whitespace-nowrap flex-none transition-colors ${
                tab === t.key
                  ? 'bg-primary text-white font-semibold'
                  : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      ) : tab === 'orders' ? (
        <OrdersTab orders={orders} />
      ) : tab === 'lawyers' ? (
        <LawyersTab lawyers={lawyers} onRemove={async id => { await apiUnsaveLawyer(id); void load() }} />
      ) : tab === 'articles' ? (
        <ArticlesTab articles={articles} onRemove={async (k, s) => { await apiUnsaveArticle(k, s); void load() }} />
      ) : (
        <SupportTab tickets={tickets} onChanged={load} />
      )}
    </div>
  )
}

/**
 * useSearchParams opts the subtree out of prerendering, so it needs a
 * boundary of its own — without one the whole page fails to build.
 */
export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    }>
      <AccountInner />
    </Suspense>
  )
}

// ── Orders ───────────────────────────────────────────────────────────────────

function OrdersTab({ orders }: { orders: AccountOrder[] }) {
  if (!orders.length) {
    return <Empty
      title="Nothing here yet"
      body="Services you request and consultations you take will appear here, with what each cost."
      href="/documents" cta="Browse services" />
  }

  return (
    <ul className="space-y-3">
      {orders.map(o => (
        <li key={`${o.orderType}-${o.id}`}
            className="p-4 sm:p-5 rounded-xl border border-hairline dark:border-white/10 bg-white dark:bg-white/[0.03]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-label-caps text-muted uppercase tracking-widest mb-1">{o.orderType}</p>
              <p className="text-ink dark:text-white font-semibold truncate">{o.serviceTitle}</p>
              <p className="text-[12px] text-muted dark:text-slate-400 mt-1">
                {when(o.date)}
                {o.lawyerName && <> · with {o.lawyerName}</>}
                {o.paymentMethod && <> · {o.paymentMethod}</>}
              </p>
            </div>
            <div className="text-right flex-none">
              <p className="text-ink dark:text-white font-bold tabular-nums">
                {o.amount > 0 ? `₹${o.amount.toLocaleString('en-IN')}` : '—'}
              </p>
              <div className="mt-1.5"><Pill value={o.status} /></div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

// ── Saved advocates ──────────────────────────────────────────────────────────

function LawyersTab({ lawyers, onRemove }: { lawyers: SavedLawyer[]; onRemove: (id: string) => void }) {
  if (!lawyers.length) {
    return <Empty
      title="No saved advocates"
      body="Save an advocate from their profile and they will be here next time you need them."
      href="/talk-to-lawyer" cta="Find an advocate" />
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {lawyers.map(l => (
        <li key={l.slug}
            className="p-4 rounded-xl border border-hairline dark:border-white/10 bg-white dark:bg-white/[0.03]">
          <div className="flex items-start gap-3">
            {l.avatarUrl
              ? <img src={apiAssetUrl(l.avatarUrl) ?? ''} alt="" className="w-12 h-12 rounded-full object-cover flex-none" />
              : <div className="w-12 h-12 rounded-full bg-primary/15 text-primary grid place-items-center font-bold flex-none">
                  {l.name.charAt(0) || 'A'}
                </div>}
            <div className="min-w-0 flex-1">
              <Link href={`/talk-to-lawyer/${l.slug}`} className="text-ink dark:text-white font-semibold hover:text-primary truncate block">
                {l.name}
              </Link>
              <p className="text-[12px] text-muted dark:text-slate-400 truncate">
                {l.primarySpec} · {l.experience} yrs
              </p>
              <p className="text-[12px] text-muted dark:text-slate-400 mt-0.5">
                ★ {l.rating || '—'} ({l.reviewCount}) · from ₹{l.fees.chat}/min
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Link href={`/talk-to-lawyer/${l.slug}`}
                  className="flex-1 text-center py-2 rounded-lg bg-primary text-white text-[13px] font-semibold">
              Consult
            </Link>
            <button onClick={() => onRemove(l.slug)}
                    className="px-3 py-2 rounded-lg border border-hairline dark:border-white/15 text-[13px] text-muted hover:text-ink dark:hover:text-white">
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

// ── Saved reading ────────────────────────────────────────────────────────────

function ArticlesTab({ articles, onRemove }: {
  articles: SavedArticle[]; onRemove: (kind: string, slug: string) => void
}) {
  if (!articles.length) {
    return <Empty
      title="Nothing saved"
      body="Save anything from the Knowledge Centre and it will wait for you here."
      href="/knowledge-center" cta="Open Knowledge Centre" />
  }

  return (
    <ul className="space-y-3">
      {articles.map(a => (
        <li key={`${a.kind}-${a.slug}`}
            className="p-4 rounded-xl border border-hairline dark:border-white/10 bg-white dark:bg-white/[0.03]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {a.category && <p className="text-label-caps text-primary uppercase tracking-widest mb-1">{a.category}</p>}
              <Link
                href={a.kind === 'knowledge' ? `/knowledge-center/know-your-rights/${a.slug}` : `/knowledge-center/${a.slug}`}
                className="text-ink dark:text-white font-semibold hover:text-primary block"
              >
                {a.title}
              </Link>
              {a.teaser && <p className="text-[13px] text-muted dark:text-slate-400 mt-1 line-clamp-2">{a.teaser}</p>}
            </div>
            <button onClick={() => onRemove(a.kind, a.slug)}
                    className="flex-none text-[12px] text-muted hover:text-ink dark:hover:text-white underline">
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

// ── Support ──────────────────────────────────────────────────────────────────

function SupportTab({ tickets, onChanged }: { tickets: SupportTicket[]; onChanged: () => void }) {
  const [composing, setComposing] = useState(false)
  const [category, setCategory] = useState<string>(SUPPORT_CATEGORIES[0])
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [reply, setReply] = useState('')

  const submit = async () => {
    setError(''); setBusy(true)
    try {
      await apiOpenTicket({ category, subject, description })
      setComposing(false); setSubject(''); setDescription('')
      onChanged()
    } catch (e) {
      setError((e as Error)?.message || 'Could not open that ticket.')
    } finally {
      setBusy(false)
    }
  }

  const sendReply = async (id: string) => {
    if (!reply.trim()) return
    setBusy(true)
    try { await apiReplyToTicket(id, reply); setReply(''); onChanged() }
    catch (e) { setError((e as Error)?.message || 'Could not send that.') }
    finally { setBusy(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="text-body-sm text-muted dark:text-slate-400">
          {tickets.length ? `${tickets.length} ticket${tickets.length === 1 ? '' : 's'}` : 'No tickets yet'}
        </p>
        <button onClick={() => setComposing(v => !v)}
                className="px-4 py-2 rounded-lg bg-primary text-white text-body-sm font-semibold">
          {composing ? 'Cancel' : 'Ask us something'}
        </button>
      </div>

      {composing && (
        <div className="p-5 rounded-xl border border-hairline dark:border-white/10 bg-white dark:bg-white/[0.03] mb-6 space-y-4">
          <div>
            <label htmlFor="cat" className="block text-body-sm font-medium text-ink dark:text-white mb-1.5">What is it about?</label>
            <select id="cat" value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-hairline dark:border-white/15 bg-white dark:bg-white/5 text-ink dark:text-white text-body-sm">
              {SUPPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="subj" className="block text-body-sm font-medium text-ink dark:text-white mb-1.5">Subject</label>
            <input id="subj" value={subject} onChange={e => setSubject(e.target.value)} maxLength={140}
                   placeholder="A short summary"
                   className="w-full px-3.5 py-2.5 rounded-lg border border-hairline dark:border-white/15 bg-white dark:bg-white/5 text-ink dark:text-white text-body-sm placeholder:text-muted" />
          </div>
          <div>
            <label htmlFor="desc" className="block text-body-sm font-medium text-ink dark:text-white mb-1.5">What happened?</label>
            <textarea id="desc" rows={4} value={description} onChange={e => setDescription(e.target.value)} maxLength={4000}
                      placeholder="Tell us what you were doing and what went wrong. Include an order reference if you have one."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-hairline dark:border-white/15 bg-white dark:bg-white/5 text-ink dark:text-white text-body-sm placeholder:text-muted resize-none" />
          </div>
          {error && <p className="text-[13px] text-rose-600 dark:text-rose-400">{error}</p>}
          <button onClick={submit} disabled={busy || subject.trim().length < 3 || description.trim().length < 10}
                  className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold text-body-sm disabled:opacity-50">
            {busy ? 'Sending…' : 'Send'}
          </button>
        </div>
      )}

      {!tickets.length && !composing ? (
        <Empty title="Nothing to show" body="If something goes wrong, open a ticket and we will pick it up." />
      ) : (
        <ul className="space-y-3">
          {tickets.map(t => (
            <li key={t.id} className="rounded-xl border border-hairline dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden">
              <button onClick={() => setOpenId(openId === t.id ? null : t.id)}
                      className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-label-caps text-muted uppercase tracking-widest mb-1">{t.category}</p>
                  <p className="text-ink dark:text-white font-semibold truncate">{t.subject}</p>
                  <p className="text-[12px] text-muted dark:text-slate-400 mt-1">
                    {when(t.date)} · {t.messages.length} message{t.messages.length === 1 ? '' : 's'}
                  </p>
                </div>
                <Pill value={t.status} />
              </button>

              {openId === t.id && (
                <div className="px-4 sm:px-5 pb-5 border-t border-hairline dark:border-white/10 pt-4">
                  <p className="text-body-sm text-body-text dark:text-slate-300 whitespace-pre-wrap mb-4">{t.description}</p>
                  {t.messages.length > 0 && (
                    <ul className="space-y-2.5 mb-4">
                      {t.messages.map((m, i) => (
                        <li key={i} className={m.sender === 'User' ? 'text-right' : ''}>
                          <div className={`inline-block max-w-[85%] text-left px-3.5 py-2.5 rounded-xl text-[13.5px] ${
                            m.sender === 'User'
                              ? 'bg-primary/10 text-ink dark:text-white'
                              : 'bg-surface-soft dark:bg-white/[0.06] text-body-text dark:text-slate-200'
                          }`}>
                            <p className="text-[11px] text-muted mb-0.5">{m.sender === 'User' ? 'You' : 'LegalX Support'}</p>
                            {m.text}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {t.status !== 'Closed' ? (
                    <div className="flex gap-2">
                      <input value={reply} onChange={e => setReply(e.target.value)}
                             onKeyDown={e => { if (e.key === 'Enter') void sendReply(t.id) }}
                             placeholder="Add to this ticket…"
                             className="flex-1 px-3.5 py-2.5 rounded-lg border border-hairline dark:border-white/15 bg-white dark:bg-white/5 text-ink dark:text-white text-body-sm placeholder:text-muted" />
                      <button onClick={() => void sendReply(t.id)} disabled={busy || !reply.trim()}
                              className="px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-body-sm disabled:opacity-50">
                        Send
                      </button>
                    </div>
                  ) : (
                    <p className="text-[12px] text-muted">This ticket is closed. Open a new one if you still need us.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
