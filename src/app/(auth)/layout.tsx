import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return (
    <>
      
      <div className="flex-1">{children}</div>
    </>
  )
}