'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiGetMe, apiGetLawyerMe, apiFetch, SESSION_EXPIRED_EVENT, type AuthUser } from '@/lib/api'
import { LPortalSidebar } from '@/components/lawyer-portal/LPortalSidebar'
import { LPortalTopbar } from '@/components/lawyer-portal/LPortalTopbar'

// ── Portal layout ─────────────────────────────────────────────────────────────
export default function LawyerPortalLayout({ children }: { children: React.ReactNode }) {
  const router       = useRouter()
  const mountedRef   = useRef(true)

  const [user,        setUser]        = useState<AuthUser | null>(null)
  const [isOnline,    setIsOnline]    = useState(false)
  const [authReady,   setAuthReady]   = useState(false)

  // Refreshed from every response that carries it, so retuning the window on
  // the server takes effect on the next renewal rather than on reload.
  const heartbeatMs = useRef(30_000)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  /**
   * Auth check on mount.
   *
   * `cancelled` is local to this run rather than the shared mountedRef: that
   * ref is set false by an unrelated cleanup, so a re-run could return early
   * and leave the spinner up for good — which is the "comes back to an
   * infinite loading screen" people were hitting after navigating away.
   */
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        // Issued together, not one after the other. These are independent, and
        // a round trip costs about a second and a half.
        const [u, lm] = await Promise.all([apiGetMe(), apiGetLawyerMe()])
        if (cancelled) return

        if (!u || u.role !== 'lawyer') {
          router.replace('/login?redirect_to=/lawyer-dashboard')
          return
        }

        setUser(u)
        // Intent, not the lease — see LawyerMe in lib/api.ts for why.
        setIsOnline(lm?.is_online ?? false)
      } finally {
        // Always, on every path. The spinner is only ever a wait for this
        // check to finish, so nothing may leave it hanging.
        if (!cancelled) setAuthReady(true)
      }
    })()

    return () => { cancelled = true }
  }, [router])

  /*
   * The incoming-call stream lives in <IncomingCallListener /> at the root
   * layout now. Keeping a second copy here would open a duplicate EventSource
   * on every dashboard page and ring the same call twice.
   */

  const handleToggleOnline = useCallback(async () => {
    const next = !isOnline
    setIsOnline(next) // optimistic
    try {
      // Key must be `isOnline` — the backend rejects anything else with a 400,
      // which is what used to make the switch snap back to offline.
      const res = await apiFetch<{ heartbeatIntervalMs?: number }>(
        '/api/lawyers/me/status',
        { method: 'PATCH', body: JSON.stringify({ isOnline: next }) },
      )
      if (res?.heartbeatIntervalMs) heartbeatMs.current = res.heartbeatIntervalMs
    } catch {
      setIsOnline(!next) // rollback so the switch reflects the server
    }
  }, [isOnline])

  /**
   * The mount check runs once. When the session expired an hour in, nothing
   * noticed — the dashboard sat there with empty cards while everything behind
   * it 401'd.
   */
  useEffect(() => {
    const onExpired = () => {
      if (!mountedRef.current) return
      const here = window.location.pathname + window.location.search
      router.replace(`/login?redirect_to=${encodeURIComponent(here)}`)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [router])

  /**
   * Renews the availability lease while the portal is open. Closing the tab
   * takes the advocate out of the directory on its own. `renewed: false` means
   * the server has them offline, so correct the switch.
   */
  useEffect(() => {
    if (!isOnline) return

    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined

    async function beat() {
      try {
        const res = await apiFetch<{ renewed?: boolean; heartbeatIntervalMs?: number }>(
          '/api/lawyers/me/heartbeat',
          { method: 'POST' },
        )
        if (stopped || !mountedRef.current) return
        if (res?.renewed === false) { setIsOnline(false); return }
        // The server owns the cadence; adopt whatever it last told us.
        if (res?.heartbeatIntervalMs) heartbeatMs.current = res.heartbeatIntervalMs
        timer = setTimeout(beat, heartbeatMs.current)
      } catch {
        // One failed renewal is not a reason to go offline — the lease has
        // room for three misses. Retry sooner than the usual cadence.
        if (!stopped && mountedRef.current) timer = setTimeout(beat, 10_000)
      }
    }

    // Renew now, so a reload leaves no gap for the lease to lapse in.
    beat()

    return () => { stopped = true; if (timer) clearTimeout(timer) }
  }, [isOnline])



  // Loading state
  if (!authReady || !user) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#C9A227]/30 border-t-[#C9A227] animate-spin" />
          <p className="text-slate-500 text-sm">Loading portal…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080B12] flex">
      {/* Sidebar */}
      <LPortalSidebar user={user} isOnline={isOnline} onToggleOnline={handleToggleOnline} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-0 pt-14 lg:pt-0">
        <LPortalTopbar user={user} isOnline={isOnline} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  )
}
