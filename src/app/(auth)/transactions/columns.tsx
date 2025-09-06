"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";

// ---- Schema ----
export const transactionSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["income", "expense", "transfer"]),
  date: z.string(),
  note: z.string().nullable().optional(),
  counterparty: z.string().nullable().optional(),
  amount_minor: z.coerce.number(),
  account_name: z.string(),
  account_currency: z.string(),
  category_name: z.string().nullable().optional(),
  created_at: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

const formatMoney = (minor: number, currency: string) => {
  const value = minor / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const formatDate = (isoLike: string) => {
  const d = new Date(isoLike);
  return isNaN(d.getTime())
    ? isoLike
    : new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(d);
};

// ---- Columns ----
export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "kind",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Kind
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const v = String(getValue() ?? "");
      return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => formatDate(String(getValue() ?? "")),
    sortingFn: "datetime",
  },
  {
    accessorKey: "account_name",
    header: "Account",
  },
  {
    accessorKey: "category_name",
    header: "Category",
    cell: ({ getValue }) => getValue() ?? "",
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ getValue }) => (getValue() as string | null) ?? "",
  },
  {
    accessorKey: "counterparty",
    header: "Counterparty",
    cell: ({ getValue }) => (getValue() as string | null) ?? "",
  },
  {
    accessorKey: "amount_minor",
    header: "Amount",
    cell: ({ row }) =>
      formatMoney(row.original.amount_minor, row.original.account_currency),
    sortingFn: (a, b) =>
      (a.original.amount_minor ?? 0) - (b.original.amount_minor ?? 0),
  },
  {
    accessorKey: "account_currency",
    header: "CCY",
    cell: ({ getValue }) => String(getValue() ?? "").toUpperCase(),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) => formatDate(String(getValue() ?? "")),
    sortingFn: "datetime",
  },
];