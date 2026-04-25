import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types'

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (err) {
            // Server Component 中无法设置 cookie 时会抛出错误，这是预期的行为
            console.error('Server cookie set error:', err)
          }
        },
      },
    }
  )
}
