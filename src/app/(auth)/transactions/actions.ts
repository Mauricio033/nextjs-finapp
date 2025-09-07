"use server"

import { z } from "zod"
import { createSupabaseServer } from "@/lib/supabase/server"

export const createTxSchema = z.object({
  kind: z.enum(["income", "expense", "transfer"]),
  date: z.string().min(1, "Required"),
  note: z.string().optional().nullable(),
  counterparty: z.string().optional().nullable(),
  amount_minor: z.coerce.number().int().min(1, "Must be > 0"),
  account_id: z.uuid({ message: "Select an account" }),
})

export type CreateTxInput = z.infer<typeof createTxSchema>

export async function addTransaction(input: CreateTxInput) {
  const parsed = createTxSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(i => i.message).join(", "))
  }

  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      kind: input.kind,
      date: input.date,
      note: input.note ?? null,
      counterparty: input.counterparty ?? null,
      amount_minor: input.amount_minor,
      account_id: input.account_id,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  return { id: data.id }
}
