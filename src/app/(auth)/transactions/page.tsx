import { createSupabaseServer } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { formatDateUTC } from "@/lib/formatDate";
import { formatMoneyMinor } from '@/lib/formatMoney';

export default async function TransactionsPage() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("transactions")
    .select("id,date,kind,amount_minor,currency,note,person,created_at");
  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  const rows = data.map((tx) => ({
    ...tx,
    date: formatDateUTC(tx.date),
  }));

  return (
    <>
      <h1 className="text-2xl font-bold">Transactions</h1>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}
