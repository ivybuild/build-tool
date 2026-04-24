import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppLayout from '@/components/layout/AppLayout'
import NotesClient from './NotesClient'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <AppLayout>
      <NotesClient initialNotes={notes ?? []} userId={user.id} />
    </AppLayout>
  )
}
