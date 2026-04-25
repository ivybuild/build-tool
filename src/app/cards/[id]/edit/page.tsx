'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/AppLayout'
import NewCardClient from '../new/NewCardClient'
import { Card } from '@/types'

export default function EditCardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [userId, setUserId] = useState<string>('')
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const id = searchParams.get('id')
      if (!id) {
        router.push('/cards')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data: cardData } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (cardData) {
        setCard(cardData as Card)
      }
      setLoading(false)
    }
    loadData()
  }, [router, searchParams])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  if (!card) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-gray-400">卡片不存在</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <NewCardClient
        userId={userId}
        cardId={card.id}
        initialTitle={card.title}
        initialSegments={card.content?.segments ?? []}
      />
    </AppLayout>
  )
}
