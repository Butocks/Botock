import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bumojafxwqukycgahmmd.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bW9qYWZ4d3F1a3ljZ2FobW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NDg2MzQsImV4cCI6MjEwNTIyNDYzNH0.aG8nta37CC4g7egwRWZgYWsVtpNdNkVnQ3UgejWa-Ic'
  )
}
