'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  apiGetNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  type AppNotification,
} from '@/lib/api'

/**
 * The full notification history, for whichever portal mounts it.
 *
 * The bell only ever showed the newest few, and nothing linked anywhere else —
 * so an alert you did not catch in the moment was effectively gone, even though
 * every one of them has been in the notifications table all along. This reads
 * that table back, oldest kept, newest first.
 *
 * One component for client, lawyer and admin: the rows are per account and the
 * endpoint already scopes to the caller, so there is nothing role-specific to
 * fork. Three copies would only be three places to fix the next thing.
 */

const PAGE_SIZE = 25

const TYPE_TONE: Record<string, { dot: string; label: string }> = {
  consultation: { dot: 'bg-[#C9A227]', label: 'Consultation' },
  payment:      { dot: 'bg-emerald-400', label: 'Payment' },
  document:     { dot: 'bg-sky-400', label: 'Document' },
  verification: { dot: 'bg-violet-400', label: 'Verification' },
  wallet:       { dot: 'bg-emerald-400', label: 'Wallet' },
  dispute:      { dot: 'bg-rose-400', label: 'Dispute' },
}

/** Today / Yesterday / a date — so a long list stays readable while scrolling. */
function dayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((start(today) - start(d)) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return d.toLocaleDateString('en-IN', { weekday: 'long' })
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export function NotificationsFeed({ title = 'Notifications' }: { title?: string }) {
  const [items, setItems] = useState<AppNotification[]>([])
  const [total, setTotal] = useState(0)
  const [unread, setUnread] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (nextPage: number, append: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetNotifications({ page: nextPage, pageSize: PAGE_SIZE })
      setItems(prev => (append ? [...prev, ...res.notifications] : res.notifications))
      setTotal(res.total)
      setUnread(res.unread)
      setPage(nextPage)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Could not load your notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Guarded async inside the effect: nothing is set synchronously as it runs,
  // and nothing is set after unmount. `load` stays for the buttons, which are
  // event handlers and have neither problem.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiGetNotifications({ page: 1, pageSize: PAGE_SIZE })
        if (cancelled) return
        setItems(res.notifications)
        setTotal(res.total)
        setUnread(res.unread)
      } catch (err: unknown) {
        if (!cancelled) setError((err as Error)?.message || 'Could not load your notifications.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const markAll = async () => {
    setBusy(true)
    // Optimistic: the list is the thing being read, so it should respond at once
    // and correct itself on the next load rather than sit still for a round trip.
    setItems(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
    try { await apiMarkAllNotificationsRead() } catch { await load(1, false) }
    finally { setBusy(false) }
  }

  const markOne = async (n: AppNotification) => {
    if (n.is_read) return
    setItems(prev => prev.map(x => (x.id === n.id ? { ...x, is_read: true } : x)))
    setUnread(u => Math.max(0, u - 1))
    try { await apiMarkNotificationRead(n.id) } catch { /* corrected on next load */ }
  }

  // Grouped as they are rendered, so ordering stays whatever the server sent.
  const groups = useMemo(() => {
    const out: { day: string; rows: AppNotification[] }[] = []
    for (const n of items) {
      const day = dayLabel(n.created_at)
      const last = out[out.length - 1]
      if (last && last.day === day) last.rows.push(n)
      else out.push({ day, rows: [n] })
    }
    return out
  }, [items])

  const hasMore = items.length < total

  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {total === 0 && !loading
              ? 'Nothing here yet.'
              : `${total} in total${unread > 0 ? ` · ${unread} unread` : ''}`}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            disabled={busy}
            className="shrink-0 text-xs font-semibold text-[#C9A227] hover:text-white transition-colors disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-300">
          {error}{' '}
          <button onClick={() => load(1, false)} className="underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-[72px] rounded-xl bg-white/[0.03] border border-white/8 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 && !error ? (
        <div className="py-20 text-center">
          <p className="text-sm font-medium text-slate-300">No notifications yet</p>
          <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
            Consultations, payments and verification updates all land here, and stay.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <section key={group.day}>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.day}
              </p>
              <ul className="space-y-2">
                {group.rows.map(n => {
                  const tone = TYPE_TONE[n.type] ?? { dot: 'bg-slate-500', label: n.type }
                  const body = (
                    <>
                      <span className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tone.dot}`} aria-hidden />
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          {tone.label}
                        </span>
                        <span className="text-[11px] text-slate-600 ml-auto tabular-nums">
                          {timeLabel(n.created_at)}
                        </span>
                      </span>
                      <span className={`block text-sm font-semibold ${n.is_read ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </span>
                      <span className="block text-[13px] text-slate-400 mt-0.5 leading-relaxed">
                        {n.message}
                      </span>
                    </>
                  )

                  const shell =
                    'block w-full text-left p-4 rounded-xl border transition-colors ' +
                    (n.is_read
                      ? 'bg-white/[0.02] border-white/8 hover:border-white/15'
                      : 'bg-[#C9A227]/[0.06] border-[#C9A227]/25 hover:border-[#C9A227]/45')

                  return (
                    <li key={n.id}>
                      {n.link ? (
                        <Link href={n.link} onClick={() => markOne(n)} className={shell}>
                          {body}
                        </Link>
                      ) : (
                        <button onClick={() => markOne(n)} className={shell}>
                          {body}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}

          {hasMore && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => load(page + 1, true)}
                disabled={loading}
                className="px-5 h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading…' : `Show older (${total - items.length} left)`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
