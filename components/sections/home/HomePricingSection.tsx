'use client'

import { PricingTable } from '@/components/ui/PricingTable'
import { FadeUp } from '@/components/motion/MotionWrappers'

export function HomePricingSection() {
  return (
    <section
      className="py-20 md:py-28 bg-surface-soft"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <FadeUp className="max-w-3xl">
          <PricingTable title="Transparent Pricing" showViewAll />
        </FadeUp>
      </div>
    </section>
  )
}
