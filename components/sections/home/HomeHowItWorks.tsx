'use client'

import { FadeUp, StaggerParent, FadeUpChild } from '@/components/motion/MotionWrappers'

const STEPS = [
  {
    number: '1',
    title: 'Choose Your Document',
    desc: 'Select from NDA, Rental Agreement, Power of Attorney, Will, or Partnership Deed.',
  },
  {
    number: '2',
    title: 'Fill in Your Details',
    desc: 'Answer a short set of questions. No legal knowledge required — plain language throughout.',
  },
  {
    number: '3',
    title: 'Review & Pay',
    desc: 'Preview the generated draft before paying. Transparent pricing, no hidden charges.',
  },
  {
    number: '4',
    title: 'Download Instantly',
    desc: 'Receive a professionally formatted, legally valid document ready for signing.',
  },
]

export function HomeHowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-labelledby="how-it-works-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <FadeUp className="mb-14 max-w-xl">
          <span className="text-label-caps text-primary uppercase tracking-widest">How It Works</span>
          <h2
            id="how-it-works-heading"
            className="text-ink mt-2"
            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.2 }}
          >
            Four steps to your legal document
          </h2>
        </FadeUp>

        {/* Steps row */}
        <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {STEPS.map((step, i) => (
            <FadeUpChild key={step.number}>
              <div className="relative flex flex-col gap-4 pr-8 pb-8 lg:pb-0">
                {/* Connector line between steps */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-5 left-[calc(2.5rem+1px)] right-0 h-px bg-hairline"
                    aria-hidden="true"
                  />
                )}
                {/* Step number circle */}
                <div className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center flex-shrink-0 bg-white relative z-10">
                  <span className="text-ink font-bold text-[15px]">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-display-md text-ink mb-1.5">{step.title}</h3>
                  <p className="text-body-sm text-body-text leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </FadeUpChild>
          ))}
        </StaggerParent>
      </div>
    </section>
  )
}
