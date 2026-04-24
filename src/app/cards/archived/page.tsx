import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppLayout from '@/components/layout/AppLayout'
import ArchivedCardsClient from './ArchivedCardsClient'

export default async function ArchivedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', true)
    .order('updated_at', { ascending: false })

  return (
    <AppLayout>
      <ArchivedCardsClient initialCards={cards ?? []} />
    </AppLayout>
  )
}
