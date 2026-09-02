'use client'

import { useEffect, useState } from 'react'
import type { IngestJob } from '@/lib/api'

/**
 * Shown while a run is in flight.
 *
 * A batch takes minutes, and a bare spinner for that long reads as a hang. The
 * rotating notes give the wait a shape and explain what the pipeline is
 * actually doing — including why it pauses, which would otherwise look broken.
 */
const NOTES = [
  'Every card must quote its source word-for-word. If the quote is not in the text, the card is discarded before you see it.',
  'Administrative notices — recovery certificates, auction results — are filtered out by title, before they cost anything.',
  'Cards land in your queue as they are made. If a run stops early, everything it produced is already saved.',
  'Rejecting a suggestion is not wasted work: it stops the same item being proposed again tomorrow.',
  'Sources are limited to official records — regulators, government feeds, bare Acts. News sites are copyrighted.',
  'A summary that cannot be grounded in the source is skipped. A skipped item costs nothing; a wrong one is a liability.',
  'The relevance score is how much a change matters to an ordinary person. Anything under 3 never reaches this queue.',
  'Court judgments carry no copyright in India — Section 52(1)(q)(iv) of the Copyright Act puts them in the public domain.',
]

function useCountdown(iso: string | null): number {
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (!iso) { setLeft(0); return }
    const tick = () => setLeft(Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [iso])
  return left
}

export function IngestProgress({ job, target }: { job: IngestJob; target: number }) {
  const [note, setNote] = useState(0)
  const cooldownLeft = useCountdown(job.cooldownUntil)

  useEffect(() => {
    const id = setInterval(() => setNote(n => (n + 1) % NOTES.length), 7000)
    return () => clearInterval(id)
  }, [])

  const total = job.total || target
  const pct = total > 0 ? Math.min(100, Math.round((job.processed / total) * 100)) : 0
  const paused = cooldownLeft > 0

  return (
    <div className="mb-4 rounded-lg bg-[#C9A227]/[0.07] border border-[#C9A227]/25 overflow-hidden">
      <div className="h-1 bg-white/5">
        <div
          className={`h-full transition-all duration-700 ${paused ? 'bg-amber-500' : 'bg-[#C9A227]'}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-2.5">
          {paused ? (
            <span className="w-4 h-4 rounded-full border-2 border-amber-500/40 border-t-amber-400 animate-spin shrink-0" />
          ) : (
            <span className="w-4 h-4 border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin shrink-0" />
          )}
          <p className="text-xs font-semibold text-[#D4AF37]">
            {paused
              ? `Provider quota reached — resuming in ${cooldownLeft}s`
              : `Working… ${job.processed} of ${total} added`}
          </p>
        </div>

        <p className="mt-2 text-[11px] text-slate-500 leading-relaxed min-h-[2.4em]">
          {paused
            ? 'Per-minute limits refill on their own. The run is waiting it out rather than giving up — nothing already created is lost.'
            : NOTES[note]}
        </p>

        <p className="mt-2 text-[11px] text-slate-600">
          Runs in the background — you can close this and carry on.
        </p>
      </div>
    </div>
  )
}
