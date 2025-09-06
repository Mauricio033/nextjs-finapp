"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button";
import { z } from "zod";

export const transactionSchema = z.object({
  id: z.uuid(),
  kind: z.enum(["income", "expense", "transfer"]),
  date: z.string(),
  person: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  amount_minor: z.coerce.number(),
  currency: z.enum(["USD", "AUD", "EUR", "ARS", "IDR", "THB"]),
  created_at: z.string(),
})

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
    // fallback in case currency is not valid
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


// ---------- columns ----------
export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "kind",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kind
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const v = String(getValue() ?? "");
      return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
    },
  },

  {
    accessorKey: "dateLabel",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => formatDate(String(getValue() ?? "")),
    sortingFn: "datetime",
  },

  {
    accessorKey: "person",
    header: "Person",
    cell: ({ getValue }) => getValue() ?? "",
  },

  {
    accessorKey: "note",
    header: "Note",
    cell: ({ getValue }) => (getValue() as string | null) ?? "",
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      formatMoney(row.original.amount_minor, row.original.currency),
    sortingFn: (a, b, columnId) =>
      (a.getValue<number>(columnId) ?? 0) - (b.getValue<number>(columnId) ?? 0),
  },

  {
    accessorKey: "currency",
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
