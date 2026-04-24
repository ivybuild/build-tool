'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm text-ink-secondary font-medium">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-base text-ink bg-white border border-border-DEFAULT rounded-lg',
            'placeholder:text-ink-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-colors duration-150',
            error && 'border-red-400 focus:ring-red-200 focus:border-red-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm text-ink-secondary font-medium">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-base text-ink bg-white border border-border-DEFAULT rounded-lg',
            'placeholder:text-ink-muted resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-colors duration-150',
            error && 'border-red-400 focus:ring-red-200 focus:border-red-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
