'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiGetPortalDocuments, apiMarkDocumentComplete, type PortalDocument, type DocServiceType, type DocStatus } from '@/lib/api'

const SERVICE_TABS: { key: DocServiceType; label: string }[] = [
  { key: 'drafting',     label: 'Drafting' },
  { key: 'verification', label: 'Verification' },
]

const DRAFT_SUB: { key: DocStatus; label: string }[] = [
  { key: 'new',               label: 'New Requests' },
  { key: 'in_progress',       label: 'In Progress' },
  { key: 'revision_requested',label: 'Revision' },
  { key: 'delivered',         label: 'Delivered' },
]

const STATUS_STYLE: Record<string, string> = {
  new:                'bg-blue-500/15 text-blue-300',
  in_progress:        'bg-amber-500/15 text-amber-300',
  revision_requested: 'bg-orange-500/15 text-orange-300',
  delivered:          'bg-emerald-500/15 text-emerald-300',
  completed:          'bg-slate-500/15 text-slate-400',
}

function DocCard({ doc, onComplete }: { doc: PortalDocument; onComplete: (id: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [completing, setCompleting] = useState(false)

  async function handleComplete() {
    setCompleting(true)
    try { await onComplete(doc.id) } finally { setCompleting(false) }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // Stub — replace with real upload when endpoint ready
      await new Promise(r => setTimeout(r, 1200))
      alert('Deliverable uploaded. Mark as complete to notify the client.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const overRevision = doc.revisionCount >= 3

  return (
    <div className="bg-[#0E1220] border border-white/8 rounded-xl p-4 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-medium text-sm">{doc.documentType}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[doc.status] ?? 'bg-slate-500/15 text-slate-400'}`}>
              {doc.status.replace('_', ' ')}
            </span>
            {overRevision && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {doc.revisionCount} revisions
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {doc.clientName} • {new Date(doc.createdAt).toLocaleDateString('en-IN')}
          </p>
          {doc.verificationTier && (
            <p className="text-slate-500 text-xs mt-0.5">
              Tier: {doc.verificationTier === 'review_and_consult' ? 'Review + Consultation' : 'Review Only'}
              {doc.pageCount && ` • ${doc.pageCount} pages`}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[#C9A227] font-semibold text-sm">₹{doc.fee}</p>
        </div>
      </div>

      {/* Actions */}
      {(doc.status === 'in_progress' || doc.status === 'new') && (
        <div className="flex gap-2 mt-2">
          <label className="flex-1 cursor-pointer">
            <span className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors border border-white/10">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              {uploading ? 'Uploading…' : 'Upload Deliverable'}
            </span>
            <input
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
            />
          </label>
          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex-1 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold transition-colors border border-emerald-500/30"
          >
            {completing ? 'Saving…' : 'Mark Complete'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function DocumentsPage() {
  const [serviceTab, setServiceTab] = useState<DocServiceType>('drafting')
  const [draftTab,   setDraftTab]   = useState<DocStatus>('new')
  const [docs, setDocs]             = useState<PortalDocument[]>([])
  const [loading, setLoading]       = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const status = serviceTab === 'drafting' ? draftTab : undefined
    const data   = await apiGetPortalDocuments(serviceTab, status)
    setDocs(data)
    setLoading(false)
  }, [serviceTab, draftTab])

  useEffect(() => { load() }, [load])

  const handleComplete = useCallback(async (id: string) => {
    await apiMarkDocumentComplete(id)
    load()
  }, [load])

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Documents</h1>
        <p className="text-slate-400 text-sm mt-1">Drafting and verification requests from clients</p>
      </div>

      {/* Service type tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8 mb-4 w-fit">
        {SERVICE_TABS.map(t => (
          <button key={t.key} onClick={() => setServiceTab(t.key)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${serviceTab === t.key ? 'bg-[#C9A227] text-[#0A0D14] font-bold' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Drafting sub-tabs */}
      {serviceTab === 'drafting' && (
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {DRAFT_SUB.map(t => (
            <button key={t.key} onClick={() => setDraftTab(t.key)} className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${draftTab === t.key ? 'bg-white/10 text-white border-white/20' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Doc list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-[#0E1220] border border-white/8 rounded-xl animate-pulse" />)}</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 bg-[#0E1220] border border-white/8 rounded-2xl">
          <svg className="w-12 h-12 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <p className="text-slate-500 text-sm">No documents in this queue</p>
        </div>
      ) : (
        <div className="space-y-3">{docs.map(d => <DocCard key={d.id} doc={d} onComplete={handleComplete} />)}</div>
      )}
    </div>
  )
}
