import { createSupabaseServer } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { NewCategoryDialog } from "./addCategory/newCategoryDialog";

export default async function CategoriesPage() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from("categories").select("name,kind");
  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <NewCategoryDialog />
      </div>

      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}
