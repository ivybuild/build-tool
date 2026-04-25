import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppLayout from '@/components/layout/AppLayout'
import NewCardClient from '../../new/NewCardClient'
import { Card } from '@/types'

export default async function EditCardPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cardData } = await supabase
    .from('cards')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!cardData) notFound()
  const card = cardData as Card

  return (
    <AppLayout>
      <NewCardClient
        userId={user.id}
        cardId={card.id}
        initialTitle={card.title}
        initialSegments={card.content?.segments ?? []}
      />
    </AppLayout>
  )
}
