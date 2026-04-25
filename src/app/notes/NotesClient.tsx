'use client'

import { useState, useRef } from 'react'
import { Note } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { extractTags, formatDateTime, formatRelativeTime } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Tag, EmptyState, LoadingSpinner } from '@/components/ui/Common'
import { ConfirmModal } from '@/components/ui/Modal'
import Image from 'next/image'

interface NotesClientProps {
  initialNotes: Note[]
  userId: string
}

export default function NotesClient({ initialNotes, userId }: NotesClientProps) {
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  // 编辑器状态
  const [content, setContent] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 所有标签
  const allTags = [...new Set(notes.flatMap(n => n.tags))]

  // 筛选后的记录
  const filtered = filterTag
    ? notes.filter(n => n.tags.includes(filterTag))
    : notes

  function openNew() {
    setEditingNote(null)
    setContent('')
    setUploadedImages([])
    setShowEditor(true)
  }

  function openEdit(note: Note) {
    setEditingNote(note)
    setContent(note.content)
    setUploadedImages(note.images ?? [])
    setShowEditor(true)
  }

  function cancelEdit() {
    setShowEditor(false)
    setEditingNote(null)
    setContent('')
    setUploadedImages([])
  }

  async function handleImageUpload(files: FileList) {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('note-images')
        .upload(path, file, { upsert: false })
      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('note-images')
          .getPublicUrl(data.path)
        urls.push(urlData.publicUrl)
      }
    }
    setUploadedImages(prev => [...prev, ...urls])
    setUploading(false)
  }

  async function handleSave() {
    if (!content.trim() && uploadedImages.length === 0) return
    setSaving(true)
    const tags = extractTags(content)

    if (editingNote) {
      const { data, error } = await supabase
        .from('notes')
        // @ts-ignore - Supabase 类型推断问题
        .update({ content, images: uploadedImages, tags })
        .eq('id', editingNote.id)
        .select()
        .single()
      if (!error && data) {
        // @ts-ignore - Supabase 类型推断问题
        setNotes(prev => prev.map(n => n.id === data.id ? data : n))
      }
    } else {
      const { data, error } = await supabase
        .from('notes')
        // @ts-ignore - Supabase 类型推断问题
        .insert({ user_id: userId, content, images: uploadedImages, tags })
        .select()
        .single()
      if (!error && data) {
        // @ts-ignore - Supabase 类型推断问题
        setNotes(prev => [data, ...prev])
      }
    }
    setSaving(false)
    cancelEdit()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('notes').delete().eq('id', deleteTarget.id)
    setNotes(prev => prev.filter(n => n.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }

  // 渲染内容（将 #标签 高亮）
  function renderContent(text: string) {
    const parts = text.split(/(#[\u4e00-\u9fa5a-zA-Z0-9_-]+)/g)
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span key={i} className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => setFilterTag(part.slice(1))}>
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="page-container">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-medium text-gray-700">记录</h1>
        {!showEditor && (
          <Button size="sm" onClick={openNew}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新记录
          </Button>
        )}
      </div>

      {/* 标签筛选 */}
      {allTags.length > 0 && !showEditor && (
        <div className="flex gap-1.5 flex-wrap mb-4">
          <Tag
            label="全部"
            active={!filterTag}
            onClick={() => setFilterTag(null)}
          />
          {allTags.map(tag => (
            <Tag
              key={tag}
              label={tag}
              active={filterTag === tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
            />
          ))}
        </div>
      )}

      {/* 编辑器 */}
      {showEditor && (
        <div className="card-base p-4 mb-4 animate-fade-in">
          <Textarea
            placeholder={'写点什么... 用 #标签 添加标签'}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            className="mb-3"
            autoFocus
          />

          {/* 已上传图片预览 */}
          {uploadedImages.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-lg"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* 图片上传按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploading ? '上传中...' : '图片'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleImageUpload(e.target.files)}
            />
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={cancelEdit}>取消</Button>
            <Button size="sm" onClick={handleSave} loading={saving}
              disabled={!content.trim() && uploadedImages.length === 0}>
              {editingNote ? '保存修改' : '发布'}
            </Button>
          </div>
        </div>
      )}

      {/* 记录列表 */}
      {filtered.length === 0 && !showEditor ? (
        <EmptyState
          icon={
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
          title={filterTag ? `没有"#${filterTag}"的记录` : '还没有记录'}
          description="点击右上角新建第一条记录"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => openEdit(note)}
              onDelete={() => setDeleteTarget(note)}
              renderContent={renderContent}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="删除记录"
        message="确认删除这条记录？此操作不可撤销。"
        confirmText="删除"
        loading={deleting}
      />
    </div>
  )
}

function NoteCard({
  note, onEdit, onDelete, renderContent
}: {
  note: Note
  onEdit: () => void
  onDelete: () => void
  renderContent: (text: string) => React.ReactNode
}) {
  return (
    <div className="card-base p-4 group">
      {/* 内容 */}
      <p className="text-base text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
        {renderContent(note.content)}
      </p>

      {/* 图片 */}
      {note.images && note.images.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {note.images.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
               className="block w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity relative">
              <Image src={url} alt="" fill className="object-cover" />
            </a>
          ))}
        </div>
      )}

      {/* 底部元信息 */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span title="创建时间">创建 {formatDateTime(note.created_at)}</span>
          {note.updated_at !== note.created_at && (
            <span title="修改时间" className="text-gray-400/70">
              · 修改 {formatRelativeTime(note.updated_at)}
            </span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="编辑"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="删除"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
