"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveLoanAction,
  declineLoanAction,
  markLoanPaidAction,
  markLoanOverdueAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import type { LoanStatus } from "@/generated/prisma";

export function LoanActions({ loanId, status }: { loanId: string; status: LoanStatus }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: (id: string) => Promise<void>) {
    startTransition(async () => {
      await action(loanId);
      router.refresh();
    });
  }

  if (status === "PENDING") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button disabled={isPending} onClick={() => run(approveLoanAction)}>
          Approve &amp; Disburse
        </Button>
        <Button variant="danger" disabled={isPending} onClick={() => run(declineLoanAction)}>
          Decline
        </Button>
      </div>
    );
  }

  if (status === "APPROVED" || status === "ACTIVE") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button disabled={isPending} onClick={() => run(markLoanPaidAction)}>
          Mark as Paid
        </Button>
        <Button variant="outline" disabled={isPending} onClick={() => run(markLoanOverdueAction)}>
          Mark as Overdue
        </Button>
      </div>
    );
  }

  if (status === "OVERDUE") {
    return (
      <Button disabled={isPending} onClick={() => run(markLoanPaidAction)}>
        Mark as Paid
      </Button>
    );
  }

  return <p className="text-sm text-slate-400">No further actions available for this loan.</p>;
}
