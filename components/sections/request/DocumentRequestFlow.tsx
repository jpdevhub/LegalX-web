'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { LegalDocument, FormField } from '@/lib/documents'

// ── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5

interface UploadedFile {
  docId: string
  file: File
  previewUrl: string | null   // null for PDFs
  isPdf: boolean
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ['Requirements', 'Your Details', 'Upload Docs', 'Review', 'Confirm']

function StepBar({ current }: { current: Step }) {
  return (
    <nav aria-label="Progress steps" className="mb-8">
      <ol className="flex items-center gap-0 overflow-x-auto">
        {STEP_LABELS.map((label, i) => {
          const num = (i + 1) as Step
          const done = num < current
          const active = num === current
          return (
            <li key={label} className="flex items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
                    done
                      ? 'bg-ink text-white'
                      : active
                      ? 'bg-primary text-white'
                      : 'border-2 border-hairline text-muted'
                  }`}
                >
                  {done ? <CheckSm /> : num}
                </div>
                <span
                  className={`text-label-caps whitespace-nowrap hidden sm:block ${
                    active ? 'text-ink font-semibold' : done ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`w-8 md:w-12 h-px mx-2 flex-shrink-0 ${done ? 'bg-ink' : 'bg-hairline'}`} aria-hidden="true" />
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
  const reqCount = doc.requiredDocs.filter((d) => d.required).length
  return (
    <div>
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 1 of 5 &nbsp;·&nbsp; {doc.estimatedTime} total</span>
      <h1 className="text-ink mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        What you will need for your {doc.title}
      </h1>
      <p className="text-body-sm text-body-text mb-8 leading-relaxed">
        Gather these details before you start — the whole process takes {doc.estimatedTime}.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: doc.estimatedTime, sub: 'Fully online' },
          { label: `${doc.requiredDocs.length} documents`, sub: 'Photos or scans accepted' },
          { label: doc.pricing.total, sub: 'No hidden fees' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-soft rounded-md p-4">
            <p className="text-display-md text-ink font-semibold">{s.label}</p>
            <p className="text-label-caps text-muted mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Documents checklist */}
      <h2 className="text-display-md text-ink mb-4">Documents Checklist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {doc.requiredDocs.map((d, i) => (
          <div key={d.id} className="bg-surface-soft rounded-md p-5">
            <div className="flex items-start justify-between mb-2">
              <FileIcon />
              <span className="text-[12px] font-bold text-muted">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="text-body-sm font-semibold text-ink mb-1">{d.name}</h3>
            <p className="text-[12px] text-muted mb-3 leading-snug">{d.desc}</p>
            <span className={`text-[11px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full ${d.required ? 'bg-ink text-white' : 'bg-hairline text-muted'}`}>
              {d.required ? 'Required' : 'Optional'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Your Details ──────────────────────────────────────────────────────

function StepDetails({
  doc,
  values,
  onChange,
}: {
  doc: LegalDocument
  values: Record<string, string>
  onChange: (id: string, val: string) => void
}) {
  // Group fields by their group label
  const groups: Record<string, FormField[]> = {}
  doc.formFields.forEach((f) => {
    if (!groups[f.group]) groups[f.group] = []
    groups[f.group].push(f)
  })

  return (
    <div>
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 2 of 5</span>
      <h1 className="text-ink mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        Your Details
      </h1>
      <p className="text-body-sm text-body-text mb-8 leading-relaxed">
        Fill in the information that will appear in your {doc.title}. No legal knowledge required.
      </p>

      <div className="space-y-10">
        {Object.entries(groups).map(([groupName, fields]) => (
          <div key={groupName}>
            <h2 className="text-display-md text-ink mb-4 pb-2 border-b border-hairline">{groupName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label htmlFor={field.id} className="block text-body-sm font-medium text-ink mb-1.5">
                    {field.label}
                    {!field.required && <span className="text-muted font-normal ml-1">(optional)</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      id={field.id}
                      value={values[field.id] || ''}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Select…</option>
                      {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      rows={3}
                      placeholder={field.placeholder}
                      value={values[field.id] || ''}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  ) : (
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={values[field.id] || ''}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 text-body-sm text-ink border border-hairline rounded-md bg-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    />
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

function StepUpload({
  doc,
  uploads,
  onUpload,
  onRemove,
}: {
  doc: LegalDocument
  uploads: UploadedFile[]
  onUpload: (docId: string, file: File) => void
  onRemove: (docId: string) => void
}) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function handleFile(docId: string, file: File) {
    onUpload(docId, file)
  }

  function getUpload(docId: string) {
    return uploads.find((u) => u.docId === docId)
  }

  return (
    <div>
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 3 of 5</span>
      <h1 className="text-ink mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        Upload Documents
      </h1>
      <p className="text-body-sm text-body-text mb-8 leading-relaxed">
        Upload clear scans or photos of the required documents. Accepted formats are listed for each.
      </p>

      <div className="space-y-4">
        {doc.requiredDocs.map((reqDoc) => {
          const uploaded = getUpload(reqDoc.id)
          return (
            <div key={reqDoc.id} className="bg-surface-soft rounded-md p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-body-sm font-semibold text-ink">{reqDoc.name}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${reqDoc.required ? 'bg-ink text-white' : 'bg-hairline text-muted'}`}>
                      {reqDoc.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted">{reqDoc.acceptedFormats}</p>
                </div>
              </div>

              {/* Preview area when uploaded */}
              {uploaded && (
                <div className="mb-3">
                  {uploaded.isPdf ? (
                    <div className="flex items-center gap-3 bg-white rounded-md p-3 border border-hairline">
                      <PdfIcon />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-ink truncate">{uploaded.file.name}</p>
                        <p className="text-[11px] text-muted">{(uploaded.file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        onClick={() => onRemove(reqDoc.id)}
                        className="text-muted hover:text-error transition-colors text-[12px]"
                        aria-label={`Remove ${reqDoc.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="relative rounded-md overflow-hidden border border-hairline">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploaded.previewUrl!}
                        alt={`Preview of ${reqDoc.name}`}
                        className="w-full max-h-48 object-contain bg-white"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => onRemove(reqDoc.id)}
                          className="bg-white text-[11px] font-medium text-error px-2 py-1 rounded border border-hairline"
                          aria-label={`Remove ${reqDoc.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload button */}
              {!uploaded && (
                <div
                  className="border-2 border-dashed border-hairline rounded-md p-5 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => inputRefs.current[reqDoc.id]?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[reqDoc.id]?.click()}
                  tabIndex={0}
                  role="button"
                  aria-label={`Upload ${reqDoc.name}`}
                >
                  <UploadIcon />
                  <p className="text-body-sm text-body-text mt-1">Click to upload or drag and drop</p>
                  <p className="text-[11px] text-muted mt-0.5">{reqDoc.acceptedFormats}</p>
                </div>
              )}
              <input
                ref={(el) => { inputRefs.current[reqDoc.id] = el }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                aria-label={`File input for ${reqDoc.name}`}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(reqDoc.id, file)
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 4: Review ────────────────────────────────────────────────────────────

function StepReview({ doc, values }: { doc: LegalDocument; values: Record<string, string> }) {
  // Group filled fields
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
      <span className="text-label-caps text-primary uppercase tracking-widest block mb-2">Step 4 of 5</span>
      <h1 className="text-ink mb-2" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        Review your document
      </h1>
      <p className="text-body-sm text-body-text mb-8 leading-relaxed">
        Verify the details below before proceeding to payment. You can go back to make changes.
      </p>

      {/* Document preview mockup */}
      <div className="bg-white rounded-md border border-hairline p-8 mb-8">
        <div className="text-center mb-6 pb-4 border-b border-hairline">
          <h2 className="text-display-lg text-ink font-bold">{doc.title.toUpperCase()}</h2>
          <p className="text-body-sm text-muted mt-1">This {doc.title} is made and entered into as per {doc.legalAct}</p>
        </div>

        {Object.entries(groups).map(([groupName, fields]) => (
          <div key={groupName} className="mb-6">
            <h3 className="text-label-caps text-primary uppercase tracking-widest mb-3">{groupName}</h3>
            <div className="space-y-2">
              {fields.map((f) => (
                <div key={f.label} className="flex gap-3 text-body-sm">
                  <span className="text-muted w-40 flex-shrink-0">{f.label}:</span>
                  <span className="text-ink font-medium">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6 pt-4 border-t border-hairline">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`h-2 rounded bg-hairline ${i % 3 === 0 ? 'col-span-2' : ''}`} />
            ))}
          </div>
          <p className="text-[11px] text-muted mt-4 text-center">
            [Signature block, witness details, and legal clauses will appear in the final document]
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Step 5: Confirm ───────────────────────────────────────────────────────────

function StepConfirm({ doc }: { doc: LegalDocument }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center mx-auto mb-5">
        <CheckLg />
      </div>
      <h1 className="text-ink mb-3" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2 }}>
        Document request confirmed
      </h1>
      <p className="text-body-md text-body-text mb-8 max-w-md mx-auto leading-relaxed">
        Your {doc.title} is being prepared. You will receive the drafted document at your registered email within 30 minutes.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/documents"
          className="text-body-sm font-semibold text-body-text hover:text-ink transition-colors underline underline-offset-2"
        >
          View all documents
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-ink text-white font-semibold px-6 py-2.5 rounded-md hover:bg-ink/90 transition-colors duration-150 text-body-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

// ── Bottom bar ────────────────────────────────────────────────────────────────

function BottomBar({
  doc,
  step,
  onBack,
  onNext,
  isLastStep,
}: {
  doc: LegalDocument
  step: Step
  onBack: () => void
  onNext: () => void
  isLastStep: boolean
}) {
  const labels: Record<Step, string> = {
    1: 'Continue to Your Details',
    2: 'Continue to Upload Docs',
    3: 'Continue to Review',
    4: 'Proceed to Payment',
    5: 'Done',
  }

  return (
    <div className="sticky bottom-0 bg-white border-t border-hairline py-4 mt-10">
      <div className="max-w-[900px] mx-auto px-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-muted uppercase tracking-wide font-semibold">Estimated Total</p>
          <p className="text-display-md text-ink font-bold">{doc.pricing.total}</p>
        </div>
        <div className="flex items-center gap-3">
          {step > 1 && step < 5 && (
            <button
              onClick={onBack}
              className="text-body-sm text-body-text hover:text-ink transition-colors px-4 py-2.5"
            >
              Back
            </button>
          )}
          {step < 5 && (
            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-md hover:bg-primary-hover transition-colors duration-150 text-body-sm"
            >
              {labels[step]}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar: Cost breakdown ───────────────────────────────────────────────────

function CostSidebar({ doc }: { doc: LegalDocument }) {
  return (
    <div className="bg-surface-soft rounded-md p-6 sticky top-24">
      <h2 className="text-display-md text-ink mb-4 font-bold">{doc.title}</h2>
      <div className="space-y-3 text-body-sm">
        <div className="flex justify-between">
          <span className="text-body-text">Drafting Fee</span>
          <span className="text-ink font-semibold">₹{doc.pricing.drafting.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between border-t border-hairline pt-2">
          <span className="text-body-text">Govt. Duty</span>
          <span className="text-muted">{doc.pricing.govtDuty}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-body-text">Platform Fee</span>
          <span className="text-ink font-semibold">₹0</span>
        </div>
        <div className="flex justify-between border-t border-hairline pt-2">
          <span className="text-ink font-bold">Total (Drafting)</span>
          <span className="text-ink font-bold">{doc.pricing.total}</span>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-hairline space-y-1.5 text-[12px] text-muted">
        <p>Expert-reviewed document</p>
        <p>Delivered within 30 minutes</p>
        <p>Editable Word + PDF format</p>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DocumentRequestFlow({ doc }: { doc: LegalDocument }) {
  const [step, setStep] = useState<Step>(1)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [uploads, setUploads] = useState<UploadedFile[]>([])

  const handleFieldChange = useCallback((id: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [id]: val }))
  }, [])

  const handleUpload = useCallback((docId: string, file: File) => {
    const isPdf = file.type === 'application/pdf'
    const previewUrl = isPdf ? null : URL.createObjectURL(file)
    setUploads((prev) => {
      const filtered = prev.filter((u) => u.docId !== docId)
      return [...filtered, { docId, file, previewUrl, isPdf }]
    })
  }, [])

  const handleRemove = useCallback((docId: string) => {
    setUploads((prev) => {
      const target = prev.find((u) => u.docId === docId)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((u) => u.docId !== docId)
    })
  }, [])

  function next() { setStep((s) => Math.min(5, s + 1) as Step) }
  function back() { setStep((s) => Math.max(1, s - 1) as Step) }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-hairline bg-surface-soft">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16 py-3">
          <nav className="text-label-caps text-muted flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/documents" className="hover:text-primary transition-colors">Documents</Link>
            <span>/</span>
            <Link href={`/documents/${doc.slug}`} className="hover:text-primary transition-colors">{doc.title}</Link>
            <span>/</span>
            <span className="text-ink">{STEP_LABELS[step - 1]}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-16 py-10">
        <StepBar current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            {step === 1 && <StepRequirements doc={doc} onNext={next} />}
            {step === 2 && <StepDetails doc={doc} values={formValues} onChange={handleFieldChange} />}
            {step === 3 && <StepUpload doc={doc} uploads={uploads} onUpload={handleUpload} onRemove={handleRemove} />}
            {step === 4 && <StepReview doc={doc} values={formValues} />}
            {step === 5 && <StepConfirm doc={doc} />}
          </div>

          {/* Sidebar */}
          {step < 5 && (
            <div className="hidden lg:block">
              <CostSidebar doc={doc} />
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      {step < 5 && (
        <BottomBar doc={doc} step={step} onBack={back} onNext={next} isLastStep={step === 4} />
      )}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckSm() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function CheckLg() {
  return (
    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function FileIcon() {
  return (
    <svg className="w-5 h-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
      <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
      <polyline points="10,9 9,9 8,9" strokeLinecap="round" />
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg className="w-6 h-6 text-muted mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17,8 12,3 7,8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
    </svg>
  )
}
function PdfIcon() {
  return (
    <svg className="w-8 h-8 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
