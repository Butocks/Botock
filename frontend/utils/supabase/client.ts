import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bumojafxwqukycgahmmd.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GZ-ZoVbPNycGBW2_9Qg70Q_v5E1SZZi'
  )
}
