'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  apiGetPortalConsultations,
  apiMarkConsultationComplete,
  apiGetAgoraToken,
  type PortalConsultation,
  type ConsultStatus,
} from '@/lib/api'

const TABS: { key: ConsultStatus; label: string }[] = [
  { key: 'pending',   label: 'Pending' },
  { key: 'upcoming',  label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const TYPE_STYLE: Record<string, string> = {
  chat:  'bg-blue-500/15 text-blue-300 border-blue-500/20',
  voice: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  video: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
}
const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-300',
  upcoming:  'bg-[#C9A227]/15 text-[#C9A227]',
  active:    'bg-emerald-500/15 text-emerald-300',
  completed: 'bg-slate-500/15 text-slate-400',
  cancelled: 'bg-red-500/15 text-red-400',
}

function ConsultCard({ c, onComplete, onJoin }: {
  c: PortalConsultation
  onComplete: (id: string) => void
  onJoin: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [note, setNote]         = useState(c.postCallNote ?? '')
  const [saving, setSaving]     = useState(false)

  const date = c.scheduledAt
    ? new Date(c.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'On demand'

  async function handleComplete() {
    setSaving(true)
    try { await onComplete(c.id) } finally { setSaving(false) }
  }

  return (
    <div className="bg-[#0E1220] border border-white/8 rounded-xl overflow-hidden hover:border-white/15 transition-colors">
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-medium text-sm">{c.clientName}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_STYLE[c.type]}`}>
                {c.type.toUpperCase()}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[c.status]}`}>
                {c.status}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">{date}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[#C9A227] font-semibold text-sm">₹{c.fee}</p>
            <p className="text-slate-600 text-xs">{c.durationMin ? `${c.durationMin} min` : 'Per call'}</p>
          </div>
        </div>

        {/* Action buttons visible at all times */}
        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
          {(c.status === 'upcoming' || c.status === 'active' || c.status === 'pending') && (
            <button
              onClick={() => onJoin(c.id)}
              className="flex-1 py-2 rounded-lg bg-[#C9A227] hover:bg-[#D4B840] text-[#0A0D14] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              {c.type === 'video' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>}
              {c.type === 'voice' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 1.22 2 2 0 014 .04h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>}
              Join {c.type === 'chat' ? 'Chat' : 'Call'}
            </button>
          )}
          {c.status === 'active' && (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold transition-colors border border-emerald-500/30"
            >
              {saving ? 'Saving…' : 'Mark Complete'}
            </button>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="px-3 py-2 rounded-lg bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-colors"
          >
            {expanded ? 'Less' : 'Details'}
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/8"
          >
            <div className="p-4 space-y-4">
              {c.caseNote && (
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Client's Case Note</p>
                  <p className="text-slate-300 text-sm bg-white/5 rounded-lg p-3">{c.caseNote}</p>
                </div>
              )}
              {(c.status === 'completed' || c.status === 'active') && (
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Post-Call Notes</p>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add notes, recommendations, or a summary for this client…"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-slate-300 text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#C9A227]/50 resize-none"
                  />
                  {c.status === 'active' && (
                    <button
                      onClick={handleComplete}
                      disabled={saving}
                      className="mt-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors"
                    >
                      {saving ? 'Saving…' : 'Save & Mark Complete'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ConsultationsPage() {
  const router  = useRouter()
  const [activeTab, setActiveTab]     = useState<ConsultStatus>('upcoming')
  const [consults, setConsults]       = useState<PortalConsultation[]>([])
  const [loading, setLoading]         = useState(true)

  const load = useCallback(async (tab: ConsultStatus) => {
    setLoading(true)
    const data = await apiGetPortalConsultations(tab)
    setConsults(data)
    setLoading(false)
  }, [])

  useEffect(() => { load(activeTab) }, [activeTab, load])

  const handleComplete = useCallback(async (id: string) => {
    await apiMarkConsultationComplete(id, '')
    load(activeTab)
  }, [activeTab, load])

  const handleJoin = useCallback(async (id: string) => {
    router.push(`/consultation/${id}`)
  }, [router])

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Consultations</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your client sessions and calls</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8 mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key
                ? 'bg-[#C9A227] text-[#0A0D14] font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-[#0E1220] border border-white/8 rounded-xl animate-pulse" />)}
        </div>
      ) : consults.length === 0 ? (
        <div className="text-center py-16 bg-[#0E1220] border border-white/8 rounded-2xl">
          <svg className="w-12 h-12 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          <p className="text-slate-500">No {activeTab} consultations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consults.map(c => (
            <ConsultCard key={c.id} c={c} onComplete={handleComplete} onJoin={handleJoin} />
          ))}
        </div>
      )}
    </div>
  )
}
