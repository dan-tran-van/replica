"use client";

import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({
  text,
  label = "Copy",
  className,
}: CopyButtonProps) {
  async function handleCopy() {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success("Copied to clipboard");
    } else {
      toast.error("Failed to copy");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleCopy()}
      className={className}
    >
      {label}
    </Button>
  );
}
