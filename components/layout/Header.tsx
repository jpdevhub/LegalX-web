'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDarkMode } from '@/components/providers/DarkModeProvider'
import { Button } from '@/components/ui/Button'
import { LXLogoMark } from '@/components/ui/LXLogo'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Legal Documents', href: '/legal-documents' },
  { label: 'Legal Consultation', href: '/consultation' },
  { label: 'Business Law', href: '/business-law' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const pathname = usePathname()
  const { isDark, toggle } = useDarkMode()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

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
          {/* Logo — mark + wordmark side by side */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0"
            aria-label="LegalX home"
          >
            <LXLogoMark height={44} className="text-ink dark:text-white" />
            <span
              className="font-bold text-[20px] leading-none tracking-tight text-ink dark:text-white hidden sm:block"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              LegalX<span className="text-primary">Online</span>
            </span>
          </Link>

          {/* Desktop nav — center */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-sm text-body-sm font-medium',
                  'transition-colors duration-150',
                  'relative',
                  isActive(item.href)
                    ? 'text-primary font-semibold'
                    : 'text-body-text dark:text-slate-400 hover:text-ink dark:hover:text-white hover:bg-surface-soft dark:hover:bg-surface-soft-dark'
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
                {/* Active underline */}
                {isActive(item.href) && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                    aria-hidden
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={cn(
                'w-9 h-9 rounded-sm flex items-center justify-center',
                'text-body-text dark:text-slate-400',
                'hover:bg-surface-soft dark:hover:bg-surface-soft-dark',
                'transition-colors duration-150'
              )}
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* CTA button — desktop only */}
            <Button
              href="/request"
              variant="primary"
              size="sm"
              className="hidden lg:inline-flex"
            >
              Request a Document
            </Button>

            {/* Hamburger — mobile */}
            <button
              className={cn(
                'lg:hidden w-9 h-9 rounded-sm flex items-center justify-center',
                'text-body-text dark:text-slate-400',
                'hover:bg-surface-soft dark:hover:bg-surface-soft-dark',
                'transition-colors duration-150'
              )}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60] drawer-overlay lg:hidden',
          'transition-opacity duration-300',
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />

      {/* Drawer panel */}
      <aside
        className={cn(
          'fixed top-0 right-0 z-[70] h-full w-72 max-w-[85vw]',
          'bg-white dark:bg-surface-dark',
          'border-l border-hairline dark:border-hairline-dark',
          'shadow-xl',
          'flex flex-col',
          'transition-transform duration-300 ease-out',
          'lg:hidden',
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
      >
        {/* Drawer header */}
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

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Mobile navigation links">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 rounded-sm mb-1',
                'text-body-md font-medium transition-colors duration-150',
                isActive(item.href)
                  ? 'bg-primary/8 text-primary font-semibold'
                  : 'text-body-text dark:text-slate-400 hover:bg-surface-soft dark:hover:bg-surface-soft-dark'
              )}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-4 py-5 border-t border-hairline dark:border-hairline-dark flex-shrink-0">
          <Button href="/request" variant="primary" size="md" fullWidth>
            Request a Document
          </Button>
        </div>
      </aside>
    </>
  )
}

// Inline SVG icons — no extra deps needed
function GavelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18 3L21 6L8 19L5 16L18 3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21L8 16" strokeLinecap="round" />
      <path d="M14 7L17 10" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="5" strokeLinecap="round" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}
