"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TransactionForm } from "./addTransactionForm";

type AccountOption = { id: string; name: string; currency: string };
type CategoryOption = { id: string; name: string; kind?: "income"|"expense"|"transfer"|null };

export function NewTransactionDialog({
  accounts,
  categories
}: {
  accounts: AccountOption[];
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add transaction</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>
            Record an income, expense, or transfer.
          </DialogDescription>
        </DialogHeader>
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSuccess={() => setOpen(false)}
          />
      </DialogContent>
    </Dialog>
  );
}
