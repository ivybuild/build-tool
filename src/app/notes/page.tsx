'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/AppLayout'
import NotesClient from './NotesClient'
import { Note } from '@/types'

export default function NotesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>([])
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotes((notesData ?? []) as Note[])
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <NotesClient initialNotes={notes} userId={userId} />
    </AppLayout>
  )
}
