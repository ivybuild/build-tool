import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppLayout from '@/components/layout/AppLayout'
import NewCardClient from '../../new/NewCardClient'

export default async function EditCardPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!card) notFound()

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
