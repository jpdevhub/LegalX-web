import { cn } from '@/lib/utils'

interface Step {
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  current: number // 1-indexed
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative flex items-start justify-between">
        {/* Connector lines */}
        {steps.map((_, i) => {
          if (i === steps.length - 1) return null
          const isCompleted = current > i + 1
          return (
            <div
              key={`connector-${i}`}
              className="absolute top-5 h-0.5 transition-colors duration-300"
              style={{
                left: `calc(${(i / (steps.length - 1)) * 100}% + 20px)`,
                right: `calc(${100 - ((i + 1) / (steps.length - 1)) * 100}% + 20px)`,
                backgroundColor: isCompleted ? '#0d7a5f' : '#e5e7eb',
              }}
              aria-hidden
            />
          )
        })}

        {/* Step nodes */}
        {steps.map((step, i) => {
          const stepNumber = i + 1
          const isCompleted = stepNumber < current
          const isActive = stepNumber === current
          const isUpcoming = stepNumber > current

          return (
            <div
              key={step.label}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              {/* Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'font-semibold text-sm transition-all duration-300',
                  'ring-4 ring-white dark:ring-surface-dark',
                  isCompleted && 'bg-primary text-white',
                  isActive && 'bg-primary text-white shadow-elevated',
                  isUpcoming &&
                    'bg-surface-soft dark:bg-surface-soft-dark text-muted border border-hairline dark:border-hairline-dark'
                )}
                aria-label={`Step ${stepNumber}: ${step.label} — ${isCompleted ? 'Completed' : isActive ? 'Current' : 'Upcoming'}`}
              >
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8L6.5 11.5L13 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-label-caps tracking-widest uppercase text-center whitespace-nowrap',
                  (isActive || isCompleted) ? 'text-primary font-semibold' : 'text-muted'
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
