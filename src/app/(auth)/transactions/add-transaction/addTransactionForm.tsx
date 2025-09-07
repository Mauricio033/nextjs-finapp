"use client";

import { useState } from "react";
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

type AccountOption = { id: string; name: string; currency: string };

const formSchema = z.object({
  account_id: z.uuid({ message: "Select an account" }),
  kind: z.enum(["income", "expense", "transfer"] as const),
  date: z.date({
    error: (issue) => (issue.input === undefined ? "Required" : "Invalid date"),
  }),
  amount_minor: z.preprocess(Number, z.number().int().min(0, "Must be >= 0")),
  counterparty: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

type Props = {
  accounts: AccountOption[];
  onSuccess?: () => void;
};

export function TransactionForm({ accounts, onSuccess }: Props) {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_id: accounts[0]?.id ?? "",
      kind: "expense",
      date: undefined,
      amount_minor: 0,
      counterparty: "",
      note: "",
    },
  });

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(form.getValues("date"));

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* kind */}
        <FormField
          control={form.control}
          name="kind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kind</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
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
              <FormDescription>Transaction type.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* account_id */}
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
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
              <FormDescription>Where this transaction belongs.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
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
                        <span>Pick a date</span>
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
                      setOpen(false); // ⬅️ ahora sí se cierra
                    }}
                    autoFocus
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
          name="amount_minor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (cents)</FormLabel>
              <FormControl>
                <Input type="number" inputMode="numeric" {...field} />
              </FormControl>
              <FormDescription>
                Enter the amount in minor units (e.g. cents).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* counterparty */}
        <FormField
          control={form.control}
          name="counterparty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Counterparty</FormLabel>
              <FormControl>
                <Input
                  placeholder="Optional"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Who you paid or received from (optional).
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
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Input
                  placeholder="Optional note"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>Extra details (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
