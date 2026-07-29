'use client'

import { Button } from '@/components/ui/Button'
import { FadeUp } from '@/components/motion/MotionWrappers'

export function HomeCTABand() {
  return (
    <section
      className="bg-ink py-20 md:py-28"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left copy */}
          <FadeUp className="text-center md:text-left max-w-xl">
            <span className="text-label-caps text-white/40 uppercase tracking-widest">Get Started</span>
            <h2
              id="cta-heading"
              className="text-white text-balance mt-2"
              style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Secure your future today.
            </h2>
            <p className="text-white/60 text-body-md leading-relaxed mt-3">
              Registered Private Limited Company · DPIIT Startup India Recognised · Serving individuals and businesses across India.
            </p>
          </FadeUp>

          {/* Actions */}
          <FadeUp delay={0.15} className="flex flex-wrap gap-3 justify-center">
            <Button href="/request" variant="outline-white" size="md" className="min-w-[160px]">
              Get Started
            </Button>
            <Button href="/contact" variant="outline-white" size="md" className="min-w-[160px]">
              Talk to an Expert
            </Button>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
