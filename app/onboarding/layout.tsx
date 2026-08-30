// Onboarding layout — same logo as main site, minimal header, no nav, no footer.
// Lawyers complete their profile in a focused flow before accessing the portal.
import Link from 'next/link'
import { LXLogoMark } from '@/components/ui/LXLogo'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080B12]">
      {/* Header — identical logo to main site, minimal nav */}
      <header className="sticky top-0 z-30 bg-[#080B12]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Same logo markup as Header.tsx */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="LegalX home">
            <LXLogoMark height={40} className="text-white" />
            <span className="font-bold text-[20px] leading-none tracking-tight text-white hidden sm:block" style={{ fontFamily: 'var(--font-sans)' }}>
              LegalX<span className="text-[#C9A227]">Online</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs hidden sm:block">Lawyer Onboarding</span>
            <Link
              href="/lawyer-dashboard"
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
