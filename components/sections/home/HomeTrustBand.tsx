'use client'

import { motion } from 'framer-motion'

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
    title: 'Accessible',
    desc: 'Legal services available to everyone regardless of location — fully online, fully digital.',
  },
  {
    title: 'Secure',
    desc: 'Your data is protected with strong privacy standards and encrypted document management.',
  },
  {
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="text-label-caps text-muted uppercase tracking-widest">Who We Are</span>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <span className="text-label-caps text-muted uppercase tracking-widest">Why Choose LegalX</span>
            <div className="mt-4 divide-y divide-hairline border-t border-b border-hairline">
              {WHY_ITEMS.map((item) => (
                <div key={item.label} className="py-3 text-body-sm text-body-text">
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Three trust pillars */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {TRUST_PILLARS.map((p) => (
            <motion.div
              key={p.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
              }}
              className="flex flex-col gap-2 p-6 bg-white border border-hairline rounded-md"
            >
              <h3 className="text-body-md font-semibold text-ink">{p.title}</h3>
              <p className="text-body-sm text-body-text leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
