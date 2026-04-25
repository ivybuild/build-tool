'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/AppLayout'
import ArchivedCardsClient from './ArchivedCardsClient'
import { Card } from '@/types'

export default function ArchivedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: cardsData } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', true)
        .order('updated_at', { ascending: false })

      setCards((cardsData ?? []) as Card[])
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
      <ArchivedCardsClient initialCards={cards} />
    </AppLayout>
  )
}
