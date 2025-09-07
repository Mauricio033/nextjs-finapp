"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createAccount } from "../actions";

const ACCOUNT_TYPE_OPTIONS = [
  { value: "bank",    label: "Bank" },
  { value: "ewallet", label: "E-wallet" },
  { value: "cash",    label: "Cash" },
  { value: "other",   label: "Other" },
] as const;
const OWNERS = ["Mauri", "Ro", "Unassigned"] as const;
const currencyEnum = z.enum(["USD","AUD","EUR","ARS","IDR","THB"]);
const typeEnum = z.enum(ACCOUNT_TYPE_OPTIONS.map(o => o.value) as [string, ...string[]]);
const ownerEnum = z.enum(OWNERS);

const formSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  currency: z.union([currencyEnum, z.literal("")]),
  owner: z.union([ownerEnum, z.literal("")]),
  type: z.union([typeEnum, z.literal("")]),
}).superRefine((v, ctx) => {
  if (v.currency === "") ctx.addIssue({ code: "custom", path: ["currency"], message: "Select a currency" });
  if (v.owner === "")    ctx.addIssue({ code: "custom", path: ["owner"],    message: "Select an owner" });
  if (v.type === "")     ctx.addIssue({ code: "custom", path: ["type"],     message: "Select an account type" });
});

const DEFAULTS = {
  name: "",
  currency: "" as "" | z.infer<typeof currencyEnum>,
  owner: "" as "" | z.infer<typeof ownerEnum>,
  type: "" as "" | z.infer<typeof typeEnum>,
};

export function AccountForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, start] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULTS,
  });

  const submit = (values: z.infer<typeof formSchema>) => {
    start(async () => {
      const payload = {
        name: values.name,
        currency: values.currency as z.infer<typeof currencyEnum>,
        owner: values.owner as z.infer<typeof ownerEnum>,
        type: values.type as "bank" | "ewallet" | "cash" | "other",
      };
      const res = await createAccount(payload);
      if (res.ok) {
        form.reset(DEFAULTS);
        onSuccess?.();  
      } else {
        form.setError("root", { message: res.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} placeholder="e.g. Commonbank - Mauri" /></FormControl>
            <FormMessage />
          </FormItem>
        )}/>

        <FormField name="currency" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Currency</FormLabel>
            <FormControl>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  {currencyEnum.options.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>

        <FormField name="owner" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Owner</FormLabel>
            <FormControl>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  {OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>

        <FormField name="type" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <FormControl>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>

        {form.formState.errors.root?.message && (
          <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>
        )}

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
