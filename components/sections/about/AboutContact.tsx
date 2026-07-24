'use client'

import { FadeUp } from '@/components/motion/MotionWrappers'

export function AboutContact() {
  return (
    <section className="py-16 md:py-20 bg-white border-t border-hairline" aria-labelledby="contact-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left — heading + address */}
          <FadeUp>
            <span className="text-label-caps text-primary uppercase tracking-widest">Contact Us</span>
            <h2
              id="contact-heading"
              className="text-ink mt-2 mb-6"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Get in Touch
            </h2>
            <address className="not-italic space-y-3 text-body-sm text-body-text">
              <div>
                <p className="font-semibold text-ink">Registered Office</p>
                <p>LegalXOnline Private Limited</p>
                <p>Nandlalpur, Kahalgaon, Bhagalpur</p>
                <p>Bihar – 813222, India</p>
              </div>
              <div>
                <p className="font-semibold text-ink">Email</p>
                <a
                  href="mailto:contact@legalxonline.com"
                  className="text-body-md text-ink dark:text-white font-medium hover:text-primary transition-colors"
                >
                  contact@legalxonline.com
                </a>
              </div>
            </address>
          </FadeUp>

          {/* Right — compact contact form */}
          <FadeUp delay={0.1}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4"
              aria-label="Contact form"
            >
              <div>
                <label htmlFor="contact-name" className="block text-body-sm font-medium text-ink mb-1.5">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-body-sm font-medium text-ink mb-1.5">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-body-sm font-medium text-ink mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-6 bg-ink text-white text-body-sm font-semibold rounded-md hover:bg-ink/90 transition-colors duration-150"
              >
                Send Message
              </button>
            </form>
          </FadeUp>

        </div>
      </div>
    </section>
  )
}
