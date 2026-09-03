'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Floating WhatsApp contact button.
 *
 * A direct line rather than a support form: people will send a voice note or a
 * screenshot of what broke, which is far more useful than a text field they
 * have to summarise into — and far more likely to actually get sent.
 *
 * The number is an env var with a default so a deployment can point it at a
 * different handset without a code change.
 */
const NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918252208569').replace(/\D/g, '')

/**
 * Routes where a floating button would be in the way rather than helpful:
 * during a live call it overlaps the mute/hang-up controls, and the admin
 * portal is staff-only.
 */
const HIDDEN_PREFIXES = ['/consultation/', '/admin']

/**
 * Routes with their own fixed bottom bar on mobile. A lawyer profile pins the
 * chat/voice/video buttons to the bottom edge, and the button would sit on top
 * of them. The trailing slash keeps this to profile pages, not the listing.
 */
const RAISED_PREFIXES = ['/talk-to-lawyer/']

export function WhatsAppButton() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  // Show the label once, briefly, so the button reads as "talk to us" rather
  // than an unlabelled green circle — then collapse and stay out of the way.
  useEffect(() => {
    const show = setTimeout(() => setExpanded(true), 2500)
    const hide = setTimeout(() => setExpanded(false), 8000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  if (!NUMBER) return null
  if (HIDDEN_PREFIXES.some(p => pathname?.startsWith(p))) return null

  // Prefilled so the message arrives with context. WhatsApp shows this as
  // editable draft text, so nobody is forced to send it as written.
  const text = encodeURIComponent(
    `Hi LegalX — I need help.\n\n(Page: ${pathname ?? '/'})`
  )
  const href = `https://wa.me/${NUMBER}?text=${text}`
  const raised = RAISED_PREFIXES.some(p => pathname?.startsWith(p))

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact LegalX on WhatsApp"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      className={`group fixed z-40 right-5 sm:right-6
                 flex items-center gap-2.5 pl-3.5 pr-3.5
                 rounded-full bg-[#25D366] text-[#04231A] shadow-lg shadow-black/30
                 hover:bg-[#20BD5A] focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2
                 focus-visible:ring-offset-[#0A0D14]
                 motion-safe:transition-all motion-safe:duration-300
                 ${raised ? 'bottom-24 lg:bottom-6' : 'bottom-5 sm:bottom-6'}`}
      style={{
        // Clears the iOS home indicator when installed as a PWA.
        marginBottom: 'env(safe-area-inset-bottom)',
        height: '3.25rem',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className="w-6 h-6 shrink-0"
        suppressHydrationWarning
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>

      <span
        className={`overflow-hidden whitespace-nowrap text-sm font-bold
                    motion-safe:transition-all motion-safe:duration-300
                    ${expanded ? 'max-w-[140px] opacity-100 pr-1' : 'max-w-0 opacity-0'}`}
      >
        Chat with us
      </span>
    </a>
  )
}
