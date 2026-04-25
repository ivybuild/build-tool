'use client'

import { useState } from 'react'
import { Card } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { calcNextReviewAt } from '@/lib/memory'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Common'
import { ConfirmModal } from '@/components/ui/Modal'
import { useRouter } from 'next/navigation'

interface ArchivedCardsClientProps {
  initialCards: Card[]
}

export default function ArchivedCardsClient({ initialCards }: ArchivedCardsClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleRestore(card: Card) {
    setRestoring(card.id)
    const { error } = await supabase
      .from('cards')
      .update({
        is_archived: false,
        next_review_at: calcNextReviewAt(card.study_count).toISOString()
      })
      .eq('id', card.id)
    if (!error) setCards(prev => prev.filter(c => c.id !== card.id))
    setRestoring(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('cards').delete().eq('id', deleteTarget.id)
    setCards(prev => prev.filter(c => c.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-medium text-gray-700">归档卡片</h1>
        <span className="text-sm text-gray-400">({cards.length})</span>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          }
          title="没有归档卡片"
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {cards.map(card => (
            <div key={card.id} className="card-base px-4 py-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-md text-gray-700 truncate">{card.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">已学 {card.study_count} 次</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(card)}
                  loading={restoring === card.id}
                >
                  恢复
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(card)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="永久删除"
        message={`确认永久删除"${deleteTarget?.title}"？此操作不可撤销。`}
        confirmText="删除"
        loading={deleting}
      />
    </div>
  )
}
