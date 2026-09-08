'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiLogout, type AuthUser } from '@/lib/api'
import { NotificationBell } from '@/components/notifications/NotificationBell'

/**
 * Lawyer portal top bar.
 *
 * The portal had no top bar at all: the whole strip above the page was empty
 * while notifications sat in the sidebar, wedged between navigation links,
 * where an alert reads as another menu item. The bell belongs at the top right
 * with the account it belongs to — which is where anyone signed into anything
 * looks for it.
 */
export function LPortalTopbar({ user, isOnline }: { user: AuthUser; isOnline: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const initials =
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'LX'

  // Click-away and Escape, so the menu behaves like a menu rather than a div
  // that stays open until something else happens to re-render.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await apiLogout() } catch { /* cookies are cleared either way */ }
    router.push('/login')
  }

  return (
    <header className="hidden lg:flex sticky top-0 z-30 h-14 shrink-0 items-center justify-end gap-2 px-6 bg-[#0A0D14]/85 backdrop-blur-md border-b border-white/8">
      {/* Availability, mirrored from the sidebar switch so the state is visible
          from any page without scrolling the sidebar into view. */}
      <span className="flex items-center gap-2 mr-auto text-xs font-medium">
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
        <span className={isOnline ? 'text-emerald-400' : 'text-slate-500'}>
          {isOnline ? 'Online — accepting calls' : 'Offline'}
        </span>
      </span>

      <NotificationBell />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(v => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-[#C9A227] flex items-center justify-center shrink-0">
            <span className="text-[#0A0D14] font-bold text-xs">{initials}</span>
          </span>
          <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
               strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-[#111318] border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/8">
              <p className="text-sm font-semibold text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>

            <div className="py-1">
              <MenuLink href="/lawyer-dashboard/settings" onClick={() => setOpen(false)}>
                Profile &amp; rates
              </MenuLink>
              <MenuLink href="/talk-to-lawyer" external onClick={() => setOpen(false)}>
                My public profile
              </MenuLink>
              <MenuLink href="/lawyer-dashboard/payouts" onClick={() => setOpen(false)}>
                Payouts
              </MenuLink>
            </div>

            <div className="py-1 border-t border-white/8">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                role="menuitem"
                className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
              >
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function MenuLink({
  href, children, external, onClick,
}: { href: string; children: React.ReactNode; external?: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
    >
      {children}
    </Link>
  )
}
