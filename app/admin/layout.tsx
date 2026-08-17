'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LXLogoMark } from '@/components/ui/LXLogo'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X } from 'lucide-react'
import { apiLogout } from '@/lib/api'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Lawyer Approvals', href: '/admin/lawyers', icon: Users },
  { label: 'Service Orders', href: '/admin/orders', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await apiLogout() // Calls backend POST /api/auth/logout → clears HttpOnly cookies
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] flex">
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#D4AF37] rounded-md text-black"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-black/80 backdrop-blur-md border-r border-[#D4AF37]/20 z-40 flex flex-col transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 mb-10">
            <LXLogoMark className="text-[#D4AF37]" height={32} />
            <span className="font-serif text-[11px] tracking-[0.3em] font-medium text-white">LEGALX ADMIN</span>
          </Link>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/30"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={18}
                    className={`relative z-10 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400 group-hover:text-white'}`}
                  />
                  <span className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <div className="sticky top-0 w-full h-20 bg-gradient-to-b from-[#0A0D14] to-transparent z-10 pointer-events-none" />
        <div className="px-5 md:px-10 pb-20 -mt-12 relative z-20">
          {children}
        </div>
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
