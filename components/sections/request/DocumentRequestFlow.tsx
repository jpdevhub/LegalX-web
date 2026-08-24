'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { LegalDocument, FormField } from '@/lib/documents'
import { LeadGate } from './LeadGate'
import { apiFetch } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface UploadedFile {
  docId: string
  file: File
  previewUrl: string | null
  isPdf: boolean
}

// ── Step bar ──────────────────────────────────────────────────────────────────
const STEP_LABELS = ['Your Info', 'Requirements', 'Details', 'Upload Docs', 'Review', 'Payment', 'Done']

function StepBar({ current }: { current: Step }) {
  // Show steps 1–6 in the bar (step 0 is LeadGate, shown separately)
  const visible = STEP_LABELS.slice(1)
  return (
    <nav aria-label="Progress steps" className="mb-8">
      <ol className="flex items-center gap-0 overflow-x-auto">
        {visible.map((label, i) => {
          const num = (i + 1) as Step
          const done = current > num
          const active = current === num
          return (
            <li key={label} className="flex items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
                    done
                      ? 'bg-ink dark:bg-white text-white dark:text-black'
                      : active
                      ? 'bg-primary text-white'
                      : 'border-2 border-hairline dark:border-white/20 text-muted'
                  }`}
                >
                  {done ? <CheckSm /> : num}
                </div>
                <span
                  className={`text-label-caps whitespace-nowrap hidden sm:block ${
                    active ? 'text-ink dark:text-white font-semibold' : done ? 'text-ink dark:text-white' : 'text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < visible.length - 1 && (
                <div className={`w-8 md:w-12 h-px mx-2 flex-shrink-0 ${done ? 'bg-ink dark:bg-white' : 'bg-hairline dark:bg-white/15'}`} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ── Step 1: Requirements ──────────────────────────────────────────────────────
function StepRequirements({ doc, onNext }: { doc: LegalDocument; onNext: () => void }) {
  return (
    <div>
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 1 of 6 &nbsp;·&nbsp; {doc.estimatedTime} total</span>
      <h1 className="text-ink dark:text-white mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        What you need for {doc.title}
      </h1>
      <p className="text-body-sm text-body-text dark:text-slate-400 mb-8 leading-relaxed">
        Gather these documents before you start — the whole process takes {doc.estimatedTime}.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: doc.estimatedTime, sub: 'Fully online' },
          { label: `${doc.requiredDocs.length} documents`, sub: 'Photos or scans accepted' },
          { label: doc.pricing.total, sub: 'No hidden fees' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-soft dark:bg-white/5 rounded-md p-4">
            <p className="text-display-md text-ink dark:text-white font-semibold">{s.label}</p>
            <p className="text-label-caps text-muted mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <h2 className="text-display-md text-ink dark:text-white mb-4">Documents Checklist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {doc.requiredDocs.map((d, i) => (
          <div key={d.id} className="bg-surface-soft dark:bg-white/5 rounded-md p-5">
            <div className="flex items-start justify-between mb-2">
              <FileIcon />
              <span className="text-[12px] font-bold text-muted">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="text-body-sm font-semibold text-ink dark:text-white mb-1">{d.name}</h3>
            <p className="text-[12px] text-muted mb-3 leading-snug">{d.desc}</p>
            <span className={`text-[11px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full ${d.required ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' : 'bg-hairline dark:bg-white/10 text-muted'}`}>
              {d.required ? 'Required' : 'Optional'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Your Details ──────────────────────────────────────────────────────
function StepDetails({ doc, values, onChange }: { doc: LegalDocument; values: Record<string, string>; onChange: (id: string, val: string) => void }) {
  const groups: Record<string, FormField[]> = {}
  doc.formFields.forEach((f) => {
    if (!groups[f.group]) groups[f.group] = []
    groups[f.group].push(f)
  })

  return (
    <div>
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 2 of 6</span>
      <h1 className="text-ink dark:text-white mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        Your Details
      </h1>
      <p className="text-body-sm text-body-text dark:text-slate-400 mb-8 leading-relaxed">
        Fill in the information for your {doc.title}. No legal knowledge required.
      </p>
      <div className="space-y-10">
        {Object.entries(groups).map(([groupName, fields]) => (
          <div key={groupName}>
            <h2 className="text-display-md text-ink dark:text-white mb-4 pb-2 border-b border-hairline dark:border-white/10">{groupName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label htmlFor={field.id} className="block text-body-sm font-medium text-ink dark:text-white mb-1.5">
                    {field.label}
                    {!field.required && <span className="text-muted font-normal ml-1">(optional)</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select id={field.id} value={values[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 text-body-sm text-ink dark:text-white border border-hairline dark:border-white/15 rounded-md bg-white dark:bg-white/5 focus:outline-none focus:border-primary transition-colors">
                      <option value="">Select…</option>
                      {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea id={field.id} rows={3} placeholder={field.placeholder} value={values[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 text-body-sm text-ink dark:text-white border border-hairline dark:border-white/15 rounded-md bg-white dark:bg-white/5 placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none" />
                  ) : (
                    <input id={field.id} type={field.type} placeholder={field.placeholder} value={values[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 text-body-sm text-ink dark:text-white border border-hairline dark:border-white/15 rounded-md bg-white dark:bg-white/5 placeholder:text-muted focus:outline-none focus:border-primary transition-colors" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 3: Upload Documents ──────────────────────────────────────────────────
function StepUpload({ doc, uploads, onUpload, onRemove }: { doc: LegalDocument; uploads: UploadedFile[]; onUpload: (docId: string, file: File) => void; onRemove: (docId: string) => void }) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const getUpload = (docId: string) => uploads.find((u) => u.docId === docId)

  return (
    <div>
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 3 of 6</span>
      <h1 className="text-ink dark:text-white mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>Upload Documents</h1>
      <p className="text-body-sm text-body-text dark:text-slate-400 mb-8 leading-relaxed">
        Upload clear scans or photos. Accepted formats are listed for each document.
      </p>
      <div className="space-y-4">
        {doc.requiredDocs.map((reqDoc) => {
          const uploaded = getUpload(reqDoc.id)
          return (
            <div key={reqDoc.id} className="bg-surface-soft dark:bg-white/5 rounded-md p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-body-sm font-semibold text-ink dark:text-white">{reqDoc.name}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${reqDoc.required ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' : 'bg-hairline dark:bg-white/10 text-muted'}`}>
                      {reqDoc.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted">{reqDoc.acceptedFormats}</p>
                </div>
              </div>
              {uploaded && (
                <div className="mb-3">
                  {uploaded.isPdf ? (
                    <div className="flex items-center gap-3 bg-white dark:bg-white/10 rounded-md p-3 border border-hairline dark:border-white/10">
                      <PdfIcon />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-ink dark:text-white truncate">{uploaded.file.name}</p>
                        <p className="text-[11px] text-muted">{(uploaded.file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button onClick={() => onRemove(reqDoc.id)} className="text-muted hover:text-red-500 transition-colors text-[12px]">Remove</button>
                    </div>
                  ) : (
                    <div className="relative rounded-md overflow-hidden border border-hairline dark:border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploaded.previewUrl!} alt={`Preview of ${reqDoc.name}`} className="w-full max-h-48 object-contain bg-white" />
                      <div className="absolute top-2 right-2">
                        <button onClick={() => onRemove(reqDoc.id)} className="bg-white text-[11px] font-medium text-red-500 px-2 py-1 rounded border border-hairline">Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!uploaded && (
                <div
                  className="border-2 border-dashed border-hairline dark:border-white/15 rounded-md p-5 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => inputRefs.current[reqDoc.id]?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[reqDoc.id]?.click()}
                  tabIndex={0} role="button" aria-label={`Upload ${reqDoc.name}`}
                >
                  <UploadIcon />
                  <p className="text-body-sm text-body-text dark:text-slate-400 mt-1">Click to upload or drag and drop</p>
                  <p className="text-[11px] text-muted mt-0.5">{reqDoc.acceptedFormats}</p>
                </div>
              )}
              <input ref={(el) => { inputRefs.current[reqDoc.id] = el }} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                aria-label={`File input for ${reqDoc.name}`}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(reqDoc.id, file) }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 4: Review ────────────────────────────────────────────────────────────
function StepReview({ doc, values, submitting, onSubmit }: { doc: LegalDocument; values: Record<string, string>; submitting: boolean; onSubmit: () => void }) {
  const groups: Record<string, Array<{ label: string; value: string }>> = {}
  doc.formFields.forEach((f) => {
    const val = values[f.id]
    if (val) {
      if (!groups[f.group]) groups[f.group] = []
      groups[f.group].push({ label: f.label, value: val })
    }
  })

  return (
    <div>
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 4 of 6</span>
      <h1 className="text-ink dark:text-white mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        Review your details
      </h1>
      <p className="text-body-sm text-body-text dark:text-slate-400 mb-8 leading-relaxed">
        Verify everything below before proceeding to payment. You can go back to make changes.
      </p>

      <div className="bg-white dark:bg-white/5 rounded-md border border-hairline dark:border-white/10 p-8 mb-8">
        <div className="text-center mb-6 pb-4 border-b border-hairline dark:border-white/10">
          <h2 className="text-display-lg text-ink dark:text-white font-bold">{doc.title.toUpperCase()}</h2>
          <p className="text-body-sm text-muted mt-1">As per {doc.legalAct}</p>
        </div>
        {Object.entries(groups).map(([groupName, fields]) => (
          <div key={groupName} className="mb-6">
            <h3 className="text-label-caps text-primary uppercase tracking-widest mb-3">{groupName}</h3>
            <div className="space-y-2">
              {fields.map((f) => (
                <div key={f.label} className="flex gap-3 text-body-sm">
                  <span className="text-muted w-48 flex-shrink-0">{f.label}:</span>
                  <span className="text-ink dark:text-white font-medium">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groups).length === 0 && (
          <p className="text-body-sm text-muted text-center py-4">No details filled yet — go back to Step 2.</p>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-md hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-body-sm"
      >
        {submitting ? 'Saving application…' : 'Confirm & Proceed to Payment →'}
      </button>
    </div>
  )
}

// ── Step 5: Payment ───────────────────────────────────────────────────────────
// ── StepPayment ──────────────────────────────────────────────────────────────
// Handles the full Razorpay pre-auth flow:
//   1. Create Razorpay order on backend (POST /api/payment/create-order)
//   2. Open Razorpay checkout modal
//   3. On success: verify signature on backend (POST /api/payment/verify)
//      → backend sends admin "Payment Received" email + user "Payment Confirmed" email
// If user dismisses the modal without paying, they stay on this step.
// The admin already received a "Documents Submitted — Awaiting Payment" email
// when POST /api/applications was called (Step 4).
function StepPayment({
  doc,
  applicationId,
  leadId,
  onSuccess,
}: {
  doc: LegalDocument
  applicationId: string
  leadId: string
  onSuccess: () => void
}) {
  const [paying, setPaying]     = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError]       = useState('')
  const [sdkReady, setSdkReady] = useState(false)

  // Pre-load the Razorpay SDK as soon as this step mounts so it's ready when Pay is clicked
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).Razorpay) { setSdkReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload  = () => setSdkReady(true)
    script.onerror = () => setError('Failed to load payment SDK. Please refresh and try again.')
    document.head.appendChild(script)
    return () => {
      // Cleanup if component unmounts before script loads (rare)
      if (!sdkReady) script.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const amountPaise = parseInt(doc.pricing.total.replace(/[^\d]/g, ''), 10) * 100

  async function handlePay() {
    if (!sdkReady) {
      setError('Payment SDK not ready yet. Please wait a moment and try again.')
      return
    }
    setError('')
    setPaying(true)

    try {
      // ── 1. Create order on backend ───────────────────────────────────────
      const order = await apiFetch<{
        orderId: string
        keyId: string
        amount: number
        currency: string
      }>('\/api\/payment\/create-order', {
        method: 'POST',
        body: JSON.stringify({
          applicationId,
          leadId,
          serviceSlug: doc.slug,
          amount: amountPaise,
        }),
      })

      const leadName = sessionStorage.getItem('lx_lead_name') || ''

      // ── 2. Open Razorpay checkout ────────────────────────────────────────
      await new Promise<void>((resolve, reject) => {
        // @ts-expect-error Razorpay is loaded via dynamic script — no @types package needed
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'LegalX Online',
          description: doc.title,
          order_id: order.orderId,
          prefill: { name: leadName },
          image: '/logo.svg',
          theme: { color: '#C9A227' },

          handler: async (response: {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            try {
              setVerifying(true)
              // ── 3. Verify signature + update DB + send admin email ───────
              await apiFetch('\/api\/payment\/verify', {
                method: 'POST',
                body: JSON.stringify({
                  razorpayOrderId:   response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  applicationId,
                  leadId,
                }),
              })
              // ✅ Backend now:
              //   - verifies HMAC signature
              //   - marks application as paid in DB
              //   - sends admin: "Payment Received: {name} — {service} (₹{amount})"
              //   - sends user: "Payment Confirmed — {service} | LegalX"
              resolve()
              onSuccess()
            } catch (verifyErr: any) {
              reject(verifyErr)
            }
          },

          modal: {
            ondismiss: () => {
              // User closed modal without paying — stay on payment step
              setPaying(false)
              setVerifying(false)
              reject(new Error('cancelled'))
            },
          },
        })
        rzp.open()
      })
    } catch (err: any) {
      if (err?.message !== 'cancelled') {
        setError(err?.message || 'Payment failed. Please try again or contact support.')
      }
      setPaying(false)
      setVerifying(false)
    }
  }

  return (
    <div>
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 5 of 6</span>
      <h1 className="text-ink dark:text-white mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        Complete Payment
      </h1>
      <p className="text-body-sm text-body-text dark:text-slate-400 mb-6 leading-relaxed">
        Your documents have been submitted. Complete payment to begin processing your application.
        We accept all UPI apps, credit/debit cards, and net banking.
      </p>

      {/* Notice — documents already received */}
      <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-6 max-w-sm">
        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" suppressHydrationWarning>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-[13px] text-emerald-700 dark:text-emerald-400 leading-snug">
          Documents received and saved. Our team has been notified and is ready to begin once payment is confirmed.
        </p>
      </div>

      {/* Order summary */}
      <div className="bg-surface-soft dark:bg-white/5 rounded-xl p-6 mb-6 border border-hairline dark:border-white/10 max-w-sm">
        <p className="text-label-caps text-muted uppercase tracking-widest mb-4">Order Summary</p>
        <div className="space-y-3 text-body-sm">
          <div className="flex justify-between items-center">
            <span className="text-body-text dark:text-slate-400">{doc.title}</span>
            <span className="text-ink dark:text-white font-semibold">{doc.pricing.total}</span>
          </div>
          <div className="flex justify-between items-center text-muted text-[12px]">
            <span>Platform Fee</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">FREE</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-hairline dark:border-white/10">
            <span className="font-bold text-ink dark:text-white">Total Due</span>
            <span className="font-bold text-primary text-[20px]">{doc.pricing.total}</span>
          </div>
        </div>
      </div>

      {/* What happens after payment */}
      <div className="max-w-sm mb-6 space-y-2">
        {[
          'Application moved to \'In Progress\' status',
          'You receive a payment confirmation email',
          'Our team contacts you within 24 hours',
          'Admin notified immediately with payment receipt',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-[12px] text-body-text dark:text-slate-400">
            <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" suppressHydrationWarning>
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {item}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 max-w-sm">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" /><line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
          </svg>
          <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        id="pay-now-btn"
        onClick={handlePay}
        disabled={paying || verifying || !sdkReady}
        className="inline-flex items-center gap-2.5 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-body-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {verifying ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Confirming payment…
          </>
        ) : paying ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Opening Razorpay…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
              <rect x="1" y="4" width="22" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" />
            </svg>
            Pay {doc.pricing.total} Securely
          </>
        )}
      </button>

      <div className="flex items-center gap-4 mt-4 max-w-sm">
        <p className="text-[11px] text-muted flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
          </svg>
          256-bit SSL
        </p>
        <p className="text-[11px] text-muted">Secured by Razorpay</p>
        {!sdkReady && <p className="text-[11px] text-amber-500 animate-pulse">Loading payment…</p>}
      </div>
    </div>
  )
}

// ── Step 6: Success ───────────────────────────────────────────────────────────
function StepSuccess({ doc }: { doc: LegalDocument }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" suppressHydrationWarning>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="text-ink dark:text-white mb-3 font-bold" style={{ fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.2 }}>
        Application Submitted!
      </h1>
      <p className="text-body-md text-body-text dark:text-slate-400 mb-3 max-w-md mx-auto leading-relaxed">
        Your <strong>{doc.title}</strong> application has been received and payment confirmed.
      </p>
      <p className="text-body-sm text-body-text dark:text-slate-400 mb-8 max-w-md mx-auto">
        Our expert will call you within <strong>24 hours</strong> to guide you through the next steps.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/documents" className="text-body-sm font-semibold text-body-text hover:text-ink dark:hover:text-white transition-colors underline underline-offset-2">
          View all services
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-md hover:bg-primary-hover transition-colors text-body-sm">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

// ── Cost Sidebar ──────────────────────────────────────────────────────────────
function CostSidebar({ doc }: { doc: LegalDocument }) {
  return (
    <div className="bg-surface-soft dark:bg-white/5 rounded-xl p-6 sticky top-24 border border-hairline dark:border-white/10">
      <h2 className="text-display-md text-ink dark:text-white mb-4 font-bold">{doc.title}</h2>
      <div className="space-y-3 text-body-sm">
        <div className="flex justify-between">
          <span className="text-body-text dark:text-slate-400">Service Fee</span>
          <span className="text-ink dark:text-white font-semibold">₹{doc.pricing.drafting.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between border-t border-hairline dark:border-white/10 pt-2">
          <span className="text-body-text dark:text-slate-400">Govt. Duty</span>
          <span className="text-muted">{doc.pricing.govtDuty}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-body-text dark:text-slate-400">Platform Fee</span>
          <span className="text-ink dark:text-white font-semibold">₹0</span>
        </div>
        <div className="flex justify-between border-t border-hairline dark:border-white/10 pt-2">
          <span className="text-ink dark:text-white font-bold">Total</span>
          <span className="text-primary font-bold text-[17px]">{doc.pricing.total}</span>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-hairline dark:border-white/10 space-y-2">
        {['Expert-reviewed process', 'Govt. registered agent', 'Full support included'].map((t) => (
          <div key={t} className="flex items-center gap-2 text-[12px] text-body-text dark:text-slate-400">
            <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" suppressHydrationWarning>
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Bottom Nav Bar ─────────────────────────────────────────────────────────────
function BottomBar({ doc, step, onBack, onNext }: { doc: LegalDocument; step: Step; onBack: () => void; onNext: () => void }) {
  const labels: Partial<Record<Step, string>> = {
    1: 'Continue →',
    2: 'Continue to Upload →',
    3: 'Continue to Review →',
  }
  const showNext = step >= 1 && step <= 3
  const showBack = step >= 2 && step <= 4

  return (
    <div className="sticky bottom-0 bg-white dark:bg-[#0d0d0d] border-t border-hairline dark:border-white/10 py-4 mt-10 z-10">
      <div className="max-w-[900px] mx-auto px-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-muted uppercase tracking-wide font-semibold">Estimated Total</p>
          <p className="text-display-md text-ink dark:text-white font-bold">{doc.pricing.total}</p>
        </div>
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={onBack} className="text-body-sm text-body-text hover:text-ink dark:hover:text-white transition-colors px-4 py-2.5">
              ← Back
            </button>
          )}
          {showNext && (
            <button onClick={onNext} className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-md hover:bg-primary-hover transition-colors text-body-sm">
              {labels[step]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function DocumentRequestFlow({ doc }: { doc: LegalDocument }) {
  const [step, setStep] = useState<Step>(0)
  const [leadId, setLeadId] = useState<string>('')
  const [applicationId, setApplicationId] = useState<string>('')
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleFieldChange = useCallback((id: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [id]: val }))
  }, [])

  const handleUpload = useCallback((docId: string, file: File) => {
    const isPdf = file.type === 'application/pdf'
    const previewUrl = isPdf ? null : URL.createObjectURL(file)
    setUploads((prev) => [...prev.filter((u) => u.docId !== docId), { docId, file, previewUrl, isPdf }])
  }, [])

  const handleRemove = useCallback((docId: string) => {
    setUploads((prev) => {
      const target = prev.find((u) => u.docId === docId)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((u) => u.docId !== docId)
    })
  }, [])

  async function handleSubmitApplication() {
    setSubmitting(true)
    try {
      const data = await apiFetch<{ applicationId: string }>('/api/applications', {
        method: 'POST',
        body: JSON.stringify({ leadId, serviceSlug: doc.slug, formData: formValues }),
      })
      setApplicationId(data.applicationId)
      setStep(5)
    } catch {
      alert('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function next() { setStep((s) => Math.min(6, s + 1) as Step) }
  function back() { setStep((s) => Math.max(1, s - 1) as Step) }

  // ── Step 0: Lead Gate (full page, no layout chrome) ──────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d0d0d] py-16 px-4">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16 mb-6">
          <nav className="text-label-caps text-muted flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/documents" className="hover:text-primary transition-colors">Services</Link>
            <span>/</span>
            <Link href={`/documents/${doc.slug}`} className="hover:text-primary transition-colors">{doc.title}</Link>
            <span>/</span>
            <span className="text-ink dark:text-white">Apply</span>
          </nav>
        </div>
        <LeadGate
          serviceSlug={doc.slug}
          serviceTitle={doc.title}
          onSuccess={(id) => { setLeadId(id); setStep(1) }}
        />
      </div>
    )
  }

  // ── Steps 1–6: Main flow ──────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-[#0d0d0d] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-hairline dark:border-white/10 bg-surface-soft dark:bg-[#111]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16 py-3">
          <nav className="text-label-caps text-muted flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/documents" className="hover:text-primary transition-colors">Services</Link>
            <span>/</span>
            <Link href={`/documents/${doc.slug}`} className="hover:text-primary transition-colors">{doc.title}</Link>
            <span>/</span>
            <span className="text-ink dark:text-white">{STEP_LABELS[step]}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-16 py-10">
        <StepBar current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {step === 1 && <StepRequirements doc={doc} onNext={next} />}
            {step === 2 && <StepDetails doc={doc} values={formValues} onChange={handleFieldChange} />}
            {step === 3 && <StepUpload doc={doc} uploads={uploads} onUpload={handleUpload} onRemove={handleRemove} />}
            {step === 4 && <StepReview doc={doc} values={formValues} submitting={submitting} onSubmit={handleSubmitApplication} />}
            {step === 5 && <StepPayment doc={doc} applicationId={applicationId} leadId={leadId} onSuccess={() => setStep(6)} />}
            {step === 6 && <StepSuccess doc={doc} />}
          </div>
          {step < 6 && (
            <div className="hidden lg:block">
              <CostSidebar doc={doc} />
            </div>
          )}
        </div>
      </div>

      {step >= 1 && step <= 3 && (
        <BottomBar doc={doc} step={step} onBack={back} onNext={next} />
      )}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function CheckSm() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" suppressHydrationWarning><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function FileIcon() {
  return <svg className="w-5 h-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" /><polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function UploadIcon() {
  return <svg className="w-6 h-6 text-muted mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="17,8 12,3 7,8" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" /></svg>
}
function PdfIcon() {
  return <svg className="w-8 h-8 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" suppressHydrationWarning><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" /><polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
