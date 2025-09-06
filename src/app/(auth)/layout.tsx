import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-svh w-full flex-col">
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}