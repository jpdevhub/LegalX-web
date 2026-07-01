import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  variant?: 'default' | 'soft' | 'outlined'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const variantClasses = {
  default: 'bg-white dark:bg-surface-dark border border-hairline dark:border-hairline-dark',
  soft: 'bg-surface-soft dark:bg-surface-soft-dark border border-transparent',
  outlined: 'bg-transparent border border-hairline dark:border-hairline-dark',
}

export function Card({
  hover = false,
  padding = 'md',
  variant = 'default',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-md',
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'transition-all duration-150 ease-out cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
