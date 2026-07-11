"use client";

import { useState } from "react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteIconButtonProps {
  /** Human-readable name used by assistive text and error messages. */
  itemLabel: string;
  /** Delete the item in persistent storage. Resolve only after it is safe to remove from the UI. */
  onDelete: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable destructive action with a confirmation dialog.
 *
 * @example
 * <DeleteIconButton
 *   itemLabel="workflow"
 *   onDelete={() => removeWorkflow(workflow.id)}
 * />
 */
export function DeleteIconButton({
  itemLabel,
  onDelete,
  disabled = false,
  className,
}: DeleteIconButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete();
      setIsConfirming(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to delete ${itemLabel}`,
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={isConfirming}
      onOpenChange={(open) => {
        if (!isDeleting) setIsConfirming(open);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={disabled}
          className={cn(
            "cursor-pointer text-muted-foreground hover:text-destructive",
            className,
          )}
          aria-label={`Delete ${itemLabel}`}
          title={`Delete ${itemLabel}`}
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the session, including its context,
            attempts, and reflections. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={disabled || isDeleting}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? "Deleting…" : "Delete session"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
