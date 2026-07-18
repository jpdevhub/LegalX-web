'use client'

import { FadeUp } from '@/components/motion/MotionWrappers'

export function AboutNarrative() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-labelledby="story-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Left — Our Story */}
          <FadeUp>
            <span className="text-label-caps text-primary uppercase tracking-widest">Our Story</span>
            <h2
              id="story-heading"
              className="text-ink mt-2 text-balance"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Why LegalX Exists
            </h2>
            <div className="mt-5 space-y-4 text-body-md text-body-text leading-relaxed">
              <p>
                Most people struggle with legal services because they are confusing, expensive, and time-consuming. Finding the right lawyer, preparing legal documents, understanding legal procedures, or getting timely legal advice often requires multiple visits, unnecessary paperwork, and significant costs.
              </p>
              <p>
                LegalX was founded to change that.
              </p>
              <p>
                We are building a digital-first legal ecosystem where individuals, startups, and businesses can access trusted legal services from anywhere through one secure platform.
              </p>
              <p>
                At LegalXOnline Private Limited, we are on a mission to make legal services accessible, affordable, and technology-driven for everyone. By combining Artificial Intelligence, modern software engineering, and legal expertise, we are building a platform that simplifies legal information, streamlines documentation, and connects individuals and businesses with trusted legal professionals.
              </p>
              <p>
                LegalX is more than just a LegalTech platform. We are building an ecosystem where technology transforms the way people access, understand, and interact with legal services.
              </p>
            </div>
          </FadeUp>

          {/* Right — Mission + Vision + Promise */}
          <FadeUp delay={0.1} className="flex flex-col gap-8">
            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-display-md text-ink mb-2">Our Mission</h3>
              <p className="text-body-sm text-body-text leading-relaxed">
                To make legal services accessible, affordable, transparent, and technology-driven for everyone — simplifying legal processes through intelligent, user-centric digital solutions.
              </p>
            </div>

            <div className="border-l-4 border-ink pl-6">
              <h3 className="text-display-md text-ink mb-2">Our Vision</h3>
              <p className="text-body-sm text-body-text leading-relaxed">
                To become India's most trusted legal services platform — making quality legal help accessible to everyone through digital innovation and qualified professionals.
              </p>
            </div>

            <div className="border-l-4 border-ink pl-6">
              <h3 className="text-display-md text-ink mb-2">Our Promise</h3>
              <p className="text-body-sm text-body-text leading-relaxed">
                At LegalX, we believe legal support should be simple, transparent, and available whenever you need it. Every individual and business deserves trusted legal solutions backed by technology and expert professionals.
              </p>
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  )
}
