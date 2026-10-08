"use client";

import { useActionState } from "react";
import { createManualLoanAction } from "@/app/admin/actions";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: { error: string } | { error: null } = { error: null };

export function NewLoanForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(createManualLoanAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />
      {state.error && <Alert tone="danger">{state.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="amount">Loan Amount (R)</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0" required />
        </div>
        <div>
          <Label htmlFor="interestRatePct">Interest Rate (%)</Label>
          <Input id="interestRatePct" name="interestRatePct" type="number" step="0.01" min="0" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="disbursedAt">Date Disbursed</Label>
          <Input id="disbursedAt" name="disbursedAt" type="date" required />
        </div>
        <div>
          <Label htmlFor="dueDate">Expected Payback Date</Label>
          <Input id="dueDate" name="dueDate" type="date" required />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add Loan"}
      </Button>
    </form>
  );
}
