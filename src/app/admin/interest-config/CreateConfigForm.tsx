"use client";

import { useActionState } from "react";
import { createInterestConfigAction } from "@/app/admin/actions";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: { error: string } | { error: null } = { error: null };

export function CreateConfigForm() {
  const [state, formAction, pending] = useActionState(createInterestConfigAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="danger">{state.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Configuration Name</Label>
          <Input id="name" name="name" required placeholder="e.g. Standard Pricing Q1" />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="makeActive" className="h-4 w-4 rounded border-slate-300 text-brand-600" />
            Make active immediately
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="minAmount">Min Amount (R)</Label>
          <Input id="minAmount" name="minAmount" type="number" defaultValue={200} required />
        </div>
        <div>
          <Label htmlFor="maxAmount">Max Amount (R)</Label>
          <Input id="maxAmount" name="maxAmount" type="number" defaultValue={2000} required />
        </div>
        <div>
          <Label htmlFor="maxLoanValue">Max Loan Value (R)</Label>
          <Input id="maxLoanValue" name="maxLoanValue" type="number" defaultValue={2000} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="baseRatePct">Base Interest Rate (% of principal)</Label>
          <Input id="baseRatePct" name="baseRatePct" type="number" step="0.1" defaultValue={15} required />
        </div>
        <div>
          <Label htmlFor="serviceFeeFlat">Service Fee (flat, R)</Label>
          <Input id="serviceFeeFlat" name="serviceFeeFlat" type="number" step="0.01" defaultValue={10} required />
        </div>
        <div>
          <Label htmlFor="serviceFeePct">Service Fee (% of principal)</Label>
          <Input id="serviceFeePct" name="serviceFeePct" type="number" step="0.1" defaultValue={2} required />
        </div>
      </div>

      <div>
        <Label>Risk-Tier Rate Adjustments (percentage points added to base rate)</Label>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="lowAdj" className="text-xs text-slate-500">Low Risk</Label>
            <Input id="lowAdj" name="lowAdj" type="number" step="0.1" defaultValue={0} />
          </div>
          <div>
            <Label htmlFor="mediumAdj" className="text-xs text-slate-500">Medium Risk</Label>
            <Input id="mediumAdj" name="mediumAdj" type="number" step="0.1" defaultValue={8} />
          </div>
          <div>
            <Label htmlFor="highAdj" className="text-xs text-slate-500">High Risk</Label>
            <Input id="highAdj" name="highAdj" type="number" step="0.1" defaultValue={18} />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="allowedTermDays">Allowed Repayment Periods (days, comma-separated)</Label>
        <Input id="allowedTermDays" name="allowedTermDays" defaultValue="7,14,30" required />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create Configuration"}
      </Button>
    </form>
  );
}
