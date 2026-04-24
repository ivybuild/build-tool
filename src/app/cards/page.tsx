import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppLayout from '@/components/layout/AppLayout'
import CardsClient from './CardsClient'

export default async function CardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('next_review_at', { ascending: true })

  return (
    <AppLayout>
      <CardsClient initialCards={cards ?? []} userId={user.id} />
    </AppLayout>
  )
}
