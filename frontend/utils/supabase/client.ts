import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";


  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions: {
        maxAge: 7200, // Expire session after 2 hours (no indefinite persistent sessions)
        sameSite: 'lax',
        path: '/',
      },
    }
  )
}
