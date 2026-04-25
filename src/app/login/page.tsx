'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('邮箱或密码错误，请重试')
    } else if (data.session) {
      // 确保 session 已设置后再跳转
      await supabase.auth.setSession(data.session)
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 mb-3">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-700">学习空间</h1>
          <p className="text-sm text-gray-400 mt-1">登录你的学习记录</p>
        </div>

        <form onSubmit={handleLogin} className="card-base p-6 flex flex-col gap-4">
          <Input
            label="邮箱"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="密码"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          <Button type="submit" loading={loading} className="w-full mt-1" size="lg">
            登录
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          还没有账号？{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            注册
          </Link>
        </p>
      </div>
    </div>
  )
}
