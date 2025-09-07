import { createSupabaseServer } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { NewAccountDialog } from "./addAccount/newAccountDialog";

export default async function AccountsPage() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("accounts")
    .select("name,currency,owner,type");
  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <NewAccountDialog />
      </div>

      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}
