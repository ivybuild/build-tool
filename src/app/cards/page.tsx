import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppLayout from '@/components/layout/AppLayout'
import CardsClient from './CardsClient'
import { Card } from '@/types'

export default async function CardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cardsData } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('next_review_at', { ascending: true })

  const cards = (cardsData ?? []) as Card[]

  return (
    <AppLayout>
      <CardsClient initialCards={cards} userId={user.id} />
    </AppLayout>
  )
}
