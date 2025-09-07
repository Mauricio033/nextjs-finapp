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

import { CategoryForm } from "./addCategoryForm";

export function NewCategoryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add category</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add category</DialogTitle>
          <DialogDescription>Create a new category.</DialogDescription>
        </DialogHeader>

        <CategoryForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
