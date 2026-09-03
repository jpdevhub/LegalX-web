'use client'

import { useState } from 'react'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { FadeUp, StaggerParent, FadeUpChild } from '@/components/motion/MotionWrappers'

const OFFICE_DETAILS = [
  {
    icon: (
      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    label: 'Headquarters',
    lines: ['12B Connaught Place, Suite 301', 'New Delhi, Delhi – 110 001'],
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Phone',
    lines: ['+91 98100 12345', '1800-200-LEGALX (Toll Free)'],
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Email',
    lines: ['consult@legalx.in', 'support@legalx.in'],
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="12,6 12,12 16,14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Operating Hours',
    lines: ['Mon – Sat: 9:00 AM – 6:00 PM IST', 'Sun: Closed'],
  },
]

type FormState = 'idle' | 'submitting' | 'success'

export function ContactPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')
    // Simulated submission
    await new Promise((r) => setTimeout(r, 1500))
    setFormState('success')
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-white dark:bg-surface-dark py-16 md:py-20 border-b border-hairline dark:border-hairline-dark">
        <FadeUp className="max-w-[1400px] mx-auto px-5 md:px-16">
          <h1 className="text-ink dark:text-white text-balance" style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}>
            Contact Our Legal Experts
          </h1>
          <p className="text-body-md text-body-text dark:text-slate-400 max-w-2xl mt-4 leading-relaxed">
            Get in touch with the LegalX team for personalized consultations, document reviews, or business law inquiries. We're here to provide clarity in your legal journey.
          </p>
        </FadeUp>
      </section>

      {/* Main contact grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-surface-dark">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          {/* Two equal columns — office details left, form right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: office details + map */}
            <FadeUp>
              <h2 className="text-display-lg text-primary mb-8">Office Details</h2>

              {/* Office detail rows — all same left edge, 16px row spacing */}
              <StaggerParent className="space-y-6">
                {OFFICE_DETAILS.map((detail) => (
                  <FadeUpChild key={detail.label} className="flex items-start gap-4">
                    {/* Icon box — consistent w-12 h-12 */}
                    <div className="w-12 h-12 flex items-center justify-center bg-surface-soft dark:bg-surface-soft-dark border border-hairline dark:border-hairline-dark rounded-sm flex-shrink-0">
                      {detail.icon}
                    </div>
                    <div>
                      <p className="text-label-caps text-muted uppercase tracking-widest mb-1">
                        {detail.label}
                      </p>
                      {detail.lines.map((line, i) => (
                        <p key={i} className="text-body-md text-ink dark:text-white">
                          {line}
                        </p>
                      ))}
                    </div>
                  </FadeUpChild>
                ))}
              </StaggerParent>

              {/* Map placeholder — 24px gap, consistent width */}
              <div className="mt-6 rounded-md overflow-hidden border border-hairline dark:border-hairline-dark h-52 bg-surface-soft dark:bg-surface-soft-dark flex items-center justify-center">
                <div className="text-center text-muted">
                  <svg className="w-10 h-10 mx-auto mb-2 text-primary/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" suppressHydrationWarning>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <p className="text-body-sm">12B Connaught Place, New Delhi</p>
                  <p className="text-label-caps mt-1 text-muted/60">Map integration available on request</p>
                </div>
              </div>
            </FadeUp>

            {/* Right: inquiry form */}
            <FadeUp delay={0.1}>
              <h2 className="text-display-lg text-primary mb-8">Inquiry Form</h2>

              {formState === 'success' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-check-draw">
                    <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-display-lg text-ink dark:text-white">Message Sent!</h3>
                  <p className="text-body-md text-body-text dark:text-slate-400 max-w-sm">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setFormState('idle')}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                  {/* All inputs: 48px height, 8px radius, stacked labels */}
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Priya Sharma"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    id="contact-name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="priya@example.com"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    id="contact-email"
                  />
                  <Select
                    label="Subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    id="contact-subject"
                  >
                    <option value="">Select a topic...</option>
                    <option>Legal Consultation</option>
                    <option>Document Review</option>
                    <option>Business Law</option>
                    <option>GST / Tax Services</option>
                    <option>Trademark Registration</option>
                    <option>Other</option>
                  </Select>
                  <Textarea
                    label="Message"
                    placeholder="Describe your legal requirements..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    id="contact-message"
                  />

                  {/* Full-width button — fixes narrower button from mockup */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={formState === 'submitting'}
                    className="mt-1"
                  >
                    {formState === 'submitting' ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </Button>

                  <p className="text-body-sm text-muted text-center">
                    Protected by attorney-client privilege. Your information is fully encrypted.
                  </p>
                </form>
              )}
            </FadeUp>
          </div>
        </div>
      </section>

      {/* LegalChat band — vertically centered, equal padding */}
      <section className="bg-surface-soft dark:bg-surface-soft-dark border-t border-hairline dark:border-hairline-dark py-10 md:py-12">
        <FadeUp className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-display-md text-ink dark:text-white">
                Need urgent assistance?
              </h2>
              <p className="text-body-md text-body-text dark:text-slate-400 mt-1">
                Our legal chat assistants are available 24/7 for preliminary guidance.
              </p>
            </div>
            <Button variant="secondary" size="md" className="flex-shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Launch LegalChat
            </Button>
          </div>
        </FadeUp>
      </section>
    </>
  )
}
