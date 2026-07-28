"use client";

import { useTransition } from "react";
import { updateDocumentVerificationAction } from "@/app/admin/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

export function DocumentVerifyButtons({
  documentId,
  status,
}: {
  documentId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={status} />
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => updateDocumentVerificationAction(documentId, "VERIFIED"))
        }
        className={cn(
          "rounded-full border border-success-200 px-2.5 py-1 text-xs font-semibold text-success-700 hover:bg-success-50",
          isPending && "opacity-50"
        )}
      >
        Verify
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => updateDocumentVerificationAction(documentId, "REJECTED"))
        }
        className={cn(
          "rounded-full border border-red-200 px-2.5 py-1 text-xs font-semibold text-danger-600 hover:bg-danger-50",
          isPending && "opacity-50"
        )}
      >
        Reject
      </button>
    </div>
  );
}
