'use client'

import { useState } from 'react'
import { FadeUp, StaggerParent, FadeUpChild } from '@/components/motion/MotionWrappers'

const PRACTICE_AREAS = [
  { id: 'property', label: 'Property & Real Estate', desc: 'Disputes, registration, tenancy, and title verification.' },
  { id: 'business', label: 'Business & Corporate', desc: 'Contracts, startups, compliance, and partnerships.' },
  { id: 'family', label: 'Family & Personal', desc: 'Divorce, inheritance, guardianship, and matrimonial matters.' },
  { id: 'criminal', label: 'Criminal Defense', desc: 'Bail, FIR, chargesheet, and trial representation.' },
  { id: 'civil', label: 'Civil Litigation', desc: 'Consumer disputes, debt recovery, and injunctions.' },
]

const HOW_STEPS = [
  { n: '1', title: 'Choose a time slot', desc: 'Pick a date and time that works for you — morning, afternoon, or evening.' },
  { n: '2', title: 'Brief your issue', desc: 'Describe your legal matter in a short form. No legal knowledge required.' },
  { n: '3', title: 'Get expert advice', desc: 'Speak with a verified lawyer. Get clear, actionable guidance.' },
]

export function TalkToLawyer() {
  const [submitted, setSubmitted] = useState(false)
  const [area, setArea] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main>
      {/* Hero */}
      <section className="pt-16 pb-12 bg-white border-b border-hairline">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <span className="text-label-caps text-primary uppercase tracking-widest">Talk to a Lawyer</span>
          <h1
            className="text-ink mt-2 max-w-2xl"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}
          >
            Speak with a verified legal expert
          </h1>
          <p className="text-body-md text-body-text mt-4 max-w-xl leading-relaxed">
            Our network of qualified lawyers provides confidential advice on property, business, family,
            criminal, and civil matters. Book a consultation in minutes.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 bg-surface-soft" aria-labelledby="lawyer-steps-heading">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <FadeUp className="mb-10">
            <h2
              id="lawyer-steps-heading"
              className="text-ink"
              style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              How it works
            </h2>
          </FadeUp>
          <StaggerParent className="grid grid-cols-1 sm:grid-cols-3 gap-0">
            {HOW_STEPS.map((s, i) => (
              <FadeUpChild key={s.n}>
                <div className="relative pr-6 pb-8 sm:pb-0">
                  {i < HOW_STEPS.length - 1 && (
                    <div
                      className="hidden sm:block absolute top-5 left-[calc(2.5rem+1px)] right-0 h-px bg-hairline"
                      aria-hidden="true"
                    />
                  )}
                  <div className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center flex-shrink-0 bg-white relative z-10 mb-4">
                    <span className="text-ink font-bold text-[15px]">{s.n}</span>
                  </div>
                  <h3 className="text-display-md text-ink mb-1">{s.title}</h3>
                  <p className="text-body-sm text-body-text leading-relaxed">{s.desc}</p>
                </div>
              </FadeUpChild>
            ))}
          </StaggerParent>
        </div>
      </section>

      {/* Practice areas */}
      <section className="py-14 bg-white" aria-labelledby="practice-areas-heading">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <FadeUp className="mb-8">
            <h2
              id="practice-areas-heading"
              className="text-ink"
              style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Practice areas
            </h2>
          </FadeUp>
          <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PRACTICE_AREAS.map((area, i) => (
              <FadeUpChild key={area.id}>
                <div className="bg-surface-soft rounded-md p-5 h-full">
                  <span className="text-[13px] font-bold text-ink mb-2 block">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="text-display-md text-ink mb-1.5">{area.label}</h3>
                  <p className="text-body-sm text-body-text leading-snug">{area.desc}</p>
                </div>
              </FadeUpChild>
            ))}
          </StaggerParent>
        </div>
      </section>

      {/* Booking form */}
      <section className="py-14 bg-surface-soft border-t border-hairline" aria-labelledby="book-heading">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="max-w-lg mx-auto">
            <FadeUp className="mb-8">
              <h2
                id="book-heading"
                className="text-ink"
                style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, lineHeight: 1.2 }}
              >
                Book a consultation
              </h2>
              <p className="text-body-sm text-body-text mt-2">
                Fill in your details and we will connect you with the right lawyer within 24 hours.
              </p>
            </FadeUp>

            {submitted ? (
              <div className="bg-white rounded-md p-8 text-center">
                <p className="text-display-md text-ink font-semibold mb-2">Request received</p>
                <p className="text-body-sm text-body-text">
                  We will contact you at the email provided within 24 hours to confirm your consultation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" aria-label="Consultation booking form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lawyer-name" className="block text-body-sm font-medium text-ink mb-1.5">Full Name</label>
                    <input
                      id="lawyer-name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="lawyer-phone" className="block text-body-sm font-medium text-ink mb-1.5">Phone Number</label>
                    <input
                      id="lawyer-phone"
                      type="tel"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lawyer-email" className="block text-body-sm font-medium text-ink mb-1.5">Email</label>
                  <input
                    id="lawyer-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lawyer-area" className="block text-body-sm font-medium text-ink mb-1.5">Legal Area</label>
                  <select
                    id="lawyer-area"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select area</option>
                    {PRACTICE_AREAS.map((a) => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="lawyer-brief" className="block text-body-sm font-medium text-ink mb-1.5">Brief your issue</label>
                  <textarea
                    id="lawyer-brief"
                    rows={4}
                    placeholder="Describe your legal matter in a few lines."
                    className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-6 bg-primary text-white text-body-sm font-semibold rounded-md hover:bg-primary-hover transition-colors duration-150"
                >
                  Request Consultation
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
