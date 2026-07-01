'use client'

import { Button } from '@/components/ui/Button'
import { FadeUp } from '@/components/motion/MotionWrappers'

export function AboutCTABand() {
  return (
    <section className="bg-ink py-16 md:py-20" aria-labelledby="about-cta-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <FadeUp className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left max-w-2xl">
            <h2
              id="about-cta-heading"
              className="text-white text-balance"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Ready to transform your legal workflow?
            </h2>
            <p className="text-white/70 text-body-md mt-2 leading-relaxed">
              Whether you are an individual seeking legal guidance, a startup navigating compliance, or a business managing legal documentation — LegalX is committed to delivering secure, reliable, and user-centric solutions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center flex-shrink-0">
            <Button href="/request" variant="outline-white" size="md" className="min-w-[160px]">
              Get Started
            </Button>
            <Button href="/consultation" variant="outline-white" size="md" className="min-w-[160px]">
              Hire a Lawyer
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
