'use client'

import { motion, type Variants } from 'framer-motion'

// ─── Shared variants ───────────────────────────────────────────────────────

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

export const staggerContainerVariant: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
}

export const fadeUpChildVariant: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

export const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── Reusable wrapper components ──────────────────────────────────────────

interface MotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
}

/**
 * Fades in and slides up when scrolled into view.
 * Use for individual elements.
 */
export function FadeUp({ children, className, delay = 0, style }: MotionProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={fadeUpVariant}
      custom={delay}
    >
      {children}
    </motion.div>
  )
}

/**
 * Parent container that staggers its children FadeUpChild components.
 * Use as the grid/list wrapper.
 */
export function StaggerParent({ children, className, style }: Omit<MotionProps, 'delay'>) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={staggerContainerVariant}
    >
      {children}
    </motion.div>
  )
}

/**
 * Child item inside a StaggerParent. Must be a direct child.
 */
export function FadeUpChild({ children, className }: Omit<MotionProps, 'delay'>) {
  return (
    <motion.div className={className} variants={fadeUpChildVariant}>
      {children}
    </motion.div>
  )
}

/**
 * Scales in slightly while fading in. Good for cards/modals.
 */
export function ScaleIn({ children, className, delay = 0 }: MotionProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={scaleInVariant}
      custom={delay}
    >
      {children}
    </motion.div>
  )
}
