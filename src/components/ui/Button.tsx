'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all duration-150 select-none',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-primary text-white hover:bg-primary-hover active:scale-95': variant === 'primary',
            'bg-surface-muted text-ink hover:bg-border-DEFAULT active:scale-95': variant === 'secondary',
            'text-ink hover:bg-surface-muted active:scale-95': variant === 'ghost',
            'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95': variant === 'danger',
            'border border-border-DEFAULT text-ink hover:bg-surface-muted active:scale-95': variant === 'outline',
          },
          {
            'text-xs px-2.5 py-1': size === 'sm',
            'text-sm px-3.5 py-1.5': size === 'md',
            'text-base px-5 py-2': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export default Button
