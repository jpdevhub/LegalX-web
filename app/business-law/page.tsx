import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Business Law',
  description:
    'Comprehensive business law services for startups, SMEs, and enterprises — company registration, contracts, compliance, IP protection, and more.',
}

const SERVICES = [
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 21h18M9 8h1m4 0h1M9 12h1m4 0h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Company Incorporation',
    desc: 'Private Limited, LLP, OPC, or Sole Proprietorship — register your business the right way with MCA compliance.',
    price: 'From ₹6,999',
    href: '/request?doc=company',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Trademark Registration',
    desc: 'Protect your brand identity with trademark registration across all classes. Pan-India and international filing.',
    price: 'From ₹2,999',
    href: '/request?doc=trademark',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
        <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
      </svg>
    ),
    title: 'Contract Drafting & Review',
    desc: 'Vendor agreements, client contracts, SLAs, co-founder agreements — drafted by experienced corporate attorneys.',
    price: 'From ₹1,999',
    href: '/request?doc=nda',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <line x1="12" y1="2" x2="12" y2="22" strokeLinecap="round" />
        <path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'GST & Tax Compliance',
    desc: 'GST registration, monthly/quarterly filing, ITR for businesses, tax planning, and assessment representation.',
    price: 'From ₹499',
    href: '/request',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Regulatory Compliance',
    desc: 'FSSAI, MSME, Startup India, Shops & Establishment registration, and ongoing compliance management.',
    price: 'From ₹999',
    href: '/request',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'POSH & HR Compliance',
    desc: 'Internal Complaints Committee setup, POSH policy drafting, HR manual, and employment contracts.',
    price: 'From ₹4,999',
    href: '/request',
  },
]

const STATS = [
  { value: '5,000+', label: 'Businesses Served' },
  { value: '98%', label: 'MCA First-Time Approval' },
  { value: '72 hrs', label: 'Avg. Registration Time' },
  { value: '40+', label: 'Compliance Domains' },
]

export default function BusinessLawPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-16 md:py-24 border-b border-hairline">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <span className="text-label-caps text-primary uppercase tracking-widest">Business Law</span>
              <h1
                className="text-ink text-balance mt-3"
                style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}
              >
                Legal Infrastructure for Every Stage of Your Business.
              </h1>
              <p className="text-body-md text-body-text max-w-lg mt-4 leading-relaxed">
                From incorporation to exit — LegalX provides the full spectrum of business law services your company needs to stay compliant, protected, and primed for growth.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button href="/request" variant="primary" size="md">
                  Get Started
                </Button>
                <Button href="/consultation" variant="secondary" size="md">
                  Speak to a Business Lawyer
                </Button>
              </div>
            </div>

            {/* Right — stat grid */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 p-6 rounded-md bg-surface-soft border border-hairline"
                >
                  <span className="text-[32px] font-bold text-primary leading-none">{stat.value}</span>
                  <span className="text-body-sm text-body-text">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 md:py-24 bg-surface-soft">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="mb-10">
            <span className="text-label-caps text-primary uppercase tracking-widest">Our Services</span>
            <h2
              className="text-ink mt-2 text-balance"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Everything Your Business Needs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ gridAutoRows: '1fr' }}>
            {SERVICES.map((service) => (
              <Card key={service.title} hover padding="lg" className="flex flex-col gap-3 h-full">
                <div className="w-10 h-10 rounded-sm bg-primary/8 flex items-center justify-center flex-shrink-0">
                  {service.icon}
                </div>
                <h3 className="text-display-md text-ink">{service.title}</h3>
                <p className="text-body-sm text-body-text leading-relaxed flex-1">{service.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-body-sm font-semibold text-primary">{service.price}</span>
                  <Link
                    href={service.href}
                    className="text-label-caps text-primary hover:underline group inline-flex items-center gap-1"
                  >
                    Start
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why LegalX for business */}
      <section className="py-16 md:py-20 bg-white border-t border-hairline">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <span className="text-label-caps text-primary uppercase tracking-widest">Why LegalX</span>
              <h2
                className="text-ink mt-2 text-balance"
                style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}
              >
                Built for Founders, Not Just Lawyers.
              </h2>
              <p className="text-body-md text-body-text mt-4 leading-relaxed">
                We understand that business founders need speed, clarity, and cost predictability. Every service on LegalX is designed to be completed online, with fixed pricing and expert attorneys who speak plain language.
              </p>
              <div className="mt-6">
                <Button href="/contact" variant="primary" size="md">
                  Speak to Our Business Team
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Fixed, Transparent Pricing', desc: 'No surprise bills. Every service has a clear, upfront cost displayed before you commit.' },
                { title: 'MCA & ROC Expert Team', desc: 'Our specialists have filed 5,000+ company registrations with a 98% first-time approval rate.' },
                { title: 'End-to-End Management', desc: 'We handle everything from document preparation to government portal submission.' },
                { title: 'Post-Registration Support', desc: 'Ongoing compliance reminders, annual filing assistance, and director KYC management.' },
              ].map((point) => (
                <div key={point.title} className="flex gap-4 p-5 rounded-md border border-hairline bg-surface-soft">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-display-md text-ink">{point.title}</h3>
                    <p className="text-body-sm text-body-text mt-1 leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-primary py-14 md:py-16">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-white text-balance" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}>
              Ready to incorporate or protect your business?
            </h2>
            <p className="text-white/80 text-body-md mt-1">
              Get started in minutes — expert team on standby.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button href="/request" variant="outline-white" size="md" className="min-w-[160px]">
              Start Registration
            </Button>
            <Button href="/consultation" variant="outline-white" size="md" className="min-w-[160px]">
              Book a Lawyer
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
