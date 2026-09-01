'use client'

/**
 * The password policy, in one place.
 *
 * Must stay in step with `strongPasswordSchema` in the backend's
 * lib/validation.ts, which is what actually enforces it. These previously
 * diverged — signup allowed any 8 characters while reset required an uppercase
 * letter and a digit — so both pages now render from this single list.
 */
export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'upper',  label: 'One uppercase letter',  test: (p: string) => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number',            test: (p: string) => /[0-9]/.test(p) },
] as const

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every(rule => rule.test(password))
}

/**
 * Live checklist. `dim` keeps it muted until the user starts typing, so an
 * untouched form doesn't open with three red-looking failures.
 */
export function PasswordRules({
  password,
  className = '',
}: {
  password: string
  className?: string
}) {
  const touched = password.length > 0

  return (
    <ul className={`space-y-1.5 ${className}`}>
      {PASSWORD_RULES.map(rule => {
        const ok = rule.test(password)
        return (
          <li
            key={rule.key}
            className={`flex items-center gap-2 text-xs transition-colors ${
              ok ? 'text-emerald-400' : touched ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              suppressHydrationWarning
            >
              {ok ? <path d="M20 6L9 17l-5-5" /> : <circle cx="12" cy="12" r="9" strokeWidth="2" />}
            </svg>
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
