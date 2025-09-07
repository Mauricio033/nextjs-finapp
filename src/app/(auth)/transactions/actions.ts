// app/(auth)/transactions/actions.ts
"use server";

import { z } from "zod";
import { format } from "date-fns";
import { createSupabaseServer } from "@/lib/supabase/server";

const createTxSchema = z.object({
  account_id: z.string().uuid(),
  kind: z.enum(["income", "expense", "transfer"] as const),
  date: z.coerce.date(),
  amount_minor: z.number().int().min(0),
  counterparty: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export type CreateTxInput = z.infer<typeof createTxSchema>;
export type CreateTxResult = { ok: true } | { ok: false; message: string };

export async function createTransaction(input: CreateTxInput): Promise<CreateTxResult> {
  const parsed = createTxSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid data" };
  }
  const v = parsed.data;

  const supabase = await createSupabaseServer();

  // Si tu columna date es DATE:
  const dateStr = format(v.date, "yyyy-MM-dd");

  const { error } = await supabase.from("transactions").insert({
    account_id: v.account_id,
    kind: v.kind,
    date: dateStr,
    amount_minor: v.amount_minor,
    counterparty: v.counterparty ?? null,
    note: v.note ?? null,
  });

  if (error) return { ok: false, message: error.message };

  // opcional: revalidar la página
  // import { revalidatePath } from "next/cache";
  // revalidatePath("/(auth)/transactions");

  return { ok: true };
}
