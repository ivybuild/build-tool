'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      setSession(session)
      setUser(user)
    }
    checkSession()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Session 测试页面</h1>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold">Session:</h2>
        <pre className="text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold">User:</h2>
        <pre className="text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  )
}
