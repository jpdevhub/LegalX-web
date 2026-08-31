'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { apiLogout, type AuthUser } from '@/lib/api'
import { LXLogoMark } from '@/components/ui/LXLogo'

const NAV = [
  { label: 'Dashboard',     href: '/lawyer-dashboard',               icon: 'grid' },
  { label: 'Consultations', href: '/lawyer-dashboard/consultations', icon: 'phone' },
  { label: 'Documents',     href: '/lawyer-dashboard/documents',     icon: 'doc' },
  { label: 'Payouts',       href: '/lawyer-dashboard/payouts',       icon: 'wallet' },
  { label: 'Settings',      href: '/lawyer-dashboard/settings',      icon: 'settings' },
]

function NavIcon({ type }: { type: string }) {
  const cls = 'w-5 h-5'
  if (type === 'grid')     return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
  if (type === 'phone')    return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 1.22 2 2 0 014 .04h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
  if (type === 'doc')      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline strokeLinecap="round" strokeLinejoin="round" points="14 2 14 8 20 8"/><line strokeLinecap="round" x1="16" y1="13" x2="8" y2="13"/><line strokeLinecap="round" x1="16" y1="17" x2="8" y2="17"/></svg>
  if (type === 'wallet')   return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7H5a2 2 0 010-4h14v4"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 5v14a2 2 0 002 2h16v-5"/><path strokeLinecap="round" strokeLinejoin="round" d="M18 12a2 2 0 000 4h4v-4h-4z"/></svg>
  if (type === 'settings') return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  return null
}

interface Props {
  user: AuthUser
  isOnline: boolean
  onToggleOnline: () => Promise<void>
}

export function LPortalSidebar({ user, isOnline, onToggleOnline }: Props) {
  const pathname    = usePathname()
  const router      = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toggling,   setToggling]   = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()

  async function handleToggle() {
    if (toggling) return
    setToggling(true)
    try { await onToggleOnline() } finally { setToggling(false) }
  }

  async function handleLogout() {
    setLoggingOut(true)
    try { await apiLogout(); router.push('/') } finally { setLoggingOut(false) }
  }

  function isActive(href: string) {
    return href === '/lawyer-dashboard' ? pathname === href : pathname.startsWith(href)
  }

  const Inner = () => (
    <div className="flex flex-col h-full">
      {/* Logo — identical mark to main site header */}
      <div className="px-5 py-5 border-b border-white/8 flex items-center gap-3">
        <LXLogoMark height={36} className="text-white shrink-0" />
        <div className="min-w-0">
          <div className="text-white font-bold text-[15px] leading-none tracking-tight">
            LegalX<span className="text-[#C9A227]">Online</span>
          </div>
          <div className="text-[#C9A227] text-[10px] font-semibold tracking-widest uppercase mt-0.5">Lawyer Portal</div>
        </div>
      </div>

      {/* Online toggle */}
      <div className="mx-3 mt-4 px-3 py-3 rounded-xl bg-white/5 border border-white/8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full transition-colors ${isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-sm text-slate-300">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            aria-label="Toggle online status"
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-slate-600'} disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isOnline ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5">
          {isOnline ? 'Accepting new client requests' : 'Clients cannot book you'}
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? 'bg-[#C9A227]/12 text-[#C9A227] border border-[#C9A227]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={`transition-colors ${active ? 'text-[#C9A227]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                <NavIcon type={item.icon} />
              </span>
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A227]" />}
            </Link>
          )
        })}
        <div className="pt-3 border-t border-white/8 mt-3 space-y-1">
          {/* View own public profile on the client-facing site */}
          <Link href="/talk-to-lawyer" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span>My Public Profile</span>
          </Link>
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-400 hover:bg-white/5 transition-all">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            <span className="text-xs">LegalXOnline.com</span>
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-9 h-9 rounded-full bg-[#C9A227] flex items-center justify-center shrink-0">
            <span className="text-[#0A0D14] font-bold text-sm">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="text-slate-500 text-xs truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-[#0A0D14] border-r border-white/8 overflow-y-auto z-20">
        <Inner />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-[#0A0D14] border-b border-white/8 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <LXLogoMark height={32} className="text-white" />
          <span className="text-white font-bold text-[15px] leading-none tracking-tight">
            LegalX<span className="text-[#C9A227]">Online</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          <button onClick={() => setMobileOpen(v => !v)} className="text-slate-300 hover:text-white p-1">
            {mobileOpen
              ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line strokeLinecap="round" x1="18" y1="6" x2="6" y2="18"/><line strokeLinecap="round" x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line strokeLinecap="round" x1="3" y1="6" x2="21" y2="6"/><line strokeLinecap="round" x1="3" y1="12" x2="21" y2="12"/><line strokeLinecap="round" x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-40 w-72 bg-[#0A0D14] border-r border-white/8 overflow-y-auto"
            >
              <Inner />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
