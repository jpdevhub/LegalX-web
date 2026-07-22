'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { LegalDocument, FormField } from '@/lib/documents'
import { LeadGate } from './LeadGate'

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
function StepPayment({ doc, applicationId, leadId, onSuccess }: { doc: LegalDocument; applicationId: string; leadId: string; onSuccess: () => void }) {
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setError('')
    setPaying(true)
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL
      // Get amount in paise from doc pricing
      const amountStr = doc.pricing.total.replace(/[^\d]/g, '')
      const amountPaise = parseInt(amountStr) * 100

      // 1. Create Razorpay order
      const orderRes = await fetch(`${backend}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, leadId, serviceSlug: doc.slug, amount: amountPaise }),
      })
      const order = await orderRes.json()
      if (!orderRes.ok) throw new Error(order.error || 'Could not create payment order')

      // 2. Open Razorpay checkout
      const leadName = sessionStorage.getItem('lx_lead_name') || ''

      // @ts-expect-error Razorpay is loaded via CDN script
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'LegalX Online',
        description: doc.title,
        order_id: order.orderId,
        prefill: { name: leadName },
        theme: { color: '#F5A623' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // 3. Verify payment on backend
          const verifyRes = await fetch(`${backend}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              applicationId,
              leadId,
            }),
          })
          if (verifyRes.ok) {
            onSuccess()
          } else {
            setError('Payment verification failed. Please contact support.')
          }
          setPaying(false)
        },
        modal: { ondismiss: () => setPaying(false) },
      })
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Try again.')
      setPaying(false)
    }
  }

  return (
    <div>
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 5 of 6</span>
      <h1 className="text-ink dark:text-white mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        Payment
      </h1>
      <p className="text-body-sm text-body-text dark:text-slate-400 mb-8 leading-relaxed">
        Complete your payment securely via Razorpay. All major UPI apps, cards, and net banking accepted.
      </p>

      {/* Order summary card */}
      <div className="bg-surface-soft dark:bg-white/5 rounded-xl p-6 mb-8 border border-hairline dark:border-white/10 max-w-sm">
        <p className="text-label-caps text-muted uppercase tracking-widest mb-3">Order Summary</p>
        <div className="space-y-2 text-body-sm">
          <div className="flex justify-between">
            <span className="text-body-text dark:text-slate-400">{doc.title}</span>
            <span className="text-ink dark:text-white font-semibold">{doc.pricing.total}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Platform Fee</span><span>₹0</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-hairline dark:border-white/10">
            <span className="font-bold text-ink dark:text-white">Total</span>
            <span className="font-bold text-primary text-[18px]">{doc.pricing.total}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-[13px] text-red-500 mb-4" role="alert">{error}</p>}

      <button
        onClick={handlePay}
        disabled={paying}
        className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-md hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-body-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" />
        </svg>
        {paying ? 'Opening payment…' : `Pay ${doc.pricing.total} Securely`}
      </button>
      <p className="text-[11px] text-muted mt-3">Secured by Razorpay · 256-bit SSL encryption</p>
    </div>
  )
}

// ── Step 6: Success ───────────────────────────────────────────────────────────
function StepSuccess({ doc }: { doc: LegalDocument }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
            <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, serviceSlug: doc.slug, formData: formValues }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
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
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function FileIcon() {
  return <svg className="w-5 h-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" /><polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function UploadIcon() {
  return <svg className="w-6 h-6 text-muted mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="17,8 12,3 7,8" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" /></svg>
}
function PdfIcon() {
  return <svg className="w-8 h-8 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" /><polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
