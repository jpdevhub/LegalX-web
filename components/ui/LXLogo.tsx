/**
 * LXLogoMark — The LX lettermark only (no text, no circle).
 * Use in header next to an HTML wordmark for best readability.
 *
 * LXLogo — Full stacked mark + wordmark for footer / standalone use.
 * Both use `currentColor` — set className="text-ink dark:text-white".
 */

interface LXLogoProps {
  className?: string
  height?: number
}

/**
 * Just the geometric LX strokes — use at small sizes in the header.
 */
export function LXLogoMark({ className = 'text-ink', height = 36 }: LXLogoProps) {
  // Aspect ratio 160:130 → width = height × 1.23
  const width = Math.round(height * (160 / 130))

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* L — vertical */}
      <line x1="14" y1="8"  x2="14" y2="114" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      {/* L — horizontal foot */}
      <line x1="14" y1="114" x2="60" y2="114" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      {/* Small dash between L and X */}
      <line x1="66" y1="114" x2="78" y2="114" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      {/* X — top-left to bottom-right */}
      <line x1="86" y1="8"  x2="150" y2="114" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      {/* X — top-right to bottom-left */}
      <line x1="150" y1="8"  x2="86" y2="114" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Full logo — mark stacked above wordmark — for footer / large display.
 * Render at height ≥ 72 so the text is legible.
 */
export function LXLogo({ className = 'text-ink', height = 80 }: LXLogoProps) {
  const width = Math.round(height * (220 / 210))

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LegalXOnline logo"
      role="img"
    >
      {/* L — vertical */}
      <line x1="20"  y1="10"  x2="20"  y2="120" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      {/* L — horizontal foot */}
      <line x1="20"  y1="120" x2="72"  y2="120" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      {/* Dash */}
      <line x1="78"  y1="120" x2="92"  y2="120" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      {/* X — top-left to bottom-right */}
      <line x1="100" y1="10"  x2="190" y2="120" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      {/* X — top-right to bottom-left */}
      <line x1="190" y1="10"  x2="100" y2="120" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />

      {/* Wordmark — large relative to viewBox so it renders visibly */}
      <text
        x="105"
        y="185"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="22"
        letterSpacing="5"
        fontWeight="400"
      >
        LEGALXONLINE
      </text>
    </svg>
  )
}
