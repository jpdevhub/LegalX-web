'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false)
  const [promptInstall, setPromptInstall] = useState<any>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed
    if (localStorage.getItem('pwa_prompt_dismissed')) {
      setIsDismissed(true)
      return
    }

    /**
     * Desktop Chrome fires beforeinstallprompt too, which is why this banner
     * was appearing on laptops. "Add to home screen" only means something on a
     * handset, so the prompt is limited to a small, touch-primary screen — and
     * skipped entirely once the app is already running installed.
     */
    const isPhone =
      window.matchMedia('(max-width: 767px)').matches &&
      window.matchMedia('(pointer: coarse)').matches
    const alreadyInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari reports installed state here rather than via display-mode.
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    if (!isPhone || alreadyInstalled) return

    const handler = (e: any) => {
      e.preventDefault()
      setSupportsPWA(true)
      setPromptInstall(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    if (!promptInstall) return
    promptInstall.prompt()
    promptInstall.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      setSupportsPWA(false)
    })
  }

  const onDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
    setSupportsPWA(false)
  }

  if (!supportsPWA || isDismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        // A slim bar, not a card. This sits over the page a reader is trying
        // to use, so it takes one line and clears the WhatsApp button's lane.
        className="fixed bottom-3 left-3 right-[84px] bg-black/85 backdrop-blur-md border border-[#D4AF37]/30 rounded-sm px-3 py-2 shadow-xl z-50 flex items-center gap-3"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <span className="w-7 h-7 shrink-0 rounded-sm bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center">
          <Download size={14} className="text-[#D4AF37]" />
        </span>

        <p className="flex-1 min-w-0 text-[12.5px] font-medium text-white leading-tight truncate">
          Add LegalX to your home screen
        </p>

        <button
          onClick={onClick}
          className="shrink-0 px-3 h-7 bg-[#D4AF37] hover:bg-[#E5B842] text-black text-[12px] font-bold rounded-sm transition-colors"
        >
          Install
        </button>

        <button
          onClick={onDismiss}
          className="shrink-0 p-1 text-slate-500 hover:text-white transition-colors rounded-sm hover:bg-white/10"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
