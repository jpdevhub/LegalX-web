'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

// --- Document types ---
const DOCUMENT_TYPES = [
  {
    id: 'nda',
    label: 'NDA',
    fullLabel: 'Non-Disclosure Agreement',
    desc: 'Protect confidential information shared between parties.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    price: 1999,
  },
  {
    id: 'rental',
    label: 'Rental Agreement',
    fullLabel: 'Rental / Lease Agreement',
    desc: 'A legally binding lease for residential or commercial property.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    price: 1499,
  },
  {
    id: 'poa',
    label: 'Power of Attorney',
    fullLabel: 'Power of Attorney',
    desc: 'Authorize someone to act on your behalf for legal matters.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    price: 2499,
  },
  {
    id: 'will',
    label: 'Will',
    fullLabel: 'Last Will & Testament',
    desc: 'Ensure your assets are distributed according to your final wishes.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    price: 3999,
  },
  {
    id: 'partnership',
    label: 'Partnership Deed',
    fullLabel: 'Partnership Deed',
    desc: 'Define the terms and conditions of a business partnership.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M16 11a4 4 0 10-8 0" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
        <path d="M8 16s1.5-2 4-2 4 2 4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    price: 4999,
  },
]

const STEPS = [
  { label: 'Select' },
  { label: 'Details' },
  { label: 'Payment' },
]

type PaymentChoice = 'now' | 'later' | null

interface FormData {
  name: string
  phone: string
  email: string
  notes: string
}

interface FormErrors {
  name?: string
  phone?: string
  email?: string
}

function generateRefId() {
  return 'LX-' + Math.random().toString(36).toUpperCase().slice(2, 8)
}

