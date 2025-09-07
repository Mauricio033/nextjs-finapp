"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export function NewTransactionDialog({
  accounts,
}: {
  accounts: AccountOption[];
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
            onSuccess={() => setOpen(false)}
          />
      </DialogContent>
    </Dialog>
  );
}
