import { createSupabaseServer } from '@/lib/supabase/server'

export default async function DbTestPage() {
  const supabase = await createSupabaseServer()
  const { error, count } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">DB Test</h1>
      {error ? (
        <p className="text-red-600">Error: {error.message}</p>
      ) : (
        <>
          <p>Conexión OK ✅</p>
          <p className="text-sm text-gray-500">
            Count visible con RLS actual: <strong>{count ?? 0}</strong>
          </p>
        </>
      )}
    </div>
  )
}
