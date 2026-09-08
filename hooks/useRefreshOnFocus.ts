'use client'

import { useEffect } from 'react'

/**
 * Re-runs a fetch when the tab is looked at again.
 *
 * The portal loads once on mount, so a lawyer who finished a call and came back
 * saw the numbers from before it — the consultation was recorded, the page just
 * never asked again. Returning from a call is exactly a focus event, so this is
 * the moment to reload rather than a timer polling a page nobody is reading.
 *
 * Both events are needed: `visibilitychange` covers switching tabs and waking a
 * phone, `focus` covers moving between windows on a desktop where the tab was
 * visible the whole time.
 */
export function useRefreshOnFocus(refresh: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const run = () => { if (!document.hidden) refresh() }
    window.addEventListener('focus', run)
    document.addEventListener('visibilitychange', run)
    return () => {
      window.removeEventListener('focus', run)
      document.removeEventListener('visibilitychange', run)
    }
  }, [refresh, enabled])
}
