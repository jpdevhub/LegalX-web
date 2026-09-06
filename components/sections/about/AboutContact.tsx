'use client'

import { useState } from 'react'
import { FadeUp } from '@/components/motion/MotionWrappers'
import { apiContactSubmit } from '@/lib/api'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function AboutContact() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')
    setErrorMsg(null)
    try {
      await apiContactSubmit({
        name: form.name,
        email: form.email,
        subject: 'General Inquiry (About Page)',
        message: form.message,
      })
      setFormState('success')
    } catch (err: any) {
      setFormState('error')
      setErrorMsg(err.message || 'Failed to send message. Please try again.')
    }
  }

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
            {formState === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-ink">Message Sent!</h3>
                <p className="text-body-sm text-body-text max-w-xs">
                  We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setFormState('idle'); setForm({ name: '', email: '', message: '' }) }}
                  className="mt-2 text-body-sm text-primary hover:text-ink font-semibold transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                aria-label="Contact form"
              >
                {/* Error display */}
                {formState === 'error' && errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label htmlFor="about-contact-name" className="block text-body-sm font-medium text-ink mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="about-contact-name"
                    type="text"
                    placeholder="Your name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="about-contact-email" className="block text-body-sm font-medium text-ink mb-1.5">
                    Email
                  </label>
                  <input
                    id="about-contact-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="about-contact-message" className="block text-body-sm font-medium text-ink mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="about-contact-message"
                    rows={4}
                    placeholder="How can we help you?"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full py-2.5 px-6 bg-ink text-white text-body-sm font-semibold rounded-md hover:bg-ink/90 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formState === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </FadeUp>

        </div>
      </div>
    </section>
  )
}
