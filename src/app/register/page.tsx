'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('两次密码不一致')
      return
    }
    if (password.length < 6) {
      setError('密码至少6位')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'https://build-tool-gilt.vercel.app/' },
    })
    if (error) {
      console.error('注册错误:', error)
      setError(error.message === 'User already registered' ? '该邮箱已注册' : `注册失败: ${error.message}`)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
        <div className="w-full max-w-sm text-center card-base p-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-700 mb-2">验证邮件已发送</h2>
          <p className="text-sm text-gray-500">请查收邮件，点击链接完成注册后即可登录</p>
          <Link href="/login" className="block mt-5 text-sm text-blue-600 hover:underline">
            返回登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 mb-3">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-700">创建账号</h1>
          <p className="text-sm text-gray-400 mt-1">开始你的学习之旅</p>
        </div>

        <form onSubmit={handleRegister} className="card-base p-6 flex flex-col gap-4">
          <Input
            label="邮箱"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="密码"
            type="password"
            placeholder="至少6位"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Input
            label="确认密码"
            type="password"
            placeholder="再次输入密码"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          <Button type="submit" loading={loading} className="w-full mt-1" size="lg">
            注册
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          已有账号？{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}
