'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDarkMode } from '@/components/providers/DarkModeProvider'
import { Button } from '@/components/ui/Button'
import { LXLogoMark } from '@/components/ui/LXLogo'
import { cn } from '@/lib/utils'
import { apiGetMe, apiLogout, type AuthUser } from '@/lib/api'

const NAV_ITEMS = [
  { label: 'Home',             href: '/' },
  { label: 'Documents',        href: '/documents' },
  { label: 'Talk to a Lawyer', href: '/talk-to-lawyer' },
  { label: 'Awards',           href: '/awards' },
  { label: 'About Us',         href: '/about' },
]

export function Header() {
  const pathname = usePathname()
  const router   = useRouter()
  const { isDark, toggle } = useDarkMode()

  const [scrolled,     setScrolled]     = useState(false)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [user,         setUser]         = useState<AuthUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [authLoading,  setAuthLoading]  = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // Re-check auth on every route change
  useEffect(() => {
    let cancelled = false
    apiGetMe().then((u) => {
      if (!cancelled) { setUser(u); setAuthLoading(false) }
    })
    return () => { cancelled = true }
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    await apiLogout()
    setUser(null)
    setUserMenuOpen(false)
    router.push('/')
  }

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : ''

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full',
          'bg-white dark:bg-surface-dark',
          'border-b border-hairline dark:border-hairline-dark',
          'transition-shadow duration-200',
          scrolled && 'shadow-header'
        )}
        role="banner"
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-16 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="LegalX home">
            <LXLogoMark height={44} className="text-ink dark:text-white" />
            <span className="font-bold text-[20px] leading-none tracking-tight text-ink dark:text-white hidden sm:block" style={{ fontFamily: 'var(--font-sans)' }}>
              LegalX<span className="text-primary">Online</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 text-body-sm font-medium transition-colors duration-150',
                  isActive(item.href)
                    ? 'text-ink dark:text-white font-semibold'
                    : 'text-body-text dark:text-slate-400 hover:text-ink dark:hover:text-white'
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-sm flex items-center justify-center text-body-text dark:text-slate-400 hover:bg-surface-soft dark:hover:bg-surface-soft-dark transition-colors duration-150"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* Auth — skeleton while loading */}
            {authLoading ? (
              <div className="hidden sm:flex gap-2">
                <div className="h-8 w-16 rounded-md bg-surface-soft dark:bg-white/10 animate-pulse" />
                <div className="h-8 w-20 rounded-md bg-primary/20 animate-pulse rounded-md" />
              </div>
            ) : user ? (
              /* Authenticated: avatar + dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-surface-soft dark:hover:bg-white/5 transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                    {initials || <UserIcon className="w-4 h-4" />}
                  </span>
                  <span className="hidden md:block text-body-sm font-medium text-ink dark:text-white max-w-[100px] truncate">
                    {user.firstName}
                  </span>
                  <ChevronIcon className={cn('w-4 h-4 text-muted transition-transform duration-200', userMenuOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-52 z-50 rounded-xl shadow-xl bg-white dark:bg-[#12151e] border border-hairline dark:border-white/10 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-hairline dark:border-white/10">
                        <p className="text-[13px] font-semibold text-ink dark:text-white truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-muted truncate">{user.email}</p>
                        <span className={cn(
                          'inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
                          user.role === 'admin'  ? 'bg-primary/15 text-primary' :
                          user.role === 'lawyer' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                   'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        )}>
                          {user.role}
                        </span>
                      </div>
                      <div className="py-1.5">
                        {user.role === 'admin' && (
                          <DropdownItem href="/admin" onClick={() => setUserMenuOpen(false)} icon={<GridIcon />}>Admin Panel</DropdownItem>
                        )}
                        {user.role === 'lawyer' ? (
                          <>
                            <DropdownItem href="/lawyer-dashboard" onClick={() => setUserMenuOpen(false)} icon={<GridIcon />}>My Portal</DropdownItem>
                            <DropdownItem href="/lawyer-dashboard/consultations" onClick={() => setUserMenuOpen(false)} icon={<ClockIcon />}>My Consultations</DropdownItem>
                            <DropdownItem href="/lawyer-dashboard/documents" onClick={() => setUserMenuOpen(false)} icon={<FileIcon />}>My Documents</DropdownItem>
                            <DropdownItem href="/lawyer-dashboard/payouts" onClick={() => setUserMenuOpen(false)} icon={<FileIcon />}>My Payouts</DropdownItem>
                          </>
                        ) : user.role !== 'admin' ? (
                          <>
                            <DropdownItem href="/talk-to-lawyer" onClick={() => setUserMenuOpen(false)} icon={<ClockIcon />}>Talk to a Lawyer</DropdownItem>
                            <DropdownItem href="/documents" onClick={() => setUserMenuOpen(false)} icon={<FileIcon />}>Documents</DropdownItem>
                          </>
                        ) : null}
                      </div>
                      <div className="border-t border-hairline dark:border-white/10 py-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <LogoutIcon className="w-4 h-4 flex-shrink-0" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Not authenticated */
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-body-sm font-medium text-ink dark:text-white hover:bg-surface-soft dark:hover:bg-white/5 transition-colors duration-150"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-body-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors duration-150"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button
              className="lg:hidden w-9 h-9 rounded-sm flex items-center justify-center text-body-text dark:text-slate-400 hover:bg-surface-soft dark:hover:bg-surface-soft-dark transition-colors duration-150"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60] drawer-overlay lg:hidden transition-opacity duration-300',
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 z-[70] h-full w-72 max-w-[85vw] flex flex-col',
          'bg-white dark:bg-surface-dark border-l border-hairline dark:border-hairline-dark shadow-xl',
          'transition-transform duration-300 ease-out lg:hidden',
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-hairline dark:border-hairline-dark flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <LXLogoMark height={36} className="text-ink dark:text-white" />
            <span className="font-bold text-[18px] leading-none tracking-tight text-ink dark:text-white">
              LegalX<span className="text-primary">Online</span>
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
            className="w-9 h-9 rounded-sm flex items-center justify-center text-muted hover:bg-surface-soft dark:hover:bg-surface-soft-dark transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Mobile navigation links">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={cn(
                'flex items-center px-4 py-3 rounded-sm mb-1 text-body-md font-medium transition-colors duration-150',
                isActive(item.href)
                  ? 'bg-primary/8 text-primary font-semibold'
                  : 'text-body-text dark:text-slate-400 hover:bg-surface-soft dark:hover:bg-surface-soft-dark'
              )}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile auth section */}
          <div className="mt-4 border-t border-hairline dark:border-white/10 pt-4">
            {!authLoading && user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                  <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-ink dark:text-white truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-[11px] text-muted capitalize">{user.role}</p>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setDrawerOpen(false)}
                    className="flex items-center px-4 py-3 rounded-sm mb-1 text-body-md font-medium text-body-text dark:text-slate-400 hover:bg-surface-soft dark:hover:bg-surface-soft-dark transition-colors">
                    Admin Panel
                  </Link>
                )}
                {user.role === 'lawyer' && (
                  <>
                    <Link href="/lawyer-dashboard" onClick={() => setDrawerOpen(false)}
                      className="flex items-center px-4 py-3 rounded-sm mb-1 text-body-md font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                      My Portal
                    </Link>
                    <Link href="/lawyer-dashboard/consultations" onClick={() => setDrawerOpen(false)}
                      className="flex items-center px-4 py-3 rounded-sm mb-1 text-body-md font-medium text-body-text dark:text-slate-400 hover:bg-surface-soft dark:hover:bg-surface-soft-dark transition-colors">
                      My Consultations
                    </Link>
                    <Link href="/lawyer-dashboard/documents" onClick={() => setDrawerOpen(false)}
                      className="flex items-center px-4 py-3 rounded-sm mb-1 text-body-md font-medium text-body-text dark:text-slate-400 hover:bg-surface-soft dark:hover:bg-surface-soft-dark transition-colors">
                      My Documents
                    </Link>
                  </>
                )}
                <button
                  onClick={() => { handleLogout(); setDrawerOpen(false) }}
                  className="w-full flex items-center px-4 py-3 rounded-sm text-body-md font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : !authLoading ? (
              <div className="flex flex-col gap-2 px-2">
                <Link href="/login" onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-md border border-hairline dark:border-white/20 text-body-sm font-medium text-ink dark:text-white hover:bg-surface-soft dark:hover:bg-white/5 transition-colors">
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-md bg-primary text-white text-body-sm font-semibold hover:bg-primary-hover transition-colors">
                  Sign up free
                </Link>
              </div>
            ) : null}
          </div>
        </nav>

        {!user && !authLoading && (
          <div className="px-4 py-5 border-t border-hairline dark:border-hairline-dark flex-shrink-0">
            <Button href="/documents" variant="primary" size="md" fullWidth>Our Services</Button>
          </div>
        )}
      </aside>
    </>
  )
}

// ── Dropdown item ─────────────────────────────────────────────────────────────
function DropdownItem({ href, onClick, icon, children }: { href: string; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-body-text dark:text-slate-300 hover:bg-surface-soft dark:hover:bg-white/5 hover:text-ink dark:hover:text-white transition-colors">
      <span className="w-4 h-4 text-muted flex-shrink-0">{icon}</span>
      {children}
    </Link>
  )
}

// ── SVG icons (all have suppressHydrationWarning for DarkReader compat) ───────
function MoonIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function SunIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><circle cx="12" cy="12" r="5" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" /></svg>
}
function MenuIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" /></svg>
}
function CloseIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
}
function UserIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" /><circle cx="12" cy="7" r="4" /></svg>
}
function ChevronIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" /><polyline points="16 17 21 12 16 7" strokeLinecap="round" /><line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" /></svg>
}
function GridIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" /></svg>
}
function FileIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" strokeLinecap="round" /><line x1="9" y1="17" x2="15" y2="17" strokeLinecap="round" /></svg>
}
