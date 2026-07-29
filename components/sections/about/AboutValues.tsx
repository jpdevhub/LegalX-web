'use client'

import { StaggerParent, FadeUpChild, FadeUp } from '@/components/motion/MotionWrappers'

const VALUES = [
  {
    title: 'Transparency',
    desc: 'Clear pricing and honest legal services. No hidden fees, no surprises — every step of the process is visible to you.',
  },
  {
    title: 'Trust',
    desc: 'Building long-term relationships through reliability and professionalism. We treat every legal matter with the seriousness it deserves.',
  },
  {
    title: 'Innovation',
    desc: 'Using AI and modern technology to improve legal experiences — continuously evolving our platform to solve real-world legal challenges.',
  },
  {
    title: 'Accessibility',
    desc: 'Making legal help available to everyone regardless of location, background, or financial capability. Legal protection is a right, not a luxury.',
  },
  {
    title: 'Security',
    desc: 'Protecting user data with strong privacy and security standards. Your legal documents and personal information are always safe with us.',
  },
]

export function AboutValues() {
  return (
    <section className="py-20 md:py-28 bg-surface-soft" aria-labelledby="values-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <FadeUp className="mb-12">
          <span className="text-label-caps text-muted uppercase tracking-widest">Core Values</span>
          <h2
            id="values-heading"
            className="text-ink mt-2 text-balance"
            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.2 }}
          >
            Built on Unwavering Principles
          </h2>
        </FadeUp>

        <StaggerParent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {VALUES.map((value) => (
            <FadeUpChild key={value.title} className="flex flex-col gap-3 p-6 bg-white border border-hairline rounded-md">
              <h3 className="text-body-md font-semibold text-ink">{value.title}</h3>
              <p className="text-body-sm text-body-text leading-relaxed">{value.desc}</p>
            </FadeUpChild>
          ))}
        </StaggerParent>
      </div>
    </section>
  )
}
