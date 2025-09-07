"use server";

import { z } from "zod";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

const createTxSchema = z.object({
  account_id: z.string().uuid(),
  kind: z.enum(["income", "expense", "transfer"] as const),
  date: z.coerce.date(),
  amount_minor: z.number().int().nonnegative(),
  counterparty: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
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

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return { ok: false, message: "Not authenticated" };
  }

  const abs = Math.abs(v.amount_minor);
  if (v.kind === "transfer") {
    // When transfer is implemented, change this to create two entries (expense + income)
    return { ok: false, message: "Transfers require from/to accounts (not implemented yet)." };
  }
  const signedAmount = v.kind === "expense" ? -abs : abs;

  const dateStr = format(v.date, "yyyy-MM-dd");

  const { error } = await supabase.from("transactions").insert({
    user_id: auth.user.id,
    account_id: v.account_id,
    kind: v.kind,
    date: dateStr,
    amount_minor: signedAmount,
    counterparty: v.counterparty ?? null,
    note: v.note ?? null,
  });

  if (error) {
    console.error("createTransaction error:", error);
    return { ok: false, message: error.message };
  }

  revalidatePath("/transactions");
  return { ok: true };
}
