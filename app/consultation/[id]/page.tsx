'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

// Agora must be loaded client-side only (no SSR support)
const VideoRoom = dynamic(() => import('@/components/consultation/VideoRoom'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Connecting to session…</p>
      </div>
    </div>
  ),
})

export default function ConsultationPage() {
  const { id } = useParams<{ id: string }>()
  const params = useSearchParams()
  const router = useRouter()

  const channel  = params.get('channel') || id
  const token    = params.get('token')   || null
  const uid      = Number(params.get('uid') || '0')
  const appId    = params.get('appId')   || process.env.NEXT_PUBLIC_AGORA_APP_ID || ''
  const type     = (params.get('type') || 'video') as 'chat' | 'voice' | 'video'

  if (!channel || !appId) {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-white font-semibold mb-2">Invalid Session</h2>
          <p className="text-slate-400 text-sm mb-5">This consultation link is missing required parameters.</p>
          <button
            onClick={() => router.push('/talk-to-lawyer')}
            className="px-5 py-2.5 rounded-lg bg-[#C9A227] text-[#060810] font-semibold text-sm"
          >
            Back to Lawyers
          </button>
        </div>
      </div>
    )
  }

  return (
    <VideoRoom
      consultationId={id}
      channel={channel}
      token={token}
      uid={uid}
      appId={appId}
      type={type}
    />
  )
}
