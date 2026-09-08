'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, apiGetMessages, apiSendMessage, type ChatMessage } from '@/lib/api'

/**
 * A text consultation.
 *
 * Chat used to open the video room, which is why it showed a phone icon and
 * "Waiting for lawyer…" — there was no message list, no composer and no send
 * path anywhere in the app. This is that missing half.
 *
 * No Agora channel is joined at all: text needs no media, and a call room that
 * negotiates WebRTC to carry sentences would be asking a lot of a phone on a
 * train for nothing.
 *
 * Delivery is a four-second poll against the same endpoint that renders the
 * history. Server-Sent Events would be lower latency, and the stream is right
 * there — but it has failed three separate times in ways invisible from the
 * browser, and a message that silently never arrives is worse in a chat than in
 * a ring, because the sender believes it was read.
 */

const POLL_MS = 4000

interface Props {
  consultationId: string
  viewerRole: 'client' | 'lawyer'
  /** Per-minute rate, shown so nobody is surprised by the total. */
  feePerMinute?: number
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export default function ChatRoom({ consultationId, viewerRole, feePerMinute }: Props) {
  const router = useRouter()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selfId, setSelfId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [ended, setEnded] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const atBottomRef = useRef(true)

  // ── History and polling ────────────────────────────────────────────────────
  // The fetch lives inside the effect with a cancelled guard, so nothing sets
  // state after unmount and nothing is set synchronously as the effect runs.
  useEffect(() => {
    let cancelled = false

    const pull = async (initial = false) => {
      try {
        const res = await apiGetMessages(consultationId)
        if (cancelled) return
        setSelfId(res.selfId)
        setMessages(prev => {
          // Replaced only when something actually changed, so a poll returning
          // the same transcript does not re-render the list every four seconds.
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

  // ── Duration, for the same reason the call room shows one ──────────────────
  useEffect(() => {
    if (ended) return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [ended])

  // ── Scrolling ──────────────────────────────────────────────────────────────
  // Only follow new messages when the reader is already at the bottom. Yanking
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
  const send = async () => {
    const content = draft.trim()
    if (!content || sending) return

    setSending(true)
    setDraft('')
    atBottomRef.current = true

    // Shown immediately under a temporary id, then replaced by the saved row.
    // Waiting on a round trip before the words appear makes a chat feel broken
    // on a slow connection, which is exactly when people re-send.
    const optimistic: ChatMessage = {
      id: `pending-${Date.now()}`,
      sender_id: selfId ?? '',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const { message } = await apiSendMessage(consultationId, content)
      setMessages(prev => prev.map(m => (m.id === optimistic.id ? message : m)))
    } catch (err: unknown) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setDraft(content) // handed back, not lost
      setError((err as Error)?.message || 'That message did not send.')
    } finally {
      setSending(false)
    }
  }

  const endChat = async () => {
    setEnded(true)
    try { await apiFetch(`/api/consultations/${consultationId}/end`, { method: 'POST' }) }
    catch { /* the record is settled by the backstop either way */ }
  }

  const exitHref = viewerRole === 'lawyer' ? '/lawyer-dashboard/consultations' : '/talk-to-lawyer'
  const mins = Math.floor(elapsed / 60)
  const fmt = `${String(mins).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  if (ended) {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-[#C9A227]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Consultation ended</h2>
          <p className="text-slate-400 text-sm mb-1">
            Duration <span className="text-white font-medium tabular-nums">{fmt}</span>
          </p>
          <p className="text-slate-500 text-xs mb-8">
            The full conversation is saved to this consultation.
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
    <div className="min-h-screen bg-[#060810] flex flex-col">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 sm:px-6 h-14 border-b border-white/8 bg-[#0A0D14]">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" aria-hidden />
        <span className="font-semibold text-white text-sm">Chat consultation</span>
        <span className="font-mono text-[#C9A227] text-sm tabular-nums">{fmt}</span>
        <span className="text-xs text-slate-500 ml-auto hidden sm:inline">
          {feePerMinute ? `₹${feePerMinute}/min · charged per minute` : 'Charged per minute'}
        </span>
      </header>

      {/* Transcript */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5"
      >
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <p className="text-center text-sm text-slate-500 py-10">Opening the conversation…</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-medium text-slate-300">No messages yet</p>
              <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {viewerRole === 'lawyer'
                  ? 'Say hello, or wait for the client to describe their matter.'
                  : 'Describe your situation. Everything here is saved to this consultation.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {messages.map(m => {
                const mine = m.sender_id === selfId
                const pending = m.id.startsWith('pending-')
                return (
                  <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] px-3.5 py-2.5 rounded-2xl text-[14.5px] leading-relaxed ${
                        mine
                          ? `bg-[#C9A227] text-[#0A0D14] rounded-br-md ${pending ? 'opacity-60' : ''}`
                          : 'bg-white/[0.06] text-slate-100 rounded-bl-md border border-white/8'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      <p className={`text-[10.5px] mt-1 tabular-nums ${mine ? 'text-[#0A0D14]/60' : 'text-slate-500'}`}>
                        {pending ? 'Sending…' : timeOf(m.created_at)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {error && (
        <div className="shrink-0 px-4 sm:px-6 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="max-w-2xl mx-auto text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Composer */}
      <div className="shrink-0 border-t border-white/8 bg-[#0A0D14] px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-2.5">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              // Enter sends, Shift+Enter breaks the line — what every chat does,
              // and what people's hands already expect.
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
            }}
            rows={1}
            maxLength={4000}
            placeholder="Write a message"
            aria-label="Message"
            className="flex-1 resize-none max-h-32 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/12 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 transition-colors"
          />
          <button
            onClick={send}
            disabled={!draft.trim() || sending}
            className="shrink-0 h-11 px-4 rounded-xl bg-[#C9A227] hover:bg-[#E5C050] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
          <button
            onClick={endChat}
            title="End consultation"
            aria-label="End consultation"
            className="shrink-0 w-11 h-11 rounded-xl bg-rose-500/90 hover:bg-rose-500 text-white grid place-items-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
