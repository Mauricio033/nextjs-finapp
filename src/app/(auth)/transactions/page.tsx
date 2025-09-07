import { createSupabaseServer } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { NewTransactionDialog } from "./add-transaction/addTransDialog";

export default async function TransactionsPage() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase.from("v_transactions").select("*");
  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  const { data: accounts, error: accErr } = await supabase
    .from("accounts")
    .select("id,name,currency")
    .order("name", { ascending: true });

  if (accErr) {
    return <div className="p-6 text-red-600">Error: {accErr.message}</div>;
  }

  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id,name,kind")
    .order("name", { ascending: true });

  if (catErr) {
    return <div className="p-6 text-red-600">Error: {catErr.message}</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <NewTransactionDialog
          accounts={accounts ?? []}
          categories={categories ?? []}
        />
      </div>

      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}
