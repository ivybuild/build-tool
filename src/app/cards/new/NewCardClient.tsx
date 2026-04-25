'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CardSegment } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { calcNextReviewAt } from '@/lib/memory'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface NewCardClientProps {
  userId: string
  initialTitle?: string
  initialSegments?: CardSegment[]
  cardId?: string // 编辑模式
}

/**
 * 将原始文本解析为 segments
 * 规则：{{填空内容}} 或 ___填空内容___ 标记为填空
 */
function parseSegments(text: string): CardSegment[] {
  const regex = /\{\{(.+?)\}\}|___(.+?)___/g
  const segments: CardSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'blank', content: match[1] ?? match[2] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }
  return segments.length ? segments : [{ type: 'text', content: text }]
}

/**
 * 导入文件时，将 ==划线内容== 或 **加粗** 识别为填空
 */
function parseFileContent(text: string): { title: string, segments: CardSegment[] } {
  const lines = text.split('\n')
  // 第一行作为标题
  const title = lines[0].replace(/^#+\s*/, '').trim()
  const body = lines.slice(1).join('\n').trim()

  // ==高亮== 或 **加粗** 识别为填空
  const regex = /==(.+?)==|\*\*(.+?)\*\*/g
  const segments: CardSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: body.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'blank', content: match[1] ?? match[2] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < body.length) {
    segments.push({ type: 'text', content: body.slice(lastIndex) })
  }

  return { title, segments: segments.length ? segments : [{ type: 'text', content: body }] }
}

export default function NewCardClient({ userId, initialTitle = '', initialSegments, cardId }: NewCardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialTitle)
  const [rawText, setRawText] = useState(
    initialSegments
      ? initialSegments.map(s => s.type === 'blank' ? `{{${s.content}}}` : s.content).join('')
      : ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<CardSegment[]>(initialSegments ?? [])
  const [showPreview, setShowPreview] = useState(false)

  function handleTextChange(val: string) {
    setRawText(val)
    setPreview(parseSegments(val))
  }

  function handleFileImport(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { title: t, segments } = parseFileContent(text)
      setTitle(t)
      const reconstructed = segments.map(s =>
        s.type === 'blank' ? `{{${s.content}}}` : s.content
      ).join('')
      setRawText(reconstructed)
      setPreview(segments)
    }
    reader.readAsText(file)
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('请输入卡片标题')
      return
    }
    const segments = parseSegments(rawText)
    setSaving(true)
    setError('')

    if (cardId) {
      const { error } = await supabase
        .from('cards')
        .update({ title, content: { segments } })
        .eq('id', cardId)
      if (error) {
        setError('保存失败，请重试')
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('cards')
        .insert({
          user_id: userId,
          title,
          content: { segments },
          next_review_at: calcNextReviewAt(0).toISOString(),
        })
      if (error) {
        setError('创建失败，请重试')
        setSaving(false)
        return
      }
    }
    router.push('/cards')
    router.refresh()
  }

  return (
    <div className="page-container max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-medium text-gray-700">{cardId ? '编辑卡片' : '新建卡片'}</h1>
      </div>

      <div className="card-base p-5 flex flex-col gap-4">
        <Input
          label="标题"
          placeholder="卡片标题"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-500 font-medium">内容</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                用 <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">{'{{填空}}'}</code> 标记填空
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
              >
                导入文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFileImport(e.target.files[0])}
              />
            </div>
          </div>
          <textarea
            className="w-full px-3 py-2 text-base text-gray-700 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors duration-150 resize-none"
            placeholder={"输入卡片内容，用 {{填空内容}} 标记需要填空的部分\n\n示例：\n光合作用的产物是 {{葡萄糖}} 和 {{氧气}}。"}
            rows={8}
            value={rawText}
            onChange={e => handleTextChange(e.target.value)}
          />
        </div>

        {/* 预览 */}
        {rawText && (
          <div>
            <button
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1 mb-2"
              onClick={() => setShowPreview(v => !v)}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                className={cn('transition-transform', showPreview && 'rotate-90')}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              {showPreview ? '收起预览' : '展开预览'}
            </button>
            {showPreview && (
              <div className="bg-gray-100 rounded-lg px-3 py-3 animate-fade-in">
                <p className="text-xs text-gray-400 mb-2">预览效果（点击填空查看答案）</p>
                <PreviewContent segments={preview} />
              </div>

            )}
          </div>
        )}

        {/* 导入说明 */}
        <div className="text-xs text-gray-400 bg-gray-100 rounded-lg px-3 py-2">
          <p className="font-medium mb-1">导入文件说明</p>
          <p>支持 .txt 和 .md 文件。文件第一行作为标题，<code>==高亮==</code> 或 <code>**加粗**</code> 的内容自动识别为填空。</p>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>取消</Button>
          <Button size="sm" onClick={handleSave} loading={saving} disabled={!title.trim()}>
            {cardId ? '保存修改' : '创建卡片'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function PreviewContent({ segments }: { segments: CardSegment[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  let blankIndex = 0
  return (
    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <span key={i}>{seg.content}</span>
        const idx = blankIndex++
        const isRevealed = revealed.has(idx)
        return (
          <span
            key={i}
            onClick={() => toggle(idx)}
            className={cn('blank-block', isRevealed && 'revealed')}
          >
            {seg.content}
          </span>
        )
      })}
    </p>
  )
}
