import { createSupabaseServer } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-gray-600 mt-2">Signed in as {user?.email}</p>
    </div>
  )
}
