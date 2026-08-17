'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Search, FileBadge, Filter } from 'lucide-react'
import { apiGetPendingLawyers, apiApproveLawyer, apiRejectLawyer, type PendingLawyer } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LawyerManagement() {
  const [lawyers, setLawyers] = useState<PendingLawyer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [previewCert, setPreviewCert] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadLawyers()
  }, [])

  async function loadLawyers() {
    setIsLoading(true)
    try {
      const data = await apiGetPendingLawyers()
      setLawyers(data)
    } catch {
      // Admin not authenticated or backend down — show empty state
      setLawyers([])
    } finally {
      setIsLoading(false)
    }
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActionLoading(id)
    try {
      if (action === 'approve') {
        await apiApproveLawyer(id)
        showToast('Lawyer approved and notified.', 'success')
      } else {
        await apiRejectLawyer(id)
        showToast('Application rejected.', 'error')
      }
      setLawyers((prev) => prev.filter((l) => l.account_id !== id))
    } catch (err: any) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = lawyers.filter(
    (l) =>
      `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.bar_council_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-xl backdrop-blur-md border ${
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Lawyer Approvals</h1>
          <p className="text-slate-400">Review and verify new lawyer applications.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <Input
              placeholder="Search by name or Bar ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-black/50 border-white/10 text-white focus:border-[#D4AF37]/50"
            />
          </div>
          <Button variant="secondary" className="h-10 px-3 bg-black/50 border border-white/10 text-white hover:bg-white/5">
            <Filter size={16} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-14 text-center">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Loading applications…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs uppercase bg-white/5 text-slate-300 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Lawyer Details</th>
                  <th className="px-6 py-4 font-medium">Bar Council ID</th>
                  <th className="px-6 py-4 font-medium">Applied On</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((lawyer) => (
                    <motion.tr
                      key={lawyer.account_id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.25 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white mb-0.5">
                          {lawyer.first_name} {lawyer.last_name}
                        </div>
                        <div className="text-xs text-slate-500">{lawyer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300">{lawyer.bar_council_number}</span>
                          <button
                            onClick={() => setPreviewCert(lawyer.account_id)}
                            className="text-[#D4AF37] hover:text-white transition-colors"
                            title="View Certificate"
                          >
                            <FileBadge size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(lawyer.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Pending Review
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="h-8 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                            onClick={() => handleAction(lawyer.account_id, 'approve')}
                            disabled={actionLoading === lawyer.account_id}
                          >
                            {actionLoading === lawyer.account_id
                              ? <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mr-1" />
                              : <Check size={14} className="mr-1" />}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                            onClick={() => handleAction(lawyer.account_id, 'reject')}
                            disabled={actionLoading === lawyer.account_id}
                          >
                            {actionLoading === lawyer.account_id
                              ? <span className="w-3 h-3 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin mr-1" />
                              : <X size={14} className="mr-1" />}
                            Reject
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filtered.length === 0 && !isLoading && (
              <div className="p-14 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Check size={20} className="text-emerald-400" />
                </div>
                <p className="text-slate-400 font-medium">All caught up!</p>
                <p className="text-slate-600 text-sm mt-1">No pending lawyer applications.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {previewCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setPreviewCert(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A0D14] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h3 className="font-medium text-white">Bar Council Certificate</h3>
                <button onClick={() => setPreviewCert(null)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 bg-black/40 flex flex-col items-center gap-3 min-h-[200px] justify-center">
                <FileBadge size={48} className="text-slate-600" />
                <p className="text-slate-400 text-sm font-medium">Certificate stored in Supabase Storage</p>
                <p className="text-slate-600 text-xs font-mono">Lawyer ID: {previewCert}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
