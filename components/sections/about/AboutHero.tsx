'use client'

import { FadeUp } from '@/components/motion/MotionWrappers'

export function AboutHero() {
  return (
    <section className="bg-white py-16 md:py-24 border-b border-hairline" aria-labelledby="about-hero-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <FadeUp className="max-w-3xl">
          <span className="text-label-caps text-primary uppercase tracking-widest">About LegalX</span>
          <h1
            id="about-hero-heading"
            className="text-ink mt-3 text-balance"
            style={{ fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 700, lineHeight: 1.12 }}
          >
            Making Legal Services Simple, Affordable &amp; Accessible
          </h1>
          <p className="text-body-md text-body-text mt-5 leading-relaxed max-w-2xl">
            LegalX is a legal tech platform built to make professional legal services simple, affordable, and accessible for every Indian. We connect individuals and businesses with qualified lawyers and handle registrations, licenses, and documentation — entirely online.
          </p>
        </FadeUp>
      </div>
    </section>
  )
}
