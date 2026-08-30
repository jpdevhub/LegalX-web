'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

// Note: AnimatePresence mode="wait" is intentionally removed.
// In framer-motion v12 + Next.js App Router, waiting for exit before entering
// causes the incoming page to stay at opacity:0 during client navigation.
// Simple per-route fade-in on mount is reliable and avoids the bug.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
