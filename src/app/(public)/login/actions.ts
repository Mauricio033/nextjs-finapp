'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  const supabase = await createSupabaseServer()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/dashboard')
}
