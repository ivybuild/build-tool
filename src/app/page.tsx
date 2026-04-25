'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ noteCount: 0, cardCount: 0, reviewCount: 0 })

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // 获取统计数据
      const [{ count: noteCount }, { count: cardCount }, { data: reviewCards }] = await Promise.all([
        supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('cards').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_archived', false),
        supabase.from('cards')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .lte('next_review_at', new Date().toISOString()),
      ])

      setStats({
        noteCount: noteCount ?? 0,
        cardCount: cardCount ?? 0,
        reviewCount: reviewCards?.length ?? 0,
      })
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* 问候语 */}
      <div className="mb-8">
        <h1 className="text-xl font-medium text-gray-700">你好 👋</h1>
        <p className="text-sm text-gray-400 mt-1">今天也是学习的一天</p>
      </div>

      {/* 功能入口 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 记录模块 */}
        <Link
          href="/notes"
          className="card-base p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow group cursor-pointer"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-md font-medium text-gray-700">记录</h2>
            <p className="text-sm text-gray-400 mt-0.5">文字与图片，随时记录想法</p>
            <p className="text-xs text-gray-400 mt-2">共 <span className="text-gray-700 font-medium">{stats.noteCount}</span> 条记录</p>
          </div>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-gray-400 mt-0.5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* 学习记忆模块 */}
        <Link
          href="/cards"
          className="card-base p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow group cursor-pointer"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-md font-medium text-gray-700">学习记忆</h2>
              {stats.reviewCount > 0 && (
                <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                  {stats.reviewCount} 待复习
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">遗忘曲线，科学复习</p>
            <p className="text-xs text-gray-400 mt-2">共 <span className="text-gray-700 font-medium">{stats.cardCount}</span> 张卡片</p>
          </div>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-gray-400 mt-0.5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* 待复习提示 */}
      {stats.reviewCount > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600 flex-1">
            有 <strong>{stats.reviewCount}</strong> 张卡片需要复习
          </p>
          <Link href="/cards" className="text-xs text-red-600 font-medium hover:underline">
            去复习 →
          </Link>
        </div>
      )}
    </div>
  )
}
