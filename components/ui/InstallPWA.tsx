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
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-black/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl p-4 shadow-2xl z-50 flex items-center justify-between gap-4"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-white mb-1">Install LegalX App</p>
          <p className="text-xs text-slate-400">Get quick access to consultations from your home screen.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#E5B842] text-black text-xs font-semibold rounded-md transition-colors"
          >
            <Download size={14} />
            Install
          </button>
          
          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
