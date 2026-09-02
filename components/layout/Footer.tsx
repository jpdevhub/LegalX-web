import Link from 'next/link'
import { LXLogoMark } from '@/components/ui/LXLogo'

const FOOTER_LINKS = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Awards', href: '/awards' },
    { label: 'Talk to a Lawyer', href: '/talk-to-lawyer' },
  ],
  services: [
    { label: 'Legal Services', href: '/documents' },
    { label: 'GST Registration', href: '/documents/gst-registration' },
    { label: 'FSSAI Food License', href: '/documents/fssai-registration' },
    { label: 'Trademark Registration', href: '/documents/trademark-registration' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Compliance', href: '/compliance' },
  ],
}

export function Footer() {
  return (
    <footer
      className="bg-white dark:bg-surface-dark border-t border-hairline dark:border-hairline-dark"
      aria-label="Site footer"
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-16 pt-16 pb-8">
        {/* Main grid: 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex flex-col items-start gap-3 mb-5" aria-label="LegalX home">
              <LXLogoMark height={48} className="text-ink dark:text-white" />
              <span className="font-serif text-[13px] tracking-[0.3em] font-medium text-ink dark:text-white ml-1">
                LEGALXONLINE
              </span>
            </Link>
            <p className="text-body-sm text-muted dark:text-slate-400 max-w-xs mb-5 leading-relaxed">
              India's trusted legal tech platform. Professional legal protection for individuals and businesses — fast, affordable, and authoritative.
            </p>

            {/* Indian contact info */}
            <address className="not-italic text-body-sm text-muted dark:text-slate-400 space-y-1.5">
              <div className="flex items-start gap-2">
                <LocationIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Nandlalpur, Kahalgaon, Bhagalpur, Bihar – 813222</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:contact@legalxonline.com" className="hover:text-primary transition-colors">
                  contact@legalxonline.com
                </a>
              </div>
            </address>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-label-caps text-ink dark:text-white uppercase tracking-widest mb-4 font-semibold">
              Company
            </h3>
            <nav aria-label="Company links">
              <ul className="space-y-2.5">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-muted dark:text-slate-400 hover:text-primary dark:hover:text-primary-dark transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-label-caps text-ink dark:text-white uppercase tracking-widest mb-4 font-semibold">
              Services
            </h3>
            <nav aria-label="Services links">
              <ul className="space-y-2.5">
                {FOOTER_LINKS.services.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-muted dark:text-slate-400 hover:text-primary dark:hover:text-primary-dark transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Legal & Trust */}
          <div>
            <h3 className="text-label-caps text-ink dark:text-white uppercase tracking-widest mb-4 font-semibold">
              Legal & Trust
            </h3>
            <nav aria-label="Legal links">
              <ul className="space-y-2.5">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-muted dark:text-slate-400 hover:text-primary dark:hover:text-primary-dark transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-hairline dark:border-hairline-dark pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-body-sm text-muted dark:text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} LegalX Technologies Pvt. Ltd. All rights reserved.
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-label-caps text-muted">
              <ShieldIcon className="w-4 h-4 text-primary" />
              SSL Secured
            </span>
            <span className="inline-flex items-center gap-1.5 text-label-caps text-muted">
              <VerifiedIcon className="w-4 h-4 text-primary" />
              MCA Registered
            </span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3" aria-label="Social media links">
            {[
              { label: 'LinkedIn', href: 'https://www.linkedin.com/company/legalx-online/', icon: <LinkedInIcon className="w-4 h-4" /> },
              { label: 'Instagram', href: 'https://www.instagram.com/legalxonline.official?igsh=NzB3aTJwOW11cDI2', icon: <InstagramIcon className="w-4 h-4" /> },
              { label: 'YouTube', href: 'https://youtube.com/@legalxonline?si=IXHjbnkBhzY0xu7l', icon: <YouTubeIcon className="w-4 h-4" /> },
            ].map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-sm flex items-center justify-center text-muted hover:text-primary hover:bg-surface-soft dark:hover:bg-surface-soft-dark transition-colors duration-150"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
          <div className="border-t border-hairline dark:border-white/10 px-5 md:px-16 py-4">
        <p className="max-w-[1400px] mx-auto text-[11px] text-muted leading-relaxed text-center">
          LegalXOnline provides legal information and connects users with independent advocates.
          Content in the Knowledge Center is general information, not legal advice, and does not
          create a lawyer–client relationship. Advocates listed here are independently practising
          professionals responsible for their own advice.
        </p>
      </div>
</footer>
  )
}

// Inline SVG icons
function GavelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
      <path d="M18 3L21 6L8 19L5 16L18 3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21L8 16" strokeLinecap="round" />
      <path d="M14 7L17 10" strokeLinecap="round" />
    </svg>
  )
}
function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" />
    </svg>
  )
}
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  )
}
