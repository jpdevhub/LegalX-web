'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/api'

interface LeadGateProps {
  serviceSlug: string
  serviceTitle: string
  onSuccess: (leadId: string) => void
}

export function LeadGate({ serviceSlug, serviceTitle, onSuccess }: LeadGateProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('Please enter your name.')
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ''))) {
      return setError('Enter a valid 10-digit Indian mobile number.')
    }

    setLoading(true)
    try {
      const data = await apiFetch<{ leadId: string }>('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\s+/g, ''),
          email: email.trim() || undefined,
          serviceSlug,
          serviceTitle,
        }),
      })

      // Store in sessionStorage so subsequent steps can access it
      sessionStorage.setItem('lx_lead_id', data.leadId)
      sessionStorage.setItem('lx_lead_name', name.trim())
      onSuccess(data.leadId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <span className="text-label-caps text-primary uppercase tracking-widest">Step 1 of 3</span>
          <h1
            className="text-ink dark:text-white mt-2 font-bold"
            style={{ fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.2 }}
          >
            Get Expert Assistance for
            <br />
            <span className="text-primary">{serviceTitle}</span>
          </h1>
          <p className="text-body-sm text-body-text dark:text-slate-400 mt-3 leading-relaxed">
            Share your details and our legal expert will call you within 24 hours — at no cost.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="lg-name" className="block text-label-caps text-ink dark:text-white mb-1.5">
              Full Name <span className="text-primary">*</span>
            </label>
            <input
              id="lg-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              autoComplete="name"
              className="
                w-full px-4 py-3 rounded-lg border border-hairline dark:border-white/15
                bg-white dark:bg-white/5 text-ink dark:text-white
                placeholder:text-muted text-body-sm
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-colors duration-150
              "
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="lg-phone" className="block text-label-caps text-ink dark:text-white mb-1.5">
              Mobile Number <span className="text-primary">*</span>
            </label>
            <div className="flex">
              <span className="
                px-3 py-3 rounded-l-lg border border-r-0 border-hairline dark:border-white/15
                bg-surface-soft dark:bg-white/5 text-body-sm text-muted
                flex items-center
              ">+91</span>
              <input
                id="lg-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                autoComplete="tel"
                className="
                  flex-1 px-4 py-3 rounded-r-lg border border-hairline dark:border-white/15
                  bg-white dark:bg-white/5 text-ink dark:text-white
                  placeholder:text-muted text-body-sm
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-colors duration-150
                "
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="lg-email" className="block text-label-caps text-ink dark:text-white mb-1.5">
              Email Address <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              id="lg-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="
                w-full px-4 py-3 rounded-lg border border-hairline dark:border-white/15
                bg-white dark:bg-white/5 text-ink dark:text-white
                placeholder:text-muted text-body-sm
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-colors duration-150
              "
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[13px] text-red-500 dark:text-red-400" role="alert">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3.5 rounded-lg bg-primary text-white font-semibold text-body-sm
              hover:bg-primary-hover active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-150 mt-2
            "
          >
            {loading ? 'Submitting...' : 'Proceed to Application →'}
          </button>
        </form>

        {/* Trust badges */}
        <div className="mt-8 pt-6 border-t border-hairline dark:border-white/10 flex items-center justify-center gap-6">
          <TrustBadge icon="lock" text="100% Secure" />
          <TrustBadge icon="phone" text="Expert Callback" />
          <TrustBadge icon="check" text="No Hidden Fees" />
        </div>
      </div>
    </div>
  )
}

function TrustBadge({ icon, text }: { icon: 'lock' | 'phone' | 'check'; text: string }) {
  const icons = {
    lock: <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />,
    phone: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" />,
    check: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />,
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" suppressHydrationWarning>
        {icons[icon]}
      </svg>
      <span className="text-[11px] text-muted font-medium">{text}</span>
    </div>
  )
}
