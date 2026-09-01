'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ExternalLink, Check, X, Ban, Flag, RotateCcw, ShieldCheck,
} from 'lucide-react'
import {
  apiGetAdminLawyer, apiApproveLawyer, apiRejectLawyer,
  apiSuspendLawyer, apiReinstateLawyer, apiFlagLawyer,
  type AdminLawyerDetail, type DisciplinaryFlag,
} from '@/lib/api'
import {
  StatusBadge, ReasonModal, Modal, ErrorState, SkeletonRows, Toast,
  formatDate, formatDateTime, formatCurrency, fullName,
} from '@/components/admin/AdminUI'

type Tab = 'credentials' | 'documents' | 'services' | 'bank'

const TABS: { id: Tab; label: string }[] = [
  { id: 'credentials', label: 'Credentials' },
  { id: 'documents',   label: 'Documents' },
  { id: 'services',    label: 'Services' },
  { id: 'bank',        label: 'Bank' },
]

const DOC_LABELS: Record<string, string> = {
  enrolment_cert: 'Enrolment Certificate',
  bar_id_front:   'Bar ID Card — Front',
  bar_id_back:    'Bar ID Card — Back',
  govt_id:        'Government ID',
  profile_photo:  'Profile Photo',
}

const FLAG_TONES: Record<DisciplinaryFlag['type'], string> = {
  complaint:     'bg-amber-500/15 text-amber-400 border-amber-500/25',
  warning:       'bg-amber-500/15 text-amber-400 border-amber-500/25',
  suspension:    'bg-rose-500/15 text-rose-400 border-rose-500/25',
  reinstatement: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
}

/** Masks all but the last 4 characters — enough to confirm, not enough to reuse. */
function maskTail(value: string | null | undefined, visible = 4): string {
  if (!value) return '—'
  if (value.length <= visible) return value
  return '•'.repeat(Math.min(8, value.length - visible)) + value.slice(-visible)
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-200 break-words">{value ?? '—'}</p>
    </div>
  )
}

