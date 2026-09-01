'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Inbox } from 'lucide-react'

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatCurrency(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  })
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  })
}

export function fullName(first?: string | null, last?: string | null, fallback = 'Unnamed'): string {
  const name = [first, last].filter(Boolean).join(' ').trim()
  return name || fallback
}

/** Hours since `iso`. Drives the SLA colouring on the verification queue. */
export function hoursSince(iso: string | null | undefined): number {
  if (!iso) return 0
  return (Date.now() - new Date(iso).getTime()) / 36e5
}

export function formatAge(iso: string | null | undefined): string {
  const hours = hoursSince(iso)
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`
  if (hours < 24) return `${Math.floor(hours)}h`
  return `${Math.floor(hours / 24)}d`
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  verified:             'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  pending_verification: 'bg-[#C9A227]/15 text-[#D4AF37] border-[#C9A227]/25',
  pending_signup:       'bg-slate-500/15 text-slate-400 border-slate-500/25',
  unverified:           'bg-slate-500/15 text-slate-400 border-slate-500/25',
  rejected:             'bg-rose-500/15 text-rose-400 border-rose-500/25',
  suspended:            'bg-rose-500/15 text-rose-400 border-rose-500/25',
  active:               'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  open:                 'bg-[#C9A227]/15 text-[#D4AF37] border-[#C9A227]/25',
  investigating:        'bg-blue-500/15 text-blue-400 border-blue-500/25',
  resolved:             'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  escalated:            'bg-rose-500/15 text-rose-400 border-rose-500/25',
  credit:               'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  debit:                'bg-rose-500/15 text-rose-400 border-rose-500/25',
}

const STATUS_LABELS: Record<string, string> = {
  pending_verification: 'Pending',
  pending_signup: 'Incomplete',
}

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/25'
  const label = STATUS_LABELS[status] ?? status.replace(/_/g, ' ')
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap ${style} ${className}`}
    >
      {label}
    </span>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  // Escape-to-close and background scroll lock, so the modal behaves like a
  // modal rather than a floating div.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-[460px] max-h-[90vh] overflow-y-auto bg-[#111318] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/8 sticky top-0 bg-[#111318]">
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1 -mr-1 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 sm:px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Reason modal ──────────────────────────────────────────────────────────────

/**
 * Collects a mandatory free-text reason before a destructive action. Used for
 * rejection, suspension, flags and wallet adjustments — every one of which
 * lands in the audit log, so the reason cannot be optional.
 */
export function ReasonModal({
  open,
  title,
  label = 'Reason',
  placeholder = 'Explain why — this is recorded in the audit log',
  confirmLabel = 'Confirm',
  destructive = false,
  minLength = 3,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  label?: string
  placeholder?: string
  confirmLabel?: string
  destructive?: boolean
  minLength?: number
  onCancel: () => void
  onConfirm: (reason: string) => Promise<void> | void
}) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setReason(''); setError(null); setBusy(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [open])

  const submit = async () => {
    if (reason.trim().length < minLength) {
      setError(`Please enter at least ${minLength} characters.`)
      return
    }
    setBusy(true); setError(null)
    try {
      await onConfirm(reason.trim())
    } catch (err: any) {
      setBusy(false)
      setError(err?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <Modal open={open} title={title} onClose={busy ? () => {} : onCancel}>
      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <textarea
        ref={textareaRef}
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={4}
        maxLength={500}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 focus:bg-white/10 transition-all resize-none"
      />
      <div className="mt-1.5 flex justify-between text-xs">
        <span className="text-rose-400">{error}</span>
        <span className="text-slate-600">{reason.length}/500</span>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onCancel}
          disabled={busy}
          className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className={`flex-1 h-11 rounded-lg font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            destructive
              ? 'bg-rose-500 hover:bg-rose-400 text-white'
              : 'bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14]'
          }`}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

// ── States ────────────────────────────────────────────────────────────────────

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
        <Inbox size={20} className="text-slate-500" />
      </div>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500 max-w-xs">{hint}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3">
        <AlertTriangle size={20} className="text-rose-400" />
      </div>
      <p className="text-sm font-medium text-slate-300 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function SkeletonRows({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg bg-white/[0.03] border border-white/5 animate-pulse" />
      ))}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between gap-3 pt-4 flex-wrap">
      <p className="text-xs text-slate-500">
        Showing <span className="text-slate-300">{first}–{last}</span> of{' '}
        <span className="text-slate-300">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-xs text-slate-500 tabular-nums px-1">
          {page} / {pages}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

export function Toast({
  message,
  tone = 'success',
  onDone,
}: {
  message: string | null
  tone?: 'success' | 'error'
  onDone: () => void
}) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDone, 4000)
    return () => clearTimeout(timer)
  }, [message, onDone])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[110] px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl max-w-[90vw] ${
            tone === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
