'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiContactSubmit } from '@/lib/api'
import { FadeUp, StaggerParent, FadeUpChild } from '@/components/motion/MotionWrappers'

/**
 * Contact.
 *
 * The form posts to /api/contact, which emails the inbox and sends the sender a
 * confirmation. It previously waited 1.5 seconds and showed "Message Sent!"
 * without sending anything, which is worse than having no form at all — the
 * sender believes they have reached us and stops trying.
 *
 * The office details alongside it were fabricated too: a Connaught Place suite,
 * a toll-free number and two legalx.in addresses, none of which exist. What is
 * listed now is the registered office, the real inbox, and the WhatsApp line
 * that already sits on every page.
 */

const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918252208569').replace(/\D/g, '')
const EMAIL = 'contact@legalxonline.com'

const OFFICE_DETAILS = [
  {
    icon: (
      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    label: 'Registered Office',
    lines: ['LegalXOnline Private Limited', 'Nandlalpur, Kahalgaon, Bhagalpur', 'Bihar – 813222, India'],
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Email',
    lines: [EMAIL],
    href: `mailto:${EMAIL}`,
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor" suppressHydrationWarning>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15h-.01a8.2 8.2 0 01-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.26.86 5.82 2.41a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z" />
      </svg>
    ),
    label: 'WhatsApp',
    lines: ['+91 82522 08569'],
    href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi LegalX, I'd like some help.")}`,
    external: true,
  },
]

const SUBJECTS = [
  'Legal Consultation',
  'Document Review',
  'Business Law',
  'GST / Tax Services',
  'Trademark Registration',
  'Something on the website',
  'Other',
]

type FormState = 'idle' | 'submitting' | 'success'

export function ContactPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  // Mirrors the server rule (message min 10) so the problem shows inline
  // instead of coming back as a generic validation failure.
  const valid =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.subject.trim().length > 0 &&
    form.message.trim().length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) {
      setError('Please fill in every field. Your message needs at least 10 characters.')
      return
    }
    setFormState('submitting')
    setError(null)
    try {
      await apiContactSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      setFormState('success')
    } catch (err: any) {
      setFormState('idle')
      setError(err?.message || 'Could not send your message. Please try WhatsApp or email instead.')
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-white dark:bg-surface-dark py-16 md:py-20 border-b border-hairline dark:border-hairline-dark">
        <FadeUp className="max-w-[1400px] mx-auto px-5 md:px-16">
          <h1 className="text-ink dark:text-white text-balance" style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}>
            Contact LegalX
          </h1>
          <p className="text-body-md text-body-text dark:text-slate-400 max-w-2xl mt-4 leading-relaxed">
            Questions about the platform, an order, or a document you have received from us —
            reach us on any of these and a person will answer.
          </p>
        </FadeUp>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-surface-dark">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* Left: how to reach us */}
            <FadeUp>
              <h2 className="text-display-lg text-primary mb-8">Office Details</h2>

              <StaggerParent className="space-y-6">
                {OFFICE_DETAILS.map((detail) => {
                  const body = (
                    <>
                      <div className="w-12 h-12 flex items-center justify-center bg-surface-soft dark:bg-surface-soft-dark border border-hairline dark:border-hairline-dark rounded-sm flex-shrink-0">
                        {detail.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-label-caps text-muted uppercase tracking-widest mb-1">
                          {detail.label}
                        </p>
                        {detail.lines.map((line) => (
                          <p key={line} className="text-body-md text-ink dark:text-white break-words">
                            {line}
                          </p>
                        ))}
                      </div>
                    </>
                  )

                  return (
                    <FadeUpChild key={detail.label}>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          {...(detail.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="flex items-start gap-4 group"
                        >
                          {body}
                        </a>
                      ) : (
                        <div className="flex items-start gap-4">{body}</div>
                      )}
                    </FadeUpChild>
                  )
                })}
              </StaggerParent>

              <div className="mt-8 p-4 rounded-sm bg-surface-soft dark:bg-surface-soft-dark border border-hairline dark:border-hairline-dark">
                <p className="text-label-caps text-muted uppercase tracking-widest mb-2">
                  Looking for legal advice?
                </p>
                <p className="text-body-sm text-body-text dark:text-slate-400 leading-relaxed">
                  Nothing sent through this page is legal advice or creates a lawyer–client
                  relationship. For your own matter,{' '}
                  <Link href="/talk-to-lawyer" className="text-primary font-semibold hover:underline">
                    book a consultation with a verified advocate
                  </Link>.
                </p>
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
                  <h3 className="text-display-lg text-ink dark:text-white">Message sent</h3>
                  <p className="text-body-md text-body-text dark:text-slate-400 max-w-sm">
                    A copy is on its way to {form.email}. We answer within 24 hours — if it is
                    urgent, WhatsApp is faster.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setForm({ name: '', email: '', subject: '', message: '' })
                      setFormState('idle')
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    id="contact-subject"
                  >
                    <option value="">Select a topic...</option>
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                  <Textarea
                    label="Message"
                    placeholder="Describe your legal requirements..."
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    id="contact-message"
                  />

                  {error && (
                    <p className="text-body-sm text-red-600 dark:text-red-400">{error}</p>
                  )}

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
                    Sent over an encrypted connection. We reply to the address you give here.
                  </p>
                </form>
              )}
            </FadeUp>

          </div>
        </div>
      </section>
    </>
  )
}
