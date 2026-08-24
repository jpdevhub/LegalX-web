'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Search, ExternalLink, Eye, AlertCircle, FileText, Image, ChevronDown } from 'lucide-react'
import {
  apiGetPendingLawyers, apiApproveLawyer, apiRejectLawyer,
  apiGetLawyerDocs, type PendingLawyer, type LawyerDocs
} from '@/lib/api'

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending_verification: { label: 'Pending Review', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    verified:  { label: 'Approved', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    rejected:  { label: 'Rejected',  cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'pending_verification' ? 'animate-pulse bg-amber-400' : status === 'verified' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      {s.label}
    </span>
  )
}

function DocLink({ label, url, type }: { label: string; url: string | null; type: 'image' | 'pdf' | 'auto' }) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-slate-600 text-sm">
        <AlertCircle size={14} />
        <span>{label} — not uploaded</span>
      </div>
    )
  }
  const Icon = type === 'pdf' ? FileText : Image
  return (
    <a
      href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/10
        hover:border-[#C9A227]/40 hover:bg-[#C9A227]/5 transition-all group"
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-slate-400 group-hover:text-[#C9A227] transition-colors" />
        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <ExternalLink size={12} className="text-slate-600 group-hover:text-[#C9A227] transition-colors" />
    </a>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LawyerManagement() {
  const [lawyers, setLawyers] = useState<PendingLawyer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Document viewer modal
  const [docsModal, setDocsModal] = useState<{ lawyerId: string; lawyer: PendingLawyer } | null>(null)
  const [docsData, setDocsData] = useState<LawyerDocs | null>(null)
  const [docsLoading, setDocsLoading] = useState(false)
  const [docsError, setDocsError] = useState('')

  // Reject modal
  const [rejectModal, setRejectModal] = useState<PendingLawyer | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectSubmitting, setRejectSubmitting] = useState(false)

  useEffect(() => { loadLawyers() }, [])

  async function loadLawyers() {
    setLoading(true)
    try {
      const data = await apiGetPendingLawyers()
      setLawyers(data)
    } catch {
      setLawyers([])
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function openDocsModal(lawyer: PendingLawyer) {
    setDocsModal({ lawyerId: lawyer.account_id, lawyer })
    setDocsData(null)
    setDocsError('')
    setDocsLoading(true)
    try {
      const data = await apiGetLawyerDocs(lawyer.account_id)
      setDocsData(data)
    } catch (e: any) {
      setDocsError(e.message || 'Failed to load documents')
    } finally {
      setDocsLoading(false)
    }
  }

  async function handleApprove(id: string) {
    setActionLoading(id)
    try {
      await apiApproveLawyer(id)
      setLawyers(prev => prev.filter(l => l.account_id !== id))
      setDocsModal(null)
      showToast('Lawyer approved. Confirmation email sent.', 'success')
    } catch (e: any) {
      showToast(e.message || 'Approval failed. Please try again.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejectSubmit() {
    if (!rejectModal) return
    if (!rejectReason.trim()) return
    setRejectSubmitting(true)
    try {
      await apiRejectLawyer(rejectModal.account_id, rejectReason.trim())
      setLawyers(prev => prev.filter(l => l.account_id !== rejectModal.account_id))
      setDocsModal(null)
      setRejectModal(null)
      setRejectReason('')
      showToast('Application rejected. Lawyer notified with reason.', 'error')
    } catch (e: any) {
      showToast(e.message || 'Rejection failed. Please try again.', 'error')
    } finally {
      setRejectSubmitting(false)
    }
  }

  const filtered = lawyers.filter(l =>
    `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.bar_council_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 relative">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-lg text-sm font-medium shadow-xl backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-emerald-900/80 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-900/80 border-rose-500/30 text-rose-200'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Lawyer Applications</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {loading ? 'Loading…' : `${filtered.length} pending verification`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search by name, email or Bar ID…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm
              placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/40 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Loading applications…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Check size={20} className="text-emerald-400" />
            </div>
            <p className="text-slate-300 font-medium">All caught up</p>
            <p className="text-slate-600 text-sm mt-1">No pending lawyer applications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Lawyer</th>
                  <th className="px-6 py-4 font-medium">Bar Council</th>
                  <th className="px-6 py-4 font-medium">Submitted</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map(lawyer => (
                    <motion.tr
                      key={lawyer.account_id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#C9A227]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#C9A227] text-xs font-bold">
                              {lawyer.first_name?.[0]}{lawyer.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{lawyer.first_name} {lawyer.last_name}</div>
                            <div className="text-xs text-slate-500">{lawyer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-300 text-xs bg-white/5 px-2 py-1 rounded">
                          {lawyer.bar_council_number || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(lawyer.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={lawyer.verification_status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDocsModal(lawyer)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium
                              bg-white/5 border border-white/10 text-slate-300 hover:border-[#C9A227]/40 hover:text-[#C9A227] transition-all"
                          >
                            <Eye size={13} />
                            Documents
                          </button>
                          <button
                            onClick={() => handleApprove(lawyer.account_id)}
                            disabled={actionLoading === lawyer.account_id}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium
                              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                              hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                          >
                            {actionLoading === lawyer.account_id
                              ? <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                              : <Check size={13} />}
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectModal(lawyer); setRejectReason('') }}
                            disabled={actionLoading === lawyer.account_id}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium
                              bg-rose-500/10 border border-rose-500/20 text-rose-400
                              hover:bg-rose-500/20 transition-all disabled:opacity-50"
                          >
                            <X size={13} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Document Viewer Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {docsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setDocsModal(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              {/* Modal header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                <div>
                  <h3 className="font-semibold text-white">
                    {docsModal.lawyer.first_name} {docsModal.lawyer.last_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{docsModal.lawyer.email}</p>
                </div>
                <button onClick={() => setDocsModal(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6">
                {docsLoading ? (
                  <div className="py-12 text-center">
                    <div className="w-7 h-7 border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Loading documents…</p>
                  </div>
                ) : docsError ? (
                  <div className="py-8 text-center">
                    <AlertCircle size={28} className="text-rose-400 mx-auto mb-3" />
                    <p className="text-rose-300 text-sm">{docsError}</p>
                    <button
                      onClick={() => openDocsModal(docsModal.lawyer)}
                      className="mt-3 text-xs text-slate-400 hover:text-white underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : docsData ? (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Submitted Documents — links expire in 24 hours
                    </p>
                    <DocLink label="Enrolment Certificate" url={docsData.docs.enrolment_cert} type="auto" />
                    <DocLink label="Bar Council ID — Front" url={docsData.docs.bar_id_front} type="image" />
                    <DocLink label="Bar Council ID — Back" url={docsData.docs.bar_id_back} type="image" />
                    <DocLink
                      label={`Government ID (${docsData.lawyer.govtIdType || 'ID'})`}
                      url={docsData.docs.govt_id}
                      type="auto"
                    />
                    {docsData.docs.profile_photo && (
                      <DocLink label="Profile Photo" url={docsData.docs.profile_photo} type="image" />
                    )}

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs text-slate-500 mb-3">
                        Verify the enrolment number against the
                        <a href="https://www.barcouncilofindia.org" target="_blank" rel="noopener noreferrer"
                          className="text-[#C9A227] ml-1 hover:underline">
                          Bar Council of India portal
                        </a>
                        , then approve or reject.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(docsModal.lawyerId)}
                          disabled={actionLoading === docsModal.lawyerId}
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold
                            bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                            hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          {actionLoading === docsModal.lawyerId
                            ? <span className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                            : <Check size={15} />}
                          Approve & Notify
                        </button>
                        <button
                          onClick={() => { setRejectModal(docsModal.lawyer); setRejectReason('') }}
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold
                            bg-rose-500/10 border border-rose-500/20 text-rose-400
                            hover:bg-rose-500/20 transition-all"
                        >
                          <X size={15} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reject with Reason Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !rejectSubmitting && setRejectModal(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl z-10 p-6"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-semibold text-white">Reject Application</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {rejectModal.first_name} {rejectModal.last_name} will be notified with this reason.
                  </p>
                </div>
                <button
                  onClick={() => setRejectModal(null)}
                  disabled={rejectSubmitting}
                  className="text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Rejection Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="e.g. The enrolment certificate submitted does not match the provided enrolment number. Please resubmit a clear, legible copy of the original certificate issued by the Bar Council."
                  disabled={rejectSubmitting}
                  className="w-full px-3.5 py-3 rounded-lg bg-white/5 border border-white/15 text-white text-sm
                    placeholder:text-slate-600 focus:outline-none focus:border-rose-500/40 transition-all resize-none
                    disabled:opacity-50"
                />
                <p className="text-xs text-slate-600 mt-1">{rejectReason.length} characters</p>
              </div>

              {/* Quick-fill suggestions */}
              <div className="mb-5">
                <p className="text-xs text-slate-600 mb-2">Quick fill:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Document illegible or unclear',
                    'Enrolment number does not match certificate',
                    'Government ID expired',
                    'Bar Council ID front/back mismatch',
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setRejectReason(suggestion)}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  disabled={rejectSubmitting}
                  className="flex-1 h-10 rounded-lg text-sm text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim() || rejectSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold
                    bg-rose-500/20 border border-rose-500/30 text-rose-300
                    hover:bg-rose-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {rejectSubmitting
                    ? <span className="w-4 h-4 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                    : <X size={14} />}
                  Reject & Notify
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
