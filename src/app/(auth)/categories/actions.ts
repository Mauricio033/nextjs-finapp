"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

const categorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  // si tu tabla tiene 'kind', lo guardamos; si no, podés quitar este campo
  kind: z.enum(["income","expense"]).default("expense"),
  parent_id: z.string().uuid().nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof categorySchema>;
export type CreateCategoryResult = { ok: true } | { ok: false; message: string };

export async function createCategory(input: CreateCategoryInput): Promise<CreateCategoryResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid data" };

  const supabase = await createSupabaseServer();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) return { ok: false, message: "Not authenticated" };

  const { error } = await supabase.from("categories").insert({
    user_id: auth.user.id,
    name: parsed.data.name,
    kind: parsed.data.kind,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, message: "Category already exists" };
    return { ok: false, message: error.message };
  }

  revalidatePath("/transactions");
  revalidatePath("/categories");
  return { ok: true };
}