// Inner component that reads search params
function RequestFlowInner() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', email: '', notes: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>(null)
  const [submitted, setSubmitted] = useState(false)
  const [refId] = useState(generateRefId)

  // Pre-select doc from URL param (e.g. /request?doc=nda)
  useEffect(() => {
    const docParam = searchParams.get('doc')
    if (docParam) {
      const found = DOCUMENT_TYPES.find((d) => d.id === docParam)
      if (found) setSelectedDoc(found.id)
    }
  }, [searchParams])

  const selectedDocData = DOCUMENT_TYPES.find((d) => d.id === selectedDoc)

  // Step 2 validation
  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !selectedDoc) return
    if (step === 2 && !validateStep2()) return
    if (step === 3) {
      setSubmitted(true)
      return
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => Math.max(1, s - 1))

  if (submitted) {
    return <SuccessState refId={refId} docLabel={selectedDocData?.fullLabel || ''} />
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page title */}
      <div className="text-center mb-10">
        <h1 className="text-display-xl text-ink dark:text-white">Request a Document</h1>
        <p className="text-body-md text-body-text dark:text-slate-400 mt-2">
          Complete the steps below and we'll deliver your document within 24 hours.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-10">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-surface-dark rounded-md border border-hairline dark:border-hairline-dark p-6 md:p-10">
        {step === 1 && (
          <Step1Select selectedDoc={selectedDoc} onSelect={setSelectedDoc} />
        )}
        {step === 2 && (
          <Step2Details formData={formData} onChange={setFormData} errors={errors} />
        )}
        {step === 3 && selectedDocData && (
          <Step3Payment
            doc={selectedDocData}
            paymentChoice={paymentChoice}
            onSelectPayment={setPaymentChoice}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-hairline dark:border-hairline-dark flex items-center justify-between gap-4">
          {step > 1 ? (
            <Button variant="ghost" size="md" onClick={handleBack}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </Button>
          ) : (
            <div aria-hidden />
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedDoc) ||
              (step === 3 && !paymentChoice)
            }
            className="min-w-[140px]"
          >
            {step === 3 ? 'Submit Request' : 'Continue'}
            {step < 3 && (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Step 1: Select Document Type ---
function Step1Select({
  selectedDoc,
  onSelect,
}: {
  selectedDoc: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2 className="text-display-lg text-ink dark:text-white text-center mb-2">
        What document do you need?
      </h2>
      <p className="text-body-sm text-muted text-center mb-8">
        Select a document type to continue.
      </p>

      {/* 3-column grid (5 cards = 3+2 natural wrap) — fixes orphaned card layout */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        style={{ gridAutoRows: '1fr' }}
        role="radiogroup"
        aria-label="Document type selection"
      >
        {DOCUMENT_TYPES.map((doc) => {
          const isSelected = selectedDoc === doc.id
          return (
            <button
              key={doc.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(doc.id)}
              className={cn(
                'flex flex-col items-start text-left p-5 rounded-md border-2',
                'transition-all duration-150 h-full min-h-[160px]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                isSelected
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-hairline dark:border-hairline-dark bg-white dark:bg-surface-dark hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-elevated'
              )}
            >
              {/* Icon — tinted when selected */}
              <div className={cn('mb-3', isSelected ? 'text-primary' : 'text-muted')}>
                {doc.icon}
              </div>
              <h3 className="text-display-md text-ink dark:text-white mb-1">{doc.label}</h3>
              <p className="text-body-sm text-muted leading-snug flex-1">{doc.desc}</p>
              {isSelected && (
                <div className="mt-3 text-label-caps text-primary font-semibold">
                  ₹{doc.price.toLocaleString('en-IN')}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --- Step 2: Contact Details ---
function Step2Details({
  formData,
  onChange,
  errors,
}: {
  formData: FormData
  onChange: (d: FormData) => void
  errors: FormErrors
}) {
  return (
    <div>
      <h2 className="text-display-lg text-ink dark:text-white text-center mb-2">
        Your Details
      </h2>
      <p className="text-body-sm text-muted text-center mb-8">
        We'll use these to prepare your document and keep you updated.
      </p>

      <div className="max-w-lg mx-auto space-y-5">
        <Input
          id="req-name"
          label="Full Name"
          type="text"
          placeholder="Ravi Kumar"
          required
          value={formData.name}
          error={errors.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
        />
        <Input
          id="req-phone"
          label="Phone Number"
          type="tel"
          placeholder="98100 12345"
          required
          value={formData.phone}
          error={errors.phone}
          hint="10-digit Indian mobile number"
          onChange={(e) => onChange({ ...formData, phone: e.target.value })}
        />
        <Input
          id="req-email"
          label="Email Address"
          type="email"
          placeholder="ravi@example.com"
          required
          value={formData.email}
          error={errors.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
        />
        <Textarea
          id="req-notes"
          label="Additional Notes (Optional)"
          placeholder="Any specific requirements, jurisdiction preferences, or details to include in the document..."
          rows={4}
          value={formData.notes}
          onChange={(e) => onChange({ ...formData, notes: e.target.value })}
        />
      </div>
    </div>
  )
}

// --- Step 3: Payment ---
function Step3Payment({
  doc,
  paymentChoice,
  onSelectPayment,
}: {
  doc: (typeof DOCUMENT_TYPES)[0]
  paymentChoice: PaymentChoice
  onSelectPayment: (c: PaymentChoice) => void
}) {
  const serviceFee = 299
  const total = doc.price + serviceFee

  return (
    <div>
      <h2 className="text-display-lg text-ink dark:text-white text-center mb-2">
        Payment Preference
      </h2>
      <p className="text-body-sm text-muted text-center mb-8">
        Choose how you'd like to complete your request.
      </p>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Pay Now card */}
        <button
          onClick={() => onSelectPayment('now')}
          className={cn(
            'w-full flex items-center justify-between p-5 rounded-md border-2 text-left',
            'transition-all duration-150',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            paymentChoice === 'now'
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-hairline dark:border-hairline-dark bg-white dark:bg-surface-dark hover:border-primary/40'
          )}
          aria-pressed={paymentChoice === 'now'}
        >
          <div className="flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-sm flex items-center justify-center', paymentChoice === 'now' ? 'bg-primary/10' : 'bg-surface-soft dark:bg-surface-soft-dark')}>
              <svg className={cn('w-5 h-5', paymentChoice === 'now' ? 'text-primary' : 'text-muted')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="2" y1="10" x2="22" y2="10" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-display-md text-ink dark:text-white">Pay Now</p>
              <p className="text-body-sm text-muted">Secure online payment</p>
            </div>
          </div>
          <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', paymentChoice === 'now' ? 'border-primary' : 'border-hairline dark:border-hairline-dark')}>
            {paymentChoice === 'now' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
        </button>

        {/* Pay Later card */}
        <button
          onClick={() => onSelectPayment('later')}
          className={cn(
            'w-full flex items-center justify-between p-5 rounded-md border-2 text-left',
            'transition-all duration-150',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            paymentChoice === 'later'
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-hairline dark:border-hairline-dark bg-white dark:bg-surface-dark hover:border-primary/40'
          )}
          aria-pressed={paymentChoice === 'later'}
        >
          <div className="flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-sm flex items-center justify-center', paymentChoice === 'later' ? 'bg-primary/10' : 'bg-surface-soft dark:bg-surface-soft-dark')}>
              <svg className={cn('w-5 h-5', paymentChoice === 'later' ? 'text-primary' : 'text-muted')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="12,6 12,12 16,14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-display-md text-ink dark:text-white">Request Callback / Pay Later</p>
              <p className="text-body-sm text-muted">Our team will contact you within 24 hours</p>
            </div>
          </div>
          <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', paymentChoice === 'later' ? 'border-primary' : 'border-hairline dark:border-hairline-dark')}>
            {paymentChoice === 'later' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
        </button>

        {/* Payment summary — shown when "Pay Now" selected */}
        {paymentChoice === 'now' && (
          <div className="mt-4 p-5 rounded-md bg-surface-soft dark:bg-surface-soft-dark border border-hairline dark:border-hairline-dark">
            <h3 className="text-display-md text-ink dark:text-white mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-body-md">
                <span className="text-body-text dark:text-slate-400">{doc.fullLabel}</span>
                <span className="font-semibold text-ink dark:text-white">₹{doc.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-body-text dark:text-slate-400">Platform Service Fee</span>
                <span className="font-semibold text-ink dark:text-white">₹{serviceFee}</span>
              </div>
              <div className="border-t border-hairline dark:border-hairline-dark pt-3 flex justify-between">
                <span className="text-display-md text-ink dark:text-white font-semibold">Total</span>
                <span className="text-display-md text-primary font-bold">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
              <p className="text-body-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  <strong>Payment gateway integration coming soon.</strong> Your request has been received and our team will contact you to complete payment.
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Success state ---
function SuccessState({ refId, docLabel }: { refId: string; docLabel: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-8">
      {/* Animated checkmark */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-check-draw">
        <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="text-display-xl text-ink dark:text-white mb-3">Request Received!</h1>
      <p className="text-body-md text-body-text dark:text-slate-400 leading-relaxed mb-6">
        We'll be in touch within <strong>24 hours</strong> to process your <strong>{docLabel}</strong>. Check your email for a confirmation.
      </p>

      {/* Reference ID */}
      <div className="inline-flex items-center gap-3 bg-surface-soft dark:bg-surface-soft-dark border border-hairline dark:border-hairline-dark rounded-md px-5 py-3 mb-8">
        <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-left">
          <p className="text-label-caps text-muted">Reference ID</p>
          <p className="text-display-md text-ink dark:text-white font-bold tracking-widest">{refId}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button href="/" variant="secondary" size="md">
          Return to Home
        </Button>
        <Button href="/contact" variant="primary" size="md">
          Contact Us
        </Button>
      </div>
    </div>
  )
}

// Exported wrapper with Suspense for useSearchParams
export function RequestFlow() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">Loading...</div>}>
      <RequestFlowInner />
    </Suspense>
  )
}
