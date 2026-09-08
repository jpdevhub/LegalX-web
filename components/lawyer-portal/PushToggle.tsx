'use client'

import { useWebPush } from '@/hooks/useWebPush'

/**
 * Turns on alerts that survive the tab being closed.
 *
 * Sits in the portal rather than firing on load because the permission prompt
 * has to come from a user gesture — and because a browser only ever asks once.
 * A prompt thrown at someone the moment a page opens gets dismissed, and that
 * dismissal is permanent: the block can only be undone in site settings, which
 * nobody finds. Asking next to an explanation is the difference between a
 * lawyer who gets called and one who cannot be.
 */
export function PushToggle({ compact = false }: { compact?: boolean }) {
  const { state, busy, subscribe, unsubscribe, supported } = useWebPush()

  if (!supported || state === 'unsupported') return null

  if (state === 'subscribed') {
    return (
      <div className={compact ? 'text-xs' : 'rounded-xl border border-white/8 bg-white/[0.03] p-4'}>
        <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Call alerts are on for this device
        </p>
        {!compact && (
          <>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              You will be alerted even with LegalX closed. Turning this off means you can
              only be reached while the portal is open in a tab.
            </p>
            <button
              onClick={unsubscribe}
              disabled={busy}
              className="mt-3 text-xs text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {busy ? 'Turning off…' : 'Turn off on this device'}
            </button>
          </>
        )}
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className={compact ? 'text-xs text-amber-400' : 'rounded-xl border border-amber-500/25 bg-amber-500/8 p-4'}>
        <p className="text-sm font-medium text-amber-300">Call alerts are blocked</p>
        <p className="text-xs text-amber-200/80 mt-1.5 leading-relaxed">
          This browser is refusing notifications for LegalX, and only you can undo that —
          open the padlock in the address bar and set Notifications to Allow. Until then
          you can only be reached with the portal open.
        </p>
      </div>
    )
  }

  if (state === 'unconfigured') return null

  return (
    <div className={compact ? '' : 'rounded-xl border border-[#C9A227]/25 bg-[#C9A227]/8 p-4'}>
      <p className="text-sm font-semibold text-[#D4AF37]">Get called when LegalX is closed</p>
      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
        Right now you can only be reached while this tab is open. Turn on alerts and your
        phone rings for an incoming consultation wherever you are.
      </p>
      <button
        onClick={subscribe}
        disabled={busy}
        className="mt-3 px-4 h-9 rounded-lg bg-[#C9A227] hover:bg-[#D4B840] text-[#0A0D14] text-sm font-bold transition-colors disabled:opacity-50"
      >
        {busy ? 'Enabling…' : 'Enable call alerts'}
      </button>
      {state === 'error' && (
        <p className="text-xs text-red-400 mt-2">
          That did not work. Reload the page and try once more.
        </p>
      )}
    </div>
  )
}