export default function AdminLawyerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)

  const [data, setData] = useState<AdminLawyerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('credentials')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  const [showReject, setShowReject] = useState(false)
  const [showSuspend, setShowSuspend] = useState(false)
  const [showFlag, setShowFlag] = useState(false)
  const [flagType, setFlagType] = useState<DisciplinaryFlag['type']>('warning')
  const [flagReason, setFlagReason] = useState('')
  const [flagBusy, setFlagBusy] = useState(false)
  const [flagError, setFlagError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await apiGetAdminLawyer(id))
    } catch (err: any) {
      setError(err?.message || 'Could not load this lawyer.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const run = async (fn: () => Promise<void>, successMsg: string) => {
    setBusy(true)
    try {
      await fn()
      setToast({ msg: successMsg, tone: 'success' })
      await load()
    } catch (err: any) {
      setToast({ msg: err?.message || 'Action failed.', tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const submitFlag = async () => {
    if (flagReason.trim().length < 3) {
      setFlagError('Please enter at least 3 characters.')
      return
    }
    setFlagBusy(true)
    setFlagError(null)
    try {
      await apiFlagLawyer(id, flagType, flagReason.trim())
      setShowFlag(false)
      setFlagReason('')
      setToast({ msg: 'Flag added.', tone: 'success' })
      await load()
    } catch (err: any) {
      setFlagError(err?.message || 'Could not add the flag.')
    } finally {
      setFlagBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-40 rounded bg-white/5 animate-pulse" />
        <div className="h-28 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
        <SkeletonRows rows={5} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-5">
        <Link href="/admin/lawyers" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={15} /> Back to lawyers
        </Link>
        <ErrorState message={error || 'Lawyer not found.'} onRetry={load} />
      </div>
    )
  }

  const p = data.profile
  const status = p.verification_status
  const name = fullName(p.first_name, p.last_name)

  return (
    <div className="space-y-6">
      <Link href="/admin/lawyers" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={15} /> Back to lawyers
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white/[0.03] border border-white/8 p-5"
      >
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
            {data.docs.profile_photo ? (
              // Signed Supabase URL — next/image would need remotePatterns for a
              // host that changes per environment, so a plain img is correct here.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.docs.profile_photo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-slate-500">
                {(p.first_name?.[0] ?? '?').toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-white">{name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-slate-400 mt-1 break-words">{p.email}</p>
            <p className="text-xs text-slate-500 mt-1">
              Bar {p.bar_council_number || '—'}
              <span className="mx-2 text-slate-700">·</span>
              {p.bar_council_state || '—'}
              <span className="mx-2 text-slate-700">·</span>
              Applied {formatDate(p.created_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          {status === 'pending_verification' && (
            <>
              <button
                onClick={() => run(() => apiApproveLawyer(id), `${name} approved.`)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Check size={15} /> Approve
              </button>
              <button
                onClick={() => setShowReject(true)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <X size={15} /> Reject
              </button>
            </>
          )}

          {status === 'suspended' ? (
            <button
              onClick={() => run(() => apiReinstateLawyer(id), `${name} reinstated.`)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <RotateCcw size={15} /> Reinstate
            </button>
          ) : (
            <button
              onClick={() => setShowSuspend(true)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Ban size={15} /> Suspend
            </button>
          )}

          <button
            onClick={() => setShowFlag(true)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Flag size={15} /> Add Flag
          </button>
        </div>

        {p.rejection_reason && status === 'rejected' && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wide mb-1">Rejection reason</p>
            <p className="text-sm text-rose-200">{p.rejection_reason}</p>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-full sm:w-fit overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.id ? 'text-[#0A0D14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="lawyerDetailTab"
                className="absolute inset-0 bg-[#C9A227] rounded-lg"
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5">
        {tab === 'credentials' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="Bar Council Number" value={p.bar_council_number} />
            <Field label="Bar Council State" value={p.bar_council_state} />
            <Field label="Year of Enrolment" value={p.enrolment_year} />
            <Field label="Years of Experience" value={p.years_experience} />
            <Field label="Phone" value={p.phone} />
            <Field label="Firm" value={p.firm_name} />
            <Field label="Government ID Type" value={p.govt_id_type} />
            <Field label="Onboarding Complete" value={p.onboarding_complete ? 'Yes' : 'No'} />
            <Field label="Account Status" value={data.account?.status ?? '—'} />
            <Field label="Last Login" value={data.account?.last_login_at ? formatDateTime(data.account.last_login_at) : 'Never'} />
            <Field
              label="Courts Practiced"
              value={(p.courts_practiced ?? []).length ? (p.courts_practiced as string[]).join(', ') : '—'}
            />
            <Field
              label="Specializations"
              value={(p.specializations ?? []).length ? (p.specializations as string[]).join(', ') : '—'}
            />
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Bio" value={p.bio || '—'} />
            </div>
          </div>
        )}

        {tab === 'documents' && (
          <div className="space-y-2">
            {Object.entries(DOC_LABELS).map(([key, label]) => {
              const url = data.docs[key]
              return (
                <div key={key} className="flex items-center justify-between gap-3 py-3 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {url ? 'Link expires in 24 hours' : 'Not uploaded'}
                    </p>
                  </div>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors"
                    >
                      View <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="shrink-0 text-xs text-slate-600">—</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'services' && (
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Consultation Types
              </p>
              <div className="flex flex-wrap gap-2">
                {(['chat', 'voice', 'video'] as const).map(type => {
                  const on = (p.consultation_types ?? []).includes(type)
                  const fee = p[`consultation_fee_${type}` as keyof typeof p] as number | null
                  return (
                    <span
                      key={type}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize ${
                        on
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-slate-600'
                      }`}
                    >
                      {type} · {fee ? formatCurrency(fee) + '/min' : 'no fee'}
                    </span>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Document Services
              </p>
              {(p.document_services ?? []).length ? (
                <div className="flex flex-wrap gap-2">
                  {(p.document_services as string[]).map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">None enabled.</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              <Field label="Average Rating" value={p.avg_rating ? Number(p.avg_rating).toFixed(1) : '—'} />
              <Field label="Total Reviews" value={p.total_reviews ?? 0} />
              <Field label="Currently Online" value={p.is_online ? 'Yes' : 'No'} />
            </div>
          </div>
        )}

        {tab === 'bank' && (
          data.bank ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Account Holder" value={data.bank.account_holder_name} />
              <Field label="Bank Name" value={data.bank.bank_name} />
              <Field label="IFSC Code" value={maskTail(data.bank.ifsc_code)} />
              <Field label="GST Number" value={maskTail(data.bank.gst_number)} />
              <Field label="UPI ID" value={p.upi_id ? maskTail(p.upi_id, 6) : '—'} />
              <Field label="PAN" value={p.pan_number ? maskTail(p.pan_number) : '—'} />
              <Field
                label="Verified"
                value={
                  data.bank.is_verified
                    ? <span className="inline-flex items-center gap-1 text-emerald-400"><ShieldCheck size={14} /> Yes</span>
                    : <span className="text-amber-400">Not verified</span>
                }
              />
              <Field label="Last Updated" value={formatDateTime(data.bank.updated_at)} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">No bank details submitted yet.</p>
          )
        )}
      </div>

      {/* Disciplinary timeline */}
      <div className="rounded-xl bg-white/[0.03] border border-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">Disciplinary History</h2>
        </div>
        <div className="p-5">
          {data.flags.length === 0 ? (
            <p className="text-sm text-slate-500">No flags on record.</p>
          ) : (
            <ol className="relative border-l border-white/10 ml-2 space-y-5">
              {data.flags.map(flag => (
                <li key={flag.id} className="ml-5">
                  <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${FLAG_TONES[flag.type]}`}>
                      {flag.type}
                    </span>
                    <span className="text-xs text-slate-500">{formatDateTime(flag.created_at)}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-200">{flag.reason}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <ReasonModal
        open={showReject}
        title={`Reject ${name}`}
        label="Reason for rejection"
        placeholder="This is emailed to the lawyer and recorded in the audit log."
        confirmLabel="Reject application"
        destructive
        onCancel={() => setShowReject(false)}
        onConfirm={async reason => {
          await apiRejectLawyer(id, reason)
          setShowReject(false)
          setToast({ msg: `${name} rejected.`, tone: 'success' })
          await load()
        }}
      />

      <ReasonModal
        open={showSuspend}
        title={`Suspend ${name}`}
        label="Reason for suspension"
        placeholder="Recorded as a disciplinary flag and in the audit log."
        confirmLabel="Suspend lawyer"
        destructive
        onCancel={() => setShowSuspend(false)}
        onConfirm={async reason => {
          await apiSuspendLawyer(id, reason)
          setShowSuspend(false)
          setToast({ msg: `${name} suspended.`, tone: 'success' })
          await load()
        }}
      />

      <Modal open={showFlag} title="Add disciplinary flag" onClose={() => setShowFlag(false)}>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
          Flag type
        </label>
        <select
          value={flagType}
          onChange={e => setFlagType(e.target.value as DisciplinaryFlag['type'])}
          className="w-full h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60 mb-4"
        >
          <option value="complaint" className="bg-[#111318]">Complaint</option>
          <option value="warning" className="bg-[#111318]">Warning</option>
          <option value="suspension" className="bg-[#111318]">Suspension</option>
          <option value="reinstatement" className="bg-[#111318]">Reinstatement</option>
        </select>

        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
          Reason
        </label>
        <textarea
          value={flagReason}
          onChange={e => setFlagReason(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Recorded in the disciplinary timeline and audit log."
          className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 resize-none"
        />
        <div className="mt-1.5 flex justify-between text-xs">
          <span className="text-rose-400">{flagError}</span>
          <span className="text-slate-600">{flagReason.length}/500</span>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setShowFlag(false)}
            disabled={flagBusy}
            className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submitFlag}
            disabled={flagBusy}
            className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-60"
          >
            {flagBusy ? 'Saving…' : 'Add flag'}
          </button>
        </div>
      </Modal>

      <Toast message={toast?.msg ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </div>
  )
}
