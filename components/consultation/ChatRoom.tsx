'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  apiFetch,
  apiGetMessages,
  apiSendMessage,
  apiUploadChatAttachment,
  attachmentHref,
  type ChatMessage,
} from '@/lib/api'

/**
 * A text consultation.
 *
 * Chat used to open the video room, which is why it showed a phone icon and
 * waited for a media track that was never coming. No Agora channel is joined
 * here at all: text needs no media, and negotiating WebRTC to carry sentences
 * would be asking a lot of a phone on a train for nothing.
 *
 * Delivery is a four-second poll against the same endpoint that renders the
 * history. Server-Sent Events would be lower latency and the stream is right
 * there — but it has failed three separate times in ways invisible from the
 * browser, and a message that silently never arrives is worse in a chat than a
 * ring that does, because the sender believes it was read.
 */

const POLL_MS = 4000

interface Props {
  consultationId: string
  viewerRole: 'client' | 'lawyer'
  counterpartName?: string
  feePerMinute?: number
  creditPaise?: number
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

function dayOf(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((start(today) - start(d)) / 86_400_000)
  if (diff === 0) return `Today, ${timeOf(iso)}`
  if (diff === 1) return `Yesterday, ${timeOf(iso)}`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + `, ${timeOf(iso)}`
}

function sizeOf(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ChatRoom({
  consultationId, viewerRole, counterpartName, feePerMinute, creditPaise,
}: Props) {
  const router = useRouter()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selfId, setSelfId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [ended, setEnded] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const atBottomRef = useRef(true)
  const fileRef = useRef<HTMLInputElement | null>(null)

  // ── History and polling ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    const pull = async (initial = false) => {
      try {
        const res = await apiGetMessages(consultationId)
        if (cancelled) return
        setSelfId(res.selfId)
        setMessages(prev => {
          const sameLength = prev.length === res.messages.length
          const sameTail = prev[prev.length - 1]?.id === res.messages[res.messages.length - 1]?.id
          return sameLength && sameTail ? prev : res.messages
        })
        if (initial) setError(null)
      } catch (err: unknown) {
        if (!cancelled && initial) setError((err as Error)?.message || 'Could not open this conversation.')
      } finally {
        if (!cancelled && initial) setLoading(false)
      }
    }

    void pull(true)
    const id = setInterval(() => { if (!document.hidden) void pull() }, POLL_MS)
    return () => { cancelled = true; clearInterval(id) }
  }, [consultationId])

  useEffect(() => {
    if (ended) return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [ended])

  // ── Scrolling ──────────────────────────────────────────────────────────────
  // Follow new messages only when the reader is already at the bottom. Yanking
  // someone back down while they are reading earlier messages is worse than
  // making them scroll.
  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages])

  // ── Sending ────────────────────────────────────────────────────────────────
  const push = (m: ChatMessage) => setMessages(prev => [...prev, m])

  const send = async () => {
    const content = draft.trim()
    if (!content || sending) return

    setSending(true)
    setDraft('')
    atBottomRef.current = true

    // Shown at once under a temporary id, then replaced by the saved row.
    // Waiting on a round trip before the words appear makes a chat feel broken
    // on a slow connection, which is exactly when people re-send.
    const optimistic: ChatMessage = {
      id: `pending-${Date.now()}`,
      sender_id: selfId ?? '',
      content,
      created_at: new Date().toISOString(),
    }
    push(optimistic)

    try {
      const { message } = await apiSendMessage(consultationId, { content })
      setMessages(prev => prev.map(m => (m.id === optimistic.id ? message : m)))
    } catch (err: unknown) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setDraft(content) // handed back, not lost
      setError((err as Error)?.message || 'That message did not send.')
    } finally {
      setSending(false)
    }
  }

  const attach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // so the same file can be picked twice
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('That file is over 5 MB. Please send a smaller one.')
      return
    }

    setUploading(true)
    setError(null)
    atBottomRef.current = true
    try {
      const up = await apiUploadChatAttachment(consultationId, file)
      const { message } = await apiSendMessage(consultationId, {
        content: draft.trim() || undefined,
        attachmentUrl: up.path,
        attachmentName: up.name,
        attachmentSize: up.size,
      })
      setDraft('')
      push(message)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'That document did not send.')
    } finally {
      setUploading(false)
    }
  }

  const endChat = async () => {
    setEnded(true)
    try { await apiFetch(`/api/consultations/${consultationId}/end`, { method: 'POST' }) }
    catch { /* settled by the backstop either way */ }
  }

  const exitHref = viewerRole === 'lawyer' ? '/lawyer-dashboard/consultations' : '/talk-to-lawyer'
  const mins = Math.floor(elapsed / 60)
  const fmt = `${String(mins).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
  // Billing charges whole minutes with a one-minute floor, so the running cost
  // shown here matches what settlement will actually take.
  const cost = feePerMinute ? Math.max(1, Math.ceil(elapsed / 60)) * feePerMinute : null
  const other = counterpartName || (viewerRole === 'lawyer' ? 'Client' : 'Your lawyer')

  if (ended) {
    return (
      <div className="min-h-[100dvh] bg-[#060810] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-[#C9A227]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Consultation ended</h2>
          <p className="text-slate-400 text-sm mb-1">
            Duration <span className="text-white font-medium tabular-nums">{fmt}</span>
            {cost !== null && <> · Charged <span className="text-white font-medium">₹{cost}</span></>}
          </p>
          <p className="text-slate-500 text-xs mb-8">
            The full conversation and any documents stay saved to this consultation.
          </p>
          <button
            onClick={() => router.push(exitHref)}
            className="w-full h-11 rounded-xl bg-[#C9A227] text-[#060810] font-semibold text-sm hover:bg-[#E5C050] transition-colors"
          >
            {viewerRole === 'lawyer' ? 'Back to consultations' : 'Back to lawyers'}
          </button>
        </div>
      </div>
    )
  }

  return (
    // 100dvh, not 100vh: on a phone the visual viewport shrinks when the
    // keyboard opens, and vh does not — which is what pushed the composer under
    // the keyboard.
    <div className="h-[100dvh] bg-[#060810] flex flex-col overflow-hidden">

      {/* Who you are talking to */}
      <header className="shrink-0 flex items-center gap-3 px-4 sm:px-5 h-14 border-b border-white/8 bg-[#0E1220]">
        <button
          onClick={() => router.push(exitHref)}
          aria-label="Leave conversation"
          className="shrink-0 -ml-1 p-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="w-9 h-9 rounded-full bg-[#C9A227] grid place-items-center shrink-0">
          <span className="text-[#0A0D14] font-bold text-xs">
            {other.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'LX'}
          </span>
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-semibold text-white truncate leading-tight">{other}</span>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 leading-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden />
            In consultation
          </span>
        </span>
      </header>

      {/* The meter: what this is costing while it runs */}
      <div className="shrink-0 flex items-center gap-3 px-4 sm:px-5 py-2 bg-[#C9A227]/[0.07] border-b border-[#C9A227]/15 text-[12px]">
        <span className="flex items-center gap-1.5 font-mono tabular-nums text-[#D4AF37] font-semibold">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="13" r="8" /><path strokeLinecap="round" d="M12 9v4l2.5 2.5M9 2h6" />
          </svg>
          {fmt}
        </span>
        {cost !== null && (
          <span className="text-slate-400">
            Cost <span className="text-white font-semibold tabular-nums">₹{cost}</span>
          </span>
        )}
        {typeof creditPaise === 'number' && (
          <span className="ml-auto text-slate-400">
            Credit <span className="text-white font-semibold tabular-nums">₹{Math.max(0, Math.round(creditPaise / 100 - (cost ?? 0)))}</span>
          </span>
        )}
      </div>

      {/* Transcript */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5">
        {/*
          justify-end keeps a short conversation resting on the composer rather
          than stranded at the top of an empty screen, which is how every chat
          behaves and how this one did not.
        */}
        <div className="max-w-2xl mx-auto min-h-full flex flex-col justify-end py-4">
          {loading ? (
            <p className="text-center text-sm text-slate-500 py-10">Opening the conversation…</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-slate-300">No messages yet</p>
              <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {viewerRole === 'lawyer'
                  ? 'Say hello, or wait for the client to describe their matter.'
                  : 'Describe your situation, and attach any documents. Everything here is saved to this consultation.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {messages.map((m, i) => {
                const mine = m.sender_id === selfId
                const pending = m.id.startsWith('pending-')
                // A date marker only where the day actually changes.
                const prev = messages[i - 1]
                const newDay = !prev ||
                  new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString()

                return (
                  <li key={m.id}>
                    {newDay && (
                      <p className="text-center my-4">
                        <span className="px-3 py-1 rounded-full bg-white/[0.06] text-[11px] text-slate-400">
                          {dayOf(m.created_at)}
                        </span>
                      </p>
                    )}
                    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[82%] sm:max-w-[70%] px-3.5 py-2.5 text-[14.5px] leading-relaxed ${
                          mine
                            ? `bg-[#C9A227] text-[#0A0D14] rounded-2xl rounded-br-md ${pending ? 'opacity-60' : ''}`
                            : 'bg-white/[0.06] text-slate-100 rounded-2xl rounded-bl-md border border-white/8'
                        }`}
                      >
                        {m.attachment_url && (
                          <a
                            href={attachmentHref(consultationId, m.attachment_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2.5 mb-2 p-2.5 rounded-xl transition-colors ${
                              mine ? 'bg-[#0A0D14]/15 hover:bg-[#0A0D14]/25' : 'bg-white/[0.06] hover:bg-white/[0.1]'
                            }`}
                          >
                            <span className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${mine ? 'bg-[#0A0D14]/20' : 'bg-[#C9A227]/15'}`}>
                              <svg className={`w-4.5 h-4.5 ${mine ? 'text-[#0A0D14]' : 'text-[#C9A227]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline strokeLinecap="round" strokeLinejoin="round" points="14 2 14 8 20 8" />
                              </svg>
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold truncate">
                                {m.attachment_name ?? 'Document'}
                              </span>
                              <span className={`block text-[11px] ${mine ? 'text-[#0A0D14]/60' : 'text-slate-500'}`}>
                                {sizeOf(m.attachment_size)} · tap to open
                              </span>
                            </span>
                          </a>
                        )}

                        {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}

                        <p className={`text-[10.5px] mt-1 tabular-nums ${mine ? 'text-[#0A0D14]/60' : 'text-slate-500'}`}>
                          {pending ? 'Sending…' : timeOf(m.created_at)}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {error && (
        <div className="shrink-0 px-4 sm:px-5 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="max-w-2xl mx-auto text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Composer */}
      <div className="shrink-0 border-t border-white/8 bg-[#0E1220] px-3 sm:px-5 py-2.5">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={attach}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            title="Attach a document"
            aria-label="Attach a document"
            className="shrink-0 w-10 h-10 rounded-full border border-white/12 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 grid place-items-center transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-[#C9A227] rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>

          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              // Enter sends, Shift+Enter breaks the line — what every chat does
              // and what people's hands already expect.
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
            }}
            rows={1}
            maxLength={4000}
            placeholder="Type your message…"
            aria-label="Message"
            className="flex-1 resize-none max-h-32 px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/12 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 transition-colors"
          />

          <button
            onClick={send}
            disabled={!draft.trim() || sending}
            aria-label="Send"
            className="shrink-0 w-10 h-10 rounded-full bg-[#C9A227] hover:bg-[#E5C050] text-[#0A0D14] grid place-items-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.39 1.02l1.05 5.63L14 12l-10.94 1.75-1.05 5.63a1 1 0 001.39 1.02z" />
            </svg>
          </button>

          <button
            onClick={endChat}
            title="End consultation"
            aria-label="End consultation"
            className="shrink-0 w-10 h-10 rounded-full bg-rose-500/90 hover:bg-rose-500 text-white grid place-items-center transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
