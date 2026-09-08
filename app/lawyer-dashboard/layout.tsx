'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiGetMe, apiGetLawyerMe, apiFetch, type AuthUser } from '@/lib/api'
import { LPortalSidebar } from '@/components/lawyer-portal/LPortalSidebar'
import { LPortalTopbar } from '@/components/lawyer-portal/LPortalTopbar'

// ── Portal layout ─────────────────────────────────────────────────────────────
export default function LawyerPortalLayout({ children }: { children: React.ReactNode }) {
  const router       = useRouter()
  const mountedRef   = useRef(true)

  const [user,        setUser]        = useState<AuthUser | null>(null)
  const [isOnline,    setIsOnline]    = useState(false)
  const [authReady,   setAuthReady]   = useState(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Auth check on mount
  useEffect(() => {
    async function check() {
      const u = await apiGetMe()
      if (!mountedRef.current) return
      if (!u || u.role !== 'lawyer') {
        router.replace('/login?redirect_to=/lawyer-dashboard')
        return
      }
      setUser(u)

      // Load online status
      const lm = await apiGetLawyerMe()
      if (mountedRef.current) {
        setIsOnline(lm?.is_online ?? false)
        setAuthReady(true)
      }
    }
    check()
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
      await apiFetch('/api/lawyers/me/status', { method: 'PATCH', body: JSON.stringify({ isOnline: next }) })
    } catch {
      setIsOnline(!next) // rollback so the switch reflects the server
    }
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
