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
          <FadeUp delay={0.12} className="grid grid-cols-2 gap-4 lg:gap-5">
            <div className="col-span-1 row-span-2 flex flex-col justify-between bg-surface-soft border border-hairline rounded-md p-6 min-h-[220px]">
              <div>
                <span className="text-label-caps text-muted uppercase tracking-widest">Documents Processed</span>
                <div className="text-[40px] font-bold text-primary leading-tight mt-2">50k+</div>
                <p className="text-body-sm text-body-text mt-2 leading-snug">
                  Legal documents prepared, reviewed &amp; managed on our platform.
                </p>
              </div>
              <div className="mt-4 h-0.5 w-12 bg-primary rounded-full" aria-hidden />
            </div>

            <div className="col-span-1 flex flex-col justify-between bg-primary border border-primary rounded-md p-5 min-h-[100px]">
              <span className="text-label-caps text-white/70 uppercase tracking-widest">Verified Lawyers</span>
              <div className="text-[28px] font-bold text-white leading-tight mt-1">200+</div>
            </div>

            <div className="col-span-1 flex flex-col justify-between bg-white border border-hairline rounded-md p-5 min-h-[100px]">
              <span className="text-label-caps text-muted uppercase tracking-widest">Client Satisfaction</span>
              <div className="text-[28px] font-bold text-ink leading-tight mt-1">99.8%</div>
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  )
}
