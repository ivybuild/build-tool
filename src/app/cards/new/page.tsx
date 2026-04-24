import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppLayout from '@/components/layout/AppLayout'
import NewCardClient from './NewCardClient'

export default async function NewCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <AppLayout>
      <NewCardClient userId={user.id} />
    </AppLayout>
  )
}
