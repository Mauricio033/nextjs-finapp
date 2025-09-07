"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { AccountForm } from "./addAccountForm";

export function NewAccountDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add account</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add account</DialogTitle>
          <DialogDescription>Create a new account.</DialogDescription>
        </DialogHeader>

        <AccountForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
