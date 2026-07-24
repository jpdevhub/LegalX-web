'use client'

import { Button } from '@/components/ui/Button'
import { FadeUp } from '@/components/motion/MotionWrappers'

export function HomeHero() {
  return (
    <section
      className="bg-white py-20 md:py-28 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-center">

          {/* Left column */}
          <FadeUp className="flex flex-col gap-7">
            <div className="inline-flex items-center gap-2 text-label-caps text-primary bg-primary/8 border border-primary/20 rounded-full px-4 py-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
              Trusted Legal Services Online
            </div>

            <h1
              id="hero-heading"
              className="text-ink text-balance"
              style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.12 }}
            >
              Making Legal Services{' '}
              <span className="text-primary">Simple, Affordable</span>{' '}
              &amp; Accessible
            </h1>

            <p className="text-body-md text-body-text max-w-lg leading-relaxed">
              LegalX makes legal services simple, affordable, and accessible for every Indian. From business registrations to expert legal consultation — handled online by qualified professionals.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button href="/documents" variant="primary" size="md">
                Get Started
              </Button>
              <Button href="/talk-to-lawyer" variant="secondary" size="md">
                Talk to a Lawyer
              </Button>
            </div>
          </FadeUp>

          {/* Right column — stat cards */}
          <FadeUp delay={0.12} className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            {/* Card 1 */}
            <div className="flex flex-col bg-surface-soft border border-hairline rounded-md p-5 lg:p-6">
              <span className="text-label-caps text-muted uppercase tracking-widest mb-1.5">Launch Offer</span>
              <div className="text-display-md font-bold text-ink leading-tight mb-2">Flat 20% Off</div>
              <p className="text-body-sm text-body-text leading-snug mt-auto">
                On your first document or registration with LegalX.
              </p>
            </div>

            {/* Card 2 - Gold Accent */}
            <div className="flex flex-col bg-primary border border-primary rounded-md p-5 lg:p-6 shadow-elevated">
              <span className="text-label-caps text-white/80 uppercase tracking-widest mb-1.5">Professionals</span>
              <div className="text-display-md font-bold text-white leading-tight mb-2">CA &amp; Advocate Verified</div>
              <p className="text-body-sm text-white/90 leading-snug mt-auto">
                Every document is prepared and signed off by a licensed professional, not a template bot.
              </p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col bg-white border border-hairline rounded-md p-5 lg:p-6 shadow-sm">
              <span className="text-label-caps text-muted uppercase tracking-widest mb-1.5">Turnaround</span>
              <div className="text-display-md font-bold text-ink leading-tight mb-2">24–48 Hrs</div>
              <p className="text-body-sm text-body-text leading-snug mt-auto">
                Most drafts and filings are ready within a day of receiving your details.
              </p>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col bg-white border border-hairline rounded-md p-5 lg:p-6 shadow-sm">
              <span className="text-label-caps text-muted uppercase tracking-widest mb-1.5">Pricing</span>
              <div className="text-display-md font-bold text-ink leading-tight mb-2">Zero Hidden Charges</div>
              <p className="text-body-sm text-body-text leading-snug mt-auto">
                Government fee and professional fee always shown separately, upfront.
              </p>
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  )
}
