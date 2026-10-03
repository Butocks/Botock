import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bumojafxwqukycgahmmd.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_placeholder";

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
