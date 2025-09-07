"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

const DB_ACCOUNT_TYPES = ["bank","ewallet","cash","other"] as const;

const accountSchema = z.object({
  name: z.string().trim().min(1).max(80),
  currency: z.enum(["USD","AUD","EUR","ARS","IDR","THB"]),
  owner: z.string().trim().min(1, "Owner is required"),
  type: z.enum(DB_ACCOUNT_TYPES),
});

export type CreateAccountInput = z.infer<typeof accountSchema>;
export type CreateAccountResult = { ok: true } | { ok: false; message: string };

export async function createAccount(input: CreateAccountInput): Promise<CreateAccountResult> {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid data" };

  const supabase = await createSupabaseServer();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) return { ok: false, message: "Not authenticated" };

  const { error } = await supabase.from("accounts").insert({
    user_id: auth.user.id,
    name: parsed.data.name,
    currency: parsed.data.currency,
    owner: parsed.data.owner,
    type: parsed.data.type,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/transactions");
  return { ok: true };
}
