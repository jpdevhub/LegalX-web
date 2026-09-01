'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead,
  type AppNotification,
} from '@/lib/api'

/**
 * Live notifications, delivered over Server-Sent Events.
 *
 * The stream is authenticated by the same HttpOnly cookie as every other API
 * call, which is why this does not use a browser Supabase client: the JWT is
 * deliberately unreadable from JavaScript, so a browser Realtime client could
 * only ever connect as `anon`. The backend subscribes to Supabase Realtime and
 * relays each row to the one account that owns it.
 */

const TYPE_ICONS: Record<string, string> = {
  consultation: '💬',
  payment: '💳',
  document: '📄',
  verification: '✅',
  wallet: '🪙',
  dispute: '⚠️',
  info: '🔔',
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function NotificationBell({ variant = 'header' }: { variant?: 'header' | 'sidebar' }) {
  const [items, setItems] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<AppNotification | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await apiGetNotifications({ pageSize: 20 })
      setItems(res.notifications)
      setUnread(res.unread)
    } catch {
      // Signed out, or the notifications table isn't migrated yet — the bell
      // simply stays empty rather than breaking the header.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Live stream ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let source: EventSource | null = null
    let retry: ReturnType<typeof setTimeout> | null = null
    let attempts = 0
    let closed = false

    const connect = () => {
      if (closed) return
      source = new EventSource('/api/notifications/stream', { withCredentials: true })

      source.addEventListener('open', () => { attempts = 0 })

      source.addEventListener('notification', (e: MessageEvent) => {
        try {
          const n = JSON.parse(e.data)
          const item: AppNotification = {
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            is_read: false,
            link: n.link ?? null,
            created_at: n.createdAt,
          }
          // Guard against duplicates if a reconnect replays an event.
          setItems(prev => (prev.some(p => p.id === item.id) ? prev : [item, ...prev].slice(0, 20)))
          setUnread(u => u + 1)
          setToast(item)
          if (toastTimer.current) clearTimeout(toastTimer.current)
          toastTimer.current = setTimeout(() => setToast(null), 6000)
        } catch {
          // Malformed frame — ignore rather than tear down the stream.
        }
      })

      source.addEventListener('error', () => {
        // EventSource retries on its own, but not after an auth failure, and a
        // tight loop would hammer the backend. Close and back off instead.
        source?.close()
        if (closed) return
        attempts += 1
        // 2s, 4s, 8s … capped at 60s.
        const delay = Math.min(2000 * 2 ** (attempts - 1), 60_000)
        retry = setTimeout(connect, delay)
      })
    }

    connect()
    return () => {
      closed = true
      source?.close()
      if (retry) clearTimeout(retry)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const markRead = async (n: AppNotification) => {
    if (n.is_read) return
    setItems(prev => prev.map(p => (p.id === n.id ? { ...p, is_read: true } : p)))
    setUnread(u => Math.max(0, u - 1))
    try { await apiMarkNotificationRead(n.id) } catch { /* optimistic */ }
  }

  const markAll = async () => {
    setItems(prev => prev.map(p => ({ ...p, is_read: true })))
    setUnread(0)
    try { await apiMarkAllNotificationsRead() } catch { /* optimistic */ }
  }

  const isSidebar = variant === 'sidebar'

  return (
    <>
      <div className={`relative ${isSidebar ? 'w-full' : ''}`} ref={panelRef}>
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          className={
            isSidebar
              ? 'flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors'
              : 'relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors'
          }
        >
          <span className="relative inline-flex">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              suppressHydrationWarning
            >
              <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C9A227] text-[#0A0D14] text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </span>
          {isSidebar && <span className="flex-1 text-left">Notifications</span>}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-50 w-[min(360px,calc(100vw-32px))] max-h-[420px] overflow-hidden flex flex-col rounded-xl bg-[#111318] border border-white/10 shadow-2xl ${
                isSidebar ? 'left-0 bottom-full mb-2' : 'right-0 mt-2'
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <p className="text-sm font-semibold text-white">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAll} className="text-xs text-[#C9A227] hover:text-white transition-colors">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-slate-500">
                    Nothing yet. Updates about your consultations and payments will show up here.
                  </p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {items.map(n => {
                      const body = (
                        <>
                          <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden>
                            {TYPE_ICONS[n.type] ?? TYPE_ICONS.info}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start gap-2">
                              <span className={`text-sm flex-1 ${n.is_read ? 'text-slate-400' : 'text-white font-semibold'}`}>
                                {n.title}
                              </span>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#C9A227] mt-1.5 shrink-0" />}
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5">{n.message}</span>
                            <span className="block text-[11px] text-slate-600 mt-1">{timeAgo(n.created_at)}</span>
                          </span>
                        </>
                      )

                      return (
                        <li key={n.id}>
                          {n.link ? (
                            <Link
                              href={n.link}
                              onClick={() => { markRead(n); setOpen(false) }}
                              className="flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                            >
                              {body}
                            </Link>
                          ) : (
                            <button
                              onClick={() => markRead(n)}
                              className="w-full text-left flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                            >
                              {body}
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live toast for a notification that arrives while the panel is closed */}
      <AnimatePresence>
        {toast && !open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-5 right-5 z-[120] w-[min(340px,calc(100vw-40px))] rounded-xl bg-[#111318] border border-[#C9A227]/30 shadow-2xl p-4"
          >
            <div className="flex gap-3">
              <span className="text-lg leading-none" aria-hidden>{TYPE_ICONS[toast.type] ?? TYPE_ICONS.info}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>
                {toast.link && (
                  <Link
                    href={toast.link}
                    onClick={() => setToast(null)}
                    className="inline-block mt-2 text-xs font-semibold text-[#C9A227] hover:text-white transition-colors"
                  >
                    View →
                  </Link>
                )}
              </div>
              <button
                onClick={() => setToast(null)}
                aria-label="Dismiss"
                className="text-slate-500 hover:text-white transition-colors shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
