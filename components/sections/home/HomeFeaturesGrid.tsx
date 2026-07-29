'use client'

import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'AI Legal Assistance',
    desc: 'Smart AI tools that help users understand legal processes and simplify complex legal information — making law approachable for everyone.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
        <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
      </svg>
    ),
    title: 'Legal Documentation',
    desc: 'Prepare, review, modify, and manage legal documents online with a streamlined workflow — NDAs, agreements, and more in minutes.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Connect with Lawyers',
    desc: 'Find verified lawyers based on expertise, location, language, and consultation needs — all through one trusted platform.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Online Consultation',
    desc: 'Book chat, voice, or video consultations with experienced legal professionals — from the comfort of your home or office.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Knowledge Centre',
    desc: 'Access legal guides, rights awareness content, and educational resources designed to make law easier to understand for everyone.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Compliance Management',
    desc: 'Stay compliant with ongoing regulatory requirements — GST, MCA, FSSAI, startup registrations — all managed in one place.',
  },
]

export function HomeFeaturesGrid() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-labelledby="features-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-label-caps text-muted uppercase tracking-widest">What We Do</span>
          <h2
            id="features-heading"
            className="text-ink mt-2 text-balance"
            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.2 }}
          >
            Everything legal, in one platform.
          </h2>
          <p className="text-body-md text-body-text mt-3 max-w-2xl leading-relaxed">
            LegalX is more than a LegalTech platform. We are building an ecosystem where technology transforms the way people access, understand, and interact with legal services.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline rounded-md overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
              }}
              className="flex gap-4 p-6 bg-white hover:bg-surface-soft transition-colors duration-150"
            >
              {feature.icon}
              <div>
                <h3 className="text-body-md font-semibold text-ink mb-1">{feature.title}</h3>
                <p className="text-body-sm text-body-text leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
