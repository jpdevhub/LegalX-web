'use client'

import { FadeUp, StaggerParent, FadeUpChild } from '@/components/motion/MotionWrappers'

const WHY_ITEMS = [
  { label: 'Qualified legal professionals' },
  { label: 'Verified legal professionals' },
  { label: 'Secure document management' },
  { label: 'Affordable, transparent pricing' },
  { label: 'Faster turnaround time' },
  { label: 'User-friendly platform' },
  { label: 'Accessible from anywhere' },
  { label: 'End-to-end digital process' },
]

const TRUST_PILLARS = [
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Accessible',
    desc: 'Legal services available to everyone regardless of location — fully online, fully digital.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Secure',
    desc: 'Your data is protected with strong privacy standards and encrypted document management.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Fast & Online',
    desc: 'Complete your legal service from anywhere — no office visits, no paperwork queues.',
  },
]

export function HomeTrustBand() {
  return (
    <section className="bg-surface-soft py-16 md:py-24" aria-labelledby="trust-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">

        {/* Two-column: mission + why choose */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-16">
          <FadeUp>
            <span className="text-label-caps text-primary uppercase tracking-widest">Who We Are</span>
            <h2
              id="trust-heading"
              className="text-ink mt-2 text-balance"
              style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              A digital-first legal ecosystem built for modern India.
            </h2>
            <p className="text-body-md text-body-text mt-4 leading-relaxed">
              At LegalXOnline Private Limited, we are on a mission to make legal services accessible, affordable, and technology-driven for everyone. By combining Artificial Intelligence, modern software engineering, and legal expertise, we are building a platform that simplifies legal information, streamlines documentation, and connects individuals and businesses with trusted legal professionals.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <span className="text-label-caps text-primary uppercase tracking-widest">Why Choose LegalX</span>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WHY_ITEMS.map((item) => (
                <div key={item.label} className="flex items-start gap-2.5 py-2">
                  <div className="w-5 h-5 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-body-sm text-body-text">{item.label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        {/* Three trust pillars */}
        <StaggerParent className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TRUST_PILLARS.map((p) => (
            <FadeUpChild key={p.title}>
              <div className="flex flex-col gap-3 p-6 bg-white rounded-md border border-hairline h-full">
                <div className="w-10 h-10 rounded-sm bg-primary/8 flex items-center justify-center flex-shrink-0">
                  {p.icon}
                </div>
                <h3 className="text-display-md text-ink">{p.title}</h3>
                <p className="text-body-sm text-body-text leading-relaxed">{p.desc}</p>
              </div>
            </FadeUpChild>
          ))}
        </StaggerParent>

      </div>
    </section>
  )
}
