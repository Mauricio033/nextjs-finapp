"use client";

import { useTransition } from "react";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteTransaction } from "@/app/(auth)/transactions/actions";
import { toast } from "sonner";

export function DeleteTransactionButton({
  id,
  transferGroupId,
}: {
  id: string;
  transferGroupId?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const onConfirm = () =>
    startTransition(async () => {
      const res = await deleteTransaction({ id, transferGroupId });
      if (res.ok) toast.success(res.message ?? "Deleted");
      else toast.error(res.message ?? "Error deleting");
    });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete transaction" disabled={isPending}>
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            {transferGroupId
              ? "This is part of a transfer. Both sides will be removed."
              : "This action can’t be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
