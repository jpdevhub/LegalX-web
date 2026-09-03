import Link from 'next/link'
import { KNOWLEDGE_SECTIONS } from '@/lib/knowledge'

/**
 * The Knowledge Centre's three sections.
 *
 * A server component with plain links rather than client-side tabs: each
 * section is its own indexed URL, and a crawler needs to follow real anchors
 * between them. The active section is passed in rather than read from the
 * pathname so this stays render-only.
 */
export function SectionNav({ active }: { active: 'legal-updates' | 'know-your-rights' | 'judgments' }) {
  return (
    <nav
      aria-label="Knowledge Centre sections"
      className="sticky top-16 z-30 bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/8"
    >
      <div className="max-w-[900px] mx-auto flex items-stretch gap-1 px-4 sm:px-6 overflow-x-auto no-scrollbar">
        {KNOWLEDGE_SECTIONS.map(section => {
          const isActive = section.key === active
          return (
            <Link
              key={section.key}
              href={section.href}
              aria-current={isActive ? 'page' : undefined}
              className={`shrink-0 px-3 sm:px-4 py-3.5 text-[13px] sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#C9A227] text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-200'
              }`}
            >
              {section.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
