"use server";

import { z } from "zod";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

const base = z.object({
  date: z.coerce.date(),
  amount_minor: z.coerce.number().int().positive(),
  note: z.string().trim().max(200).optional().nullable(),
});

const createTxSchema = base.extend({
  kind: z.enum(["income", "expense", "transfer"]),
  account_id: z.uuid(),
  category_id: z
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
});

const transferSchema = base
  .extend({
    kind: z.literal("transfer"),
    from_account: z.uuid(),
    to_account: z.uuid(),
  })
  .refine((v) => v.from_account !== v.to_account, {
    message: "Accounts must differ",
    path: ["to_account"],
  });

//Transaction
export type CreateTxInput = z.infer<typeof createTxSchema>;
export type CreateTxResult = { ok: true } | { ok: false; message: string };

export async function createTransaction(
  input: CreateTxInput
): Promise<CreateTxResult> {
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

  const signedAmount = v.kind === "expense" ? -v.amount_minor : v.amount_minor;
  const dateStr = format(v.date, "yyyy-MM-dd");

  const { error } = await supabase.from("transactions").insert({
    user_id: auth.user.id,
    account_id: v.account_id,
    category_id: v.category_id,
    kind: v.kind,
    date: dateStr,
    amount_minor: signedAmount,
    note: v.note ?? null,
  });

  if (error) {
    console.error("createTransaction error:", error);
    return { ok: false, message: error.message };
  }

  revalidatePath("/transactions");
  return { ok: true };
}

//Transfer
export type TransferInput = z.infer<typeof transferSchema>;
export type TransferResult =
  | { ok: true; gid: string }
  | { ok: false; message: string };

export async function createTransfer(
  input: TransferInput
): Promise<TransferResult> {
  const parsed = transferSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid data",
    };
  const v = parsed.data;

  const supabase = await createSupabaseServer();
  const { data: gid, error } = await supabase.rpc("create_transfer", {
    from_account: v.from_account,
    to_account: v.to_account,
    amount_minor: v.amount_minor,
    date: format(v.date, "yyyy-MM-dd"),
    note: v.note ?? null,
  });

  if (error) {
    console.error("createTransfer error:", error);
    return { ok: false, message: error.message };
  }

  revalidatePath("/transactions");

  return { ok: true, gid: gid as string };
}
