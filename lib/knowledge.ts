/**
 * Knowledge Centre presentation helpers.
 *
 * Deliberately a plain module with no 'use client'. These used to live in
 * KnowledgeFeed.tsx, which is a client component — and every export of a client
 * module becomes a client reference on the server, so the article page calling
 * labelFor() during SSR threw and returned a 500 for every card.
 *
 * Both the server-rendered article page and the client feed import from here.
 */

/**
 * Categories describe the reader's situation, not a legal discipline. The
 * previous set (Civil / Corporate / Consumer) gave a model with no legal
 * subject in front of it nothing to anchor on, so tagging was arbitrary.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  property_rent:       'Property',
  family_marriage:     'Family',
  money_consumer:      'Consumer',
  crime_safety:        'Crime & Safety',
  business_compliance: 'Business',
  cyber_online:        'Cyber',
}

export const CATEGORY_TONES: Record<string, { pill: string; accent: string; glow: string }> = {
  property_rent:       { pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', accent: 'bg-emerald-400', glow: 'rgba(52,211,153,0.10)' },
  family_marriage:     { pill: 'bg-pink-500/15 text-pink-300 border-pink-500/25',          accent: 'bg-pink-400',    glow: 'rgba(244,114,182,0.10)' },
  money_consumer:      { pill: 'bg-blue-500/15 text-blue-300 border-blue-500/25',          accent: 'bg-blue-400',    glow: 'rgba(96,165,250,0.10)' },
  crime_safety:        { pill: 'bg-rose-500/15 text-rose-300 border-rose-500/25',          accent: 'bg-rose-400',    glow: 'rgba(251,113,133,0.10)' },
  business_compliance: { pill: 'bg-[#C9A227]/20 text-[#D4AF37] border-[#C9A227]/30',       accent: 'bg-[#C9A227]',   glow: 'rgba(201,162,39,0.12)' },
  cyber_online:        { pill: 'bg-violet-500/15 text-violet-300 border-violet-500/25',    accent: 'bg-violet-400',  glow: 'rgba(167,139,250,0.10)' },
}

/**
 * Where a card's call-to-action should point.
 *
 * A generic "Ask a lawyer" under every card wastes the intent the reader
 * arrived with — someone reading about GST wants the GST service, not a
 * consultation booking.
 */
export const CATEGORY_CTA: Record<string, { label: string; href: string }> = {
  property_rent:       { label: 'Get property documents drafted', href: '/documents' },
  family_marriage:     { label: 'Talk to a family lawyer',        href: '/talk-to-lawyer' },
  money_consumer:      { label: 'Send a legal notice',            href: '/documents' },
  crime_safety:        { label: 'Talk to a lawyer now',           href: '/talk-to-lawyer' },
  business_compliance: { label: 'Get compliance help',            href: '/documents' },
  cyber_online:        { label: 'Talk to a cyber-law expert',     href: '/talk-to-lawyer' },
}

export function ctaFor(category: string) {
  return CATEGORY_CTA[category] ?? { label: 'Ask a lawyer', href: '/talk-to-lawyer' }
}

export function labelFor(category: string): string {
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, ' ')
}

export function toneFor(category: string) {
  return CATEGORY_TONES[category]
    ?? { pill: 'bg-white/10 text-slate-300 border-white/15', accent: 'bg-white/30', glow: 'rgba(255,255,255,0.05)' }
}

export function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 3600) return `${Math.max(1, Math.floor(secs / 60))}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
