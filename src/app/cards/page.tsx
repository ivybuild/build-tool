'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/AppLayout'
import CardsClient from './CardsClient'
import { Card } from '@/types'

export default function CardsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [cards, setCards] = useState<Card[]>([])
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

      const { data: cardsData } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('next_review_at', { ascending: true })

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
      <CardsClient initialCards={cards} userId={userId} />
    </AppLayout>
  )
}
