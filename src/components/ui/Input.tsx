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
        {label && <label className="text-sm text-gray-500 font-medium">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-base text-gray-700 bg-white border border-gray-200 rounded-lg',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600',
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
        {label && <label className="text-sm text-gray-500 font-medium">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-base text-gray-700 bg-white border border-gray-200 rounded-lg',
            'placeholder:text-gray-400 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600',
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
