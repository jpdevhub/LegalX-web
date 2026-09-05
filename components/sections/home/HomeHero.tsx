'use client'

import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

export function HomeHero() {
  return (
    <section
      className="bg-white py-20 md:py-28 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <motion.div
            className="flex flex-col gap-7"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1
              id="hero-heading"
              className="text-ink text-balance"
              style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.1 }}
            >
              Making Legal Services{' '}
              <span className="text-primary">Simple, Affordable</span>{' '}
              &amp; Accessible
            </h1>

            <p className="text-body-md text-body-text max-w-lg leading-relaxed">
              LegalXOnline makes legal services simple, affordable, and accessible for every Indian. From business registrations to expert legal consultation — handled online by qualified professionals.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button href="/documents" variant="primary" size="md">
                Get Started
              </Button>
              <Button href="/talk-to-lawyer" variant="secondary" size="md">
                Talk to a Lawyer
              </Button>
            </div>
          </motion.div>

          {/* Right column — stat cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {[
              {
                tag: 'Launch Offer',
                title: 'Flat 20% Off',
                desc: 'On your first document or registration with LegalX.',
                bg: 'bg-surface-soft border border-hairline',
                tagColor: 'text-muted',
                titleColor: 'text-ink',
                descColor: 'text-body-text',
              },
              {
                tag: 'Professionals',
                title: 'CA & Advocate Verified',
                desc: 'Every document is prepared and signed off by a licensed professional, not a template bot.',
                bg: 'bg-primary',
                tagColor: 'text-white/75',
                titleColor: 'text-white',
                descColor: 'text-white/85',
              },
              {
                tag: 'Turnaround',
                title: '24–48 Hrs',
                desc: 'Most drafts and filings are ready within a day of receiving your details.',
                bg: 'bg-white border border-hairline',
                tagColor: 'text-muted',
                titleColor: 'text-ink',
                descColor: 'text-body-text',
              },
              {
                tag: 'Pricing',
                title: 'Zero Hidden Charges',
                desc: 'Government fee and professional fee always shown separately, upfront.',
                bg: 'bg-white border border-hairline',
                tagColor: 'text-muted',
                titleColor: 'text-ink',
                descColor: 'text-body-text',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                }}
                className={`flex flex-col rounded-md p-5 lg:p-6 ${card.bg}`}
              >
                <span className={`text-label-caps uppercase tracking-widest mb-1.5 ${card.tagColor}`}>
                  {card.tag}
                </span>
                <div className={`text-display-md font-bold leading-tight mb-2 ${card.titleColor}`}>
                  {card.title}
                </div>
                <p className={`text-body-sm leading-snug mt-auto ${card.descColor}`}>
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
