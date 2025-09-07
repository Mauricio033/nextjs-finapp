import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }))
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set({ name, value, ...(options || {}) })
            }
          } catch {
          }
        },
      },
    }
  )
}
