import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Legal Consultation',
  description:
    'Book a one-on-one consultation with a verified LegalX attorney. Get expert guidance on civil, corporate, or criminal matters — online or in-person.',
}

const PRACTICE_AREAS = [
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Corporate Law',
    desc: 'Mergers, acquisitions, company incorporation, shareholder agreements, and board governance.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Property & Real Estate',
    desc: 'Property disputes, rental agreements, sale deeds, title verification, and RERA compliance.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Family & Civil Law',
    desc: 'Divorce, custody, succession, will drafting, and civil dispute resolution.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Employment Law',
    desc: 'Wrongful termination, labour disputes, POSH compliance, and employment contracts.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Criminal Defence',
    desc: 'Bail applications, FIR quashing, trial representation, and criminal appeals.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Tax & GST Advisory',
    desc: 'Income tax planning, GST disputes, assessment representation, and appeal filings.',
  },
]

const CONSULTATION_TYPES = [
  {
    title: 'Quick Consultation',
    duration: '30 minutes',
    price: '₹499',
    desc: 'Get a concise legal opinion on a specific question. Ideal for understanding your rights or next steps.',
    features: ['Written summary emailed within 24h', 'Covers one legal issue', 'Video or phone call'],
  },
  {
    title: 'Standard Session',
    duration: '60 minutes',
    price: '₹999',
    desc: 'In-depth discussion with a senior attorney covering multiple aspects of your case.',
    features: ['Detailed written opinion', 'Document review included', 'Follow-up email Q&A', 'Video or phone call'],
    highlighted: true,
  },
  {
    title: 'Expert Review',
    duration: '90 minutes',
    price: '₹1,999',
    desc: 'Comprehensive legal strategy session with a specialist attorney and full case file review.',
    features: ['Full written legal opinion', 'Document & contract review', 'Action plan & next steps', 'Priority scheduling', '1 free follow-up call'],
  },
]

export default function ConsultationPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-soft py-16 md:py-24 border-b border-hairline">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="max-w-3xl">
            <span className="text-label-caps text-primary uppercase tracking-widest">Expert Advice</span>
            <h1
              className="text-ink text-balance mt-3"
              style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}
            >
              Talk to a Verified Attorney — On Your Terms.
            </h1>
            <p className="text-body-md text-body-text max-w-2xl mt-4 leading-relaxed">
              Whether you need a quick legal opinion or a full case strategy, LegalX connects you with verified, experienced attorneys across all practice areas. Book online in under 2 minutes.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button href="/request" variant="primary" size="md">
                Book a Consultation
              </Button>
              <Button href="/contact" variant="secondary" size="md">
                Talk to Us First
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Practice areas */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="mb-10">
            <span className="text-label-caps text-primary uppercase tracking-widest">Areas of Expertise</span>
            <h2
              className="text-ink mt-2 text-balance"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Find the Right Specialist
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ gridAutoRows: '1fr' }}>
            {PRACTICE_AREAS.map((area) => (
              <Card key={area.title} hover padding="lg" className="flex flex-col gap-3 h-full">
                <div className="w-10 h-10 rounded-sm bg-primary/8 flex items-center justify-center flex-shrink-0">
                  {area.icon}
                </div>
                <h3 className="text-display-md text-ink">{area.title}</h3>
                <p className="text-body-sm text-body-text leading-relaxed flex-1">{area.desc}</p>
                <Link
                  href="/request"
                  className="text-body-sm text-primary font-semibold hover:underline mt-1 inline-flex items-center gap-1 group"
                >
                  Book session
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="py-16 md:py-24 bg-surface-soft border-t border-hairline">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="text-center mb-12">
            <span className="text-label-caps text-primary uppercase tracking-widest">Pricing</span>
            <h2
              className="text-ink mt-2"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Simple, Transparent Rates
            </h2>
            <p className="text-body-md text-body-text mt-2 max-w-xl mx-auto">
              No hidden fees. Pay only for the time you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" style={{ gridAutoRows: '1fr' }}>
            {CONSULTATION_TYPES.map((plan) => (
              <div
                key={plan.title}
                className={`flex flex-col rounded-md border-2 p-7 h-full ${
                  plan.highlighted
                    ? 'border-primary bg-primary text-white'
                    : 'border-hairline bg-white'
                }`}
              >
                <div className="flex-1">
                  <p className={`text-label-caps uppercase tracking-widest mb-1 ${plan.highlighted ? 'text-white/70' : 'text-muted'}`}>
                    {plan.duration}
                  </p>
                  <h3 className={`text-display-lg mb-1 ${plan.highlighted ? 'text-white' : 'text-ink'}`}>
                    {plan.title}
                  </h3>
                  <div className={`text-[32px] font-bold mb-3 ${plan.highlighted ? 'text-white' : 'text-primary'}`}>
                    {plan.price}
                  </div>
                  <p className={`text-body-sm leading-relaxed mb-5 ${plan.highlighted ? 'text-white/80' : 'text-body-text'}`}>
                    {plan.desc}
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-body-sm ${plan.highlighted ? 'text-white/90' : 'text-body-text'}`}>
                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-primary'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                  <Button
                    href="/request"
                    variant={plan.highlighted ? 'outline-white' : 'primary'}
                    size="md"
                    fullWidth
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 bg-white border-t border-hairline">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="text-center mb-10">
            <span className="text-label-caps text-primary uppercase tracking-widest">Process</span>
            <h2 className="text-ink mt-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Select a plan', desc: 'Choose the consultation duration that fits your need.' },
              { step: '02', title: 'Fill details', desc: 'Tell us about your legal matter so we match you with the right specialist.' },
              { step: '03', title: 'Confirm & pay', desc: 'Securely pay online. Instant booking confirmation via email.' },
              { step: '04', title: 'Meet your attorney', desc: 'Join your video or phone session at the scheduled time.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3 p-6 rounded-md bg-surface-soft border border-hairline">
                <span className="text-[32px] font-bold text-primary/20 leading-none">{item.step}</span>
                <h3 className="text-display-md text-ink">{item.title}</h3>
                <p className="text-body-sm text-body-text leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
