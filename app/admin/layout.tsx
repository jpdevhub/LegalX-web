'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LXLogoMark } from '@/components/ui/LXLogo'
import {
  LayoutDashboard, Users, UserCircle, Wallet, ShieldAlert,
  FileText, BarChart3, Newspaper, ScrollText, LogOut, Menu, X,
} from 'lucide-react'
import { apiLogout, apiGetMe, apiGetAdminStats, type AuthUser } from '@/lib/api'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin',               icon: LayoutDashboard },
  { label: 'Lawyers',   href: '/admin/lawyers',       icon: Users, badge: 'pending' as const },
  { label: 'Clients',   href: '/admin/clients',       icon: UserCircle },
  { label: 'Payouts',   href: '/admin/payouts',       icon: Wallet },
  { label: 'Disputes',  href: '/admin/disputes',      icon: ShieldAlert },
  { label: 'Documents', href: '/admin/documents',     icon: FileText },
  { label: 'Analytics', href: '/admin/analytics',     icon: BarChart3 },
  { label: 'Content',   href: '/admin/content',       icon: Newspaper },
  { label: 'Audit Log', href: '/admin/audit-log',     icon: ScrollText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checking, setChecking] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  const pathname = usePathname()
  const router = useRouter()

  // Role gate. The backend enforces admin on every /api/admin route, so this is
  // about not rendering a portal the user can't use — not the security boundary.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const me = await apiGetMe()
      if (cancelled) return
      if (!me) {
        router.replace('/login?redirect_to=/admin')
        return
      }
      if (me.role !== 'admin') {
        router.replace('/')
        return
      }
      setUser(me)
      setChecking(false)
    })()
    return () => { cancelled = true }
  }, [router])

  // Pending badge, refreshed on navigation so it reflects approvals just made.
  const refreshPending = useCallback(async () => {
    try {
      const stats = await apiGetAdminStats()
      setPendingCount(stats.pendingApprovals)
    } catch {
      // Badge is decorative — a failure here must not break the shell.
    }
  }, [])

  useEffect(() => {
    if (!checking) refreshPending()
  }, [checking, pathname, refreshPending])

  useEffect(() => { setIsMobileMenuOpen(false) }, [pathname])

  const handleLogout = async () => {
    await apiLogout()
    router.push('/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="w-4 h-4 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
          Verifying access…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] flex">
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#C9A227] rounded-md text-[#0A0D14]"
        onClick={() => setIsMobileMenuOpen(v => !v)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed md:sticky top-0 h-screen w-64 shrink-0 bg-black/80 backdrop-blur-md border-r border-[#C9A227]/20 z-40 flex flex-col transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-2.5 mb-9">
            <LXLogoMark className="text-[#C9A227]" height={32} />
            <span className="leading-tight">
              <span className="block font-bold text-[15px] text-white tracking-tight">LegalX</span>
              <span className="block text-[10px] tracking-[0.22em] text-[#C9A227] font-semibold">
                ADMIN PANEL
              </span>
            </span>
          </Link>

          <nav className="space-y-1">
            {NAV_ITEMS.map(item => {
              // Exact match for /admin, prefix match for the rest, so
              // /admin/lawyers/<id> keeps the Lawyers item highlighted.
              const isActive =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
              const Icon = item.icon
              const showBadge = item.badge === 'pending' && pendingCount > 0

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="adminActiveTab"
                      className="absolute inset-0 bg-[#C9A227]/10 rounded-lg border border-[#C9A227]/30"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={17}
                    className={`relative z-10 shrink-0 ${isActive ? 'text-[#C9A227]' : 'text-slate-400 group-hover:text-white'}`}
                  />
                  <span className={`relative z-10 flex-1 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                  {showBadge && (
                    <span className="relative z-10 min-w-[20px] h-5 px-1.5 rounded-full bg-[#C9A227] text-[#0A0D14] text-[11px] font-bold flex items-center justify-center tabular-nums">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/8">
          <div className="px-2 pb-3">
            <p className="text-sm font-semibold text-white truncate">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Admin'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <div className="px-5 md:px-8 py-8 md:py-10 pb-20">{children}</div>
      </main>

      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
