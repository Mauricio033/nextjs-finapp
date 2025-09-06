import { createSupabaseServer } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export default async function TransactionsPage() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("accounts")
    .select("name,currency,type");
  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Accounts</h1>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}
