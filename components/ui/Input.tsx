import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
  rows?: number
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
  children: React.ReactNode
}

const inputBaseClasses = cn(
  'w-full h-12 px-4',
  'bg-white dark:bg-surface-dark',
  'border border-hairline dark:border-hairline-dark',
  'rounded-sm',
  'text-body-md text-ink dark:text-white placeholder:text-muted',
  'transition-colors duration-150',
  'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
  'disabled:opacity-50 disabled:bg-surface-soft'
)

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, containerClassName, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-body-sm font-semibold text-ink dark:text-white"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputBaseClasses, error && 'border-error focus:ring-error/20', className)}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, containerClassName, className, id, rows = 5, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-body-sm font-semibold text-ink dark:text-white"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'w-full px-4 py-3',
            'bg-white dark:bg-surface-dark',
            'border border-hairline dark:border-hairline-dark',
            'rounded-sm resize-none',
            'text-body-md text-ink dark:text-white placeholder:text-muted',
            'transition-colors duration-150',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
            error && 'border-error focus:ring-error/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, containerClassName, className, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-body-sm font-semibold text-ink dark:text-white"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full h-12 px-4',
            'bg-white dark:bg-surface-dark',
            'border border-hairline dark:border-hairline-dark',
            'rounded-sm',
            'text-body-md text-ink dark:text-white',
            'transition-colors duration-150',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
            'appearance-none cursor-pointer',
            error && 'border-error focus:ring-error/20',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
