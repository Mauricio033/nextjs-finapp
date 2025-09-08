"use client";

import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DialogClose } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createTransaction, createTransfer } from "../actions";

type AccountOption = { id: string; name: string; currency: string };
type CategoryOption = {
  id: string;
  name: string;
  kind?: "income" | "expense" | "transfer" | null;
};

const kindEnum = z.enum(["income", "expense", "transfer"]);

const base = z.object({
  kind: kindEnum,
  date: z.date({
    error: (issue) => (issue.input === undefined ? "Required" : "Invalid date"),
  }),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(?:[.,]\d{1,2})?$/, "Enter a valid amount (max 2 decimals)"),
  note: z.string().optional().nullable(),
});

// income / expense
const incomeSchema = base.extend({
  kind: z.literal("income"),
  account_id: z.uuid({ message: "Select an account" }),
  category_id: z.union([z.uuid(), z.literal("")]).optional(),
});

const expenseSchema = base.extend({
  kind: z.literal("expense"),
  account_id: z.uuid({ message: "Select an account" }),
  category_id: z.union([z.uuid(), z.literal("")]).optional(),
});

// transfer
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

export const formSchema = z.discriminatedUnion("kind", [
  incomeSchema,
  expenseSchema,
  transferSchema,
]);

type Props = {
  accounts: AccountOption[];
  categories: CategoryOption[];
  onSuccess?: () => void;
};

export function TransactionForm({ accounts, categories, onSuccess }: Props) {
  // Default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_id: "",
      category_id: "",
      kind: undefined as any,
      date: undefined,
      amount: "",
      note: "",
    },
  });

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(form.getValues("date"));
  const accountId = form.watch("account_id");
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const [isPending, startTransition] = useTransition();
  const selectedKind = form.watch("kind");
  const filteredCategories = categories.filter(
    (c) => !c.kind || c.kind === selectedKind
  );

  useEffect(() => {
    if (selectedKind === "transfer" || selectedKind === undefined)
      form.setValue("category_id", "");
  }, [selectedKind]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const normalized = values.amount.replace(",", ".");
    const num = Number.parseFloat(normalized);
    if (Number.isNaN(num)) {
      form.setError("amount", { message: "Invalid amount" });
      return;
    }

    const amount_minor = Math.round(num * 100);

    startTransition(async () => {
      const { amount, kind, ...rest } = values;
      if (kind !== "income" && kind !== "expense" && kind !== "transfer") {
        form.setError("kind", { message: "Select a transaction type" });
        return;
      }

      try {
        if (values.kind === "transfer") {
          const transferValues = values as z.infer<typeof transferSchema>;
          const res = await createTransfer({
            kind: "transfer",
            from_account: transferValues.from_account,
            to_account: transferValues.to_account,
            amount_minor,
            date: transferValues.date,
            note: transferValues.note ?? null,
          });

          if (!res.ok) {
            form.setError("root", {
              message: res.message || "Failed to create transfer",
            });
            return;
          }
        } else {
          const incomeExpenseValues = values as z.infer<
            typeof expenseSchema
          >;
          const res = await createTransaction({
            account_id: incomeExpenseValues.account_id,
            category_id: incomeExpenseValues.category_id,
            kind: incomeExpenseValues.kind as "income" | "expense" | "transfer",
            date: incomeExpenseValues.date,
            amount_minor,
            note: incomeExpenseValues.note ?? null,
          });

          if (!res.ok) {
            form.setError("root", { message: res.message || "Failed to save" });
            return;
          }
        }

        form.reset({
          kind: "",
          date: undefined,
          amount: "",
          note: "",
          account_id: "",
          category_id: "",
          from_account: undefined as any,
          to_account: undefined as any,
        } as any);

        onSuccess?.();
      } catch (e: any) {
        form.setError("root", { message: e?.message ?? "Unexpected error" });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ScrollArea className="h-90 w-full rounded-md p-5">
          <div className="space-y-6">
            {/* kind */}
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">
                          Transfer between accounts
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedKind !== "transfer" ? (
              <>
                {/* account_id */}
                <FormField
                  control={form.control}
                  name="account_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Account</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* category */}
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredCategories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                {/* From account */}

                <FormField
                  control={form.control}
                  name="from_account"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>From account</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select source account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* To account */}
                <FormField
                  control={form.control}
                  name="to_account"
                  render={({ field }) => {
                    const from = form.watch("from_account");
                    const options = accounts.filter((a) => a.id !== from);
                    return (
                      <FormItem className="space-y-2">
                        <FormLabel>To account</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select destination account" />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </>
            )}

            {/* date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel>Date</FormLabel>

                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          onClick={() => setOpen((v) => !v)}
                          className={
                            !field.value
                              ? "text-muted-foreground"
                              : "text-foreground"
                          }
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <p>Pick a date</p>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        month={month}
                        onMonthChange={setMonth}
                        onSelect={(d) => {
                          if (!d) return;
                          field.onChange(d);
                          setMonth(d);
                          setOpen(false);
                        }}
                        //autoFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* amount_minor */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="decimal"
                      pattern="^\d+(?:[.,]\d{1,2})?$"
                      placeholder="e.g. 12.34"
                      className="text-left"
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedAccount
                      ? `Currency: ${selectedAccount.currency}`
                      : ""}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
