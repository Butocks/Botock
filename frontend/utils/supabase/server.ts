import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bumojafxwqukycgahmmd.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bW9qYWZ4d3F1a3ljZ2FobW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NDg2MzQsImV4cCI6MjEwNTIyNDYzNH0.aG8nta37CC4g7egwRWZgYWsVtpNdNkVnQ3UgejWa-Ic',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Can be ignored if called from a Server Component
          }
        },
      },
    }
  )
}
