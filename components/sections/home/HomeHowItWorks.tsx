'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    number: '01',
    title: 'Choose Your Document',
    desc: 'Select from NDA, Rental Agreement, Power of Attorney, Will, or Partnership Deed.',
  },
  {
    number: '02',
    title: 'Fill in Your Details',
    desc: 'Answer a short set of questions. No legal knowledge required — plain language throughout.',
  },
  {
    number: '03',
    title: 'Review & Pay',
    desc: 'Preview the generated draft before paying. Transparent pricing, no hidden charges.',
  },
  {
    number: '04',
    title: 'Download Instantly',
    desc: 'Receive a professionally formatted, legally valid document ready for signing.',
  },
]

export function HomeHowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-labelledby="how-it-works-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <motion.div
          className="mb-14 max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-label-caps text-muted uppercase tracking-widest">How It Works</span>
          <h2
            id="how-it-works-heading"
            className="text-ink mt-2"
            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.2 }}
          >
            Four steps to your legal document
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
              }}
              className="flex flex-col gap-3"
            >
              <span
                className="text-muted font-bold leading-none select-none"
                style={{ fontSize: '40px', fontVariantNumeric: 'tabular-nums' }}
                aria-hidden
              >
                {step.number}
              </span>
              <h3 className="text-body-md font-semibold text-ink">{step.title}</h3>
              <p className="text-body-sm text-body-text leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
