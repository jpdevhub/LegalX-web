'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGetMe } from '@/lib/api'
import { NotificationsFeed } from '@/components/notifications/NotificationsFeed'

/**
 * The client's own notification history.
 *
 * Signed-out visitors are sent to sign in rather than shown an empty list — the
 * endpoint is per account, so there is nothing to display without one.
 */
export default function ClientNotificationsPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiGetMe().then(me => {
      if (cancelled) return
      if (!me) router.replace('/login?redirect_to=/notifications')
      else setReady(true)
    })
    return () => { cancelled = true }
  }, [router])

  return (
    <div className="min-h-screen bg-[#080B12] px-5 md:px-16 py-12">
      {ready ? (
        <NotificationsFeed />
      ) : (
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="w-4 h-4 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
          Loading…
        </div>
      )}
    </div>
  )
}
