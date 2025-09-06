import { createSupabaseServer } from '@/lib/supabase/server'

type Row = {
  id: string
  date: string
  kind: 'income' | 'expense'
  amount_minor: number
  currency: string
  note: string | null
}

export default async function TransactionsPage() {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('transactions')
    .select('id,date,kind,amount_minor,currency,note')
  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>
  }
  const rows = (data as Row[]) ?? []
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Transactions</h1>
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Type</th>
              <th className="text-right p-2">Amount</th>
              <th className="text-left p-2">Currency</th>
              <th className="text-left p-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="p-4 text-gray-500" colSpan={5}>No data</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-2">{r.kind}</td>
                <td className="p-2 text-right">{(r.amount_minor/100).toFixed(2)}</td>
                <td className="p-2">{r.currency}</td>
                <td className="p-2">{r.note ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
