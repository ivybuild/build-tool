'use client'

import { cn } from '@/lib/utils'
import { ReactNode, useEffect } from 'react'
import Button from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      {/* 内容 */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg bg-white rounded-xl shadow-dropdown',
          'animate-fade-in',
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-DEFAULT">
            <h3 className="text-lg font-medium text-ink">{title}</h3>
            <button
              onClick={onClose}
              className="text-ink-muted hover:text-ink transition-colors p-1 rounded-md hover:bg-surface-muted"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  confirmVariant?: 'primary' | 'danger'
  loading?: boolean
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmText = '确认', confirmVariant = 'danger', loading
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-base text-ink-secondary mb-5">{message}</p>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>取消</Button>
        <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
