"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createCategory } from "../actions";

const kindEnum = z.enum(["income", "expense"]);

const formSchema = z
  .object({
    name: z.string().trim().min(1, "Required").max(80),
    kind: z.union([kindEnum, z.literal("")]),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "") {
      ctx.addIssue({
        code: "custom",
        path: ["kind"],
        message: "Select a type",
      });
    }
  });

const DEFAULTS: z.infer<typeof formSchema> = {
  name: "",
  kind: "",
};

export function CategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULTS,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const payload = {
        name: values.name,
        kind: values.kind as z.infer<typeof kindEnum>,
      };
      const res = await createCategory(payload);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Groceries" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Kind */}
        <FormField
          name="kind"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message && (
          <p className="text-sm text-red-600">
            {form.formState.errors.root.message}
          </p>
        )}

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
