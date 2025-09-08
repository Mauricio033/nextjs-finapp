"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";

export const accountSchema = z.object({
  name: z.string(),
  currency: z.string().min(3).max(3),
  type: z.string(),
  owner: z.string().optional(),
  balance_minor: z.number(),
});

export type Account = z.infer<typeof accountSchema>;

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;


// ---------- columns ----------
export const columns: ColumnDef<Account>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => String(getValue() ?? ""),
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Currency
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => String(getValue() ?? "").toUpperCase(),
  },
  {
    accessorKey: "owner",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Owner
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => capitalize(String(getValue() ?? "")),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => capitalize(String(getValue() ?? "")),
  },
  {
    accessorKey: "balance_minor",
    header: "Balance",
    cell: ({ row }) => {
      const value = row.getValue<number>("balance_minor");
      const currency = row.original.currency;
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(value / 100);
    },
  },
];
