import React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline-white'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  asChild?: boolean
  href?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover border border-transparent',
  secondary:
    'bg-transparent text-ink border border-hairline hover:bg-surface-soft dark:text-white dark:border-hairline-dark dark:hover:bg-surface-soft-dark',
  ghost:
    'bg-transparent text-primary border border-transparent hover:bg-primary/8',
  'outline-white':
    'bg-transparent text-white border border-white hover:bg-white/10',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-body-sm',
  md: 'h-12 px-6 text-sm font-semibold tracking-wide',
  lg: 'h-14 px-8 text-base font-semibold tracking-wide',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2',
    'rounded font-semibold',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'select-none whitespace-nowrap',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className
  )

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
