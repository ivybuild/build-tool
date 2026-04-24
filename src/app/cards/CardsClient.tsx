'use client'

import { useState } from 'react'
import { Card } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { needsReview, getReviewDescription, calcNextReviewAt } from '@/lib/memory'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Common'
import { ConfirmModal } from '@/components/ui/Modal'
import Link from 'next/link'

interface CardsClientProps {
  initialCards: Card[]
  userId: string
}

export default function CardsClient({ initialCards, userId }: CardsClientProps) {
  const supabase = createClient()
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [archiveTarget, setArchiveTarget] = useState<Card | null>(null)
  const [archiving, setArchiving] = useState(false)

  // 需要复习的卡片排在前面
  const sortedCards = [...cards].sort((a, b) => {
    const aNeedsReview = needsReview(a.next_review_at)
    const bNeedsReview = needsReview(b.next_review_at)
    if (aNeedsReview && !bNeedsReview) return -1
    if (!aNeedsReview && bNeedsReview) return 1
    return new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime()
  })

  const reviewCount = cards.filter(c => needsReview(c.next_review_at)).length

  async function handleStudied(card: Card) {
    const newCount = card.study_count + 1
    const nextReview = calcNextReviewAt(newCount)
    const { data, error } = await supabase
      .from('cards')
      .update({
        study_count: newCount,
        next_review_at: nextReview.toISOString(),
        last_studied_at: new Date().toISOString(),
      })
      .eq('id', card.id)
      .select()
      .single()

    if (!error && data) {
      setCards(prev => prev.map(c => c.id === data.id ? data : c))
      // 写入学习日志
      await supabase.from('study_logs').insert({
        card_id: card.id,
        user_id: userId,
      })
    }
  }

  async function handleArchive() {
    if (!archiveTarget) return
    setArchiving(true)
    const { error } = await supabase
      .from('cards')
      .update({ is_archived: true })
      .eq('id', archiveTarget.id)
    if (!error) {
      setCards(prev => prev.filter(c => c.id !== archiveTarget.id))
    }
    setArchiving(false)
    setArchiveTarget(null)
  }

  return (
    <div className="page-container">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-medium text-ink">学习记忆</h1>
          {reviewCount > 0 && (
            <p className="text-sm text-review-text mt-0.5">{reviewCount} 张需要复习</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/cards/archived" className="text-sm text-ink-muted hover:text-ink transition-colors px-2 py-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-1">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            归档
          </Link>
          <Link href="/cards/new">
            <Button size="sm">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新卡片
            </Button>
          </Link>
        </div>
      </div>

      {/* 卡片列表 */}
      {sortedCards.length === 0 ? (
        <EmptyState
          icon={
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          title="还没有学习卡片"
          description="创建第一张卡片，开始科学记忆"
          action={
            <Link href="/cards/new">
              <Button size="sm">创建卡片</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {sortedCards.map(card => (
            <StudyCard
              key={card.id}
              card={card}
              onStudied={() => handleStudied(card)}
              onArchive={() => setArchiveTarget(card)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="不再学习"
        message={`"${archiveTarget?.title}" 将移入归档，不再提醒复习。`}
        confirmText="确认归档"
        loading={archiving}
      />
    </div>
  )
}

function StudyCard({
  card, onStudied, onArchive
}: {
  card: Card
  onStudied: () => void
  onArchive: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [studying, setStudying] = useState(false)
  const isReview = needsReview(card.next_review_at)
  const reviewDesc = getReviewDescription(card.next_review_at)

  async function handleStudied() {
    setStudying(true)
    await onStudied()
    setStudying(false)
  }

  return (
    <div className={cn(
      'rounded-xl border transition-shadow',
      isReview
        ? 'bg-review-bg border-review-border shadow-sm'
        : 'bg-white border-default shadow-card hover:shadow-card-hover'
    )}>
      {/* 卡片头部（点击展开） */}
      <button
        className="w-full text-left px-4 py-3.5 flex items-center gap-3"
        onClick={() => setExpanded(prev => !prev)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isReview && (
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-review-text" />
            )}
            <span className="text-md font-medium text-ink truncate">{card.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-xs', isReview ? 'text-review-text font-medium' : 'text-ink-muted')}>
              {reviewDesc}
            </span>
            {card.study_count > 0 && (
              <span className="text-xs text-ink-muted">· 已学 {card.study_count} 次</span>
            )}
          </div>
        </div>
        <svg
          width="15" height="15" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth="2"
          className={cn('text-ink-muted flex-shrink-0 transition-transform duration-200', expanded && 'rotate-180')}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="animate-fade-in border-t border-default/60">
          {/* 卡片内容 */}
          <div className="px-4 py-3">
            <CardContent content={card.content} />
          </div>

          {/* 操作按钮 */}
          <div className="px-4 pb-3 flex items-center gap-2 justify-between">
            <Link href={`/cards/${card.id}/edit`}>
              <button className="text-xs text-ink-muted hover:text-ink transition-colors px-2 py-1 rounded hover:bg-surface-muted">
                编辑
              </button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onArchive}
                className="text-ink-muted text-xs"
              >
                不再学习
              </Button>
              <Button
                size="sm"
                onClick={handleStudied}
                loading={studying}
                className="bg-green-500 hover:bg-green-600 text-white text-xs"
              >
                ✓ 完成学习
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 渲染卡片内容（填空部分可点击显示）
function CardContent({ content }: { content: Card['content'] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (!content?.segments?.length) {
    return <p className="text-sm text-ink-muted">（无内容）</p>
  }

  let blankIndex = 0
  return (
    <p className="text-base text-ink leading-relaxed whitespace-pre-wrap break-words">
      {content.segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.content}</span>
        }
        const idx = blankIndex++
        const isRevealed = revealed.has(idx)
        return (
          <span
            key={i}
            onClick={() => toggle(idx)}
            className={cn('blank-block', isRevealed && 'revealed')}
            title={isRevealed ? '点击隐藏' : '点击显示答案'}
          >
            {seg.content}
          </span>
        )
      })}
    </p>
  )
}
