'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface TagProps {
  label: string
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
  className?: string
}

export function Tag({ label, active, onClick, onRemove, className }: TagProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors',
        onClick ? 'cursor-pointer' : '',
        active
          ? 'bg-primary text-white'
          : 'bg-surface-muted text-ink-secondary hover:bg-gray-200',
        className
      )}
    >
      #{label}
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="ml-0.5 hover:text-ink transition-colors"
        >×</button>
      )}
    </span>
  )
}

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-ink-muted mb-4 opacity-40">{icon}</div>}
      <p className="text-md font-medium text-ink-secondary">{title}</p>
      {description && <p className="text-sm text-ink-muted mt-1.5 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <svg className="animate-spin h-6 w-6 text-ink-muted" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}
