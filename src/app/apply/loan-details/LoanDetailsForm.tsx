"use client";

import { useActionState, useMemo, useState } from "react";
import { saveLoanDetailsAction, type ActionResult } from "@/app/apply/actions";
import { Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody } from "@/components/ui/Card";
import { LOAN_TERMS } from "@/lib/validation/application";
import { cn } from "@/lib/cn";
import type { Application } from "@/generated/prisma";

const initialState: ActionResult = { error: null };

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export function LoanDetailsForm({
  applicationId,
  application,
}: {
  applicationId: string;
  application: Application;
}) {
  const action = saveLoanDetailsAction.bind(null, applicationId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [amount, setAmount] = useState(application.loanAmount ?? 500);
  const [term, setTerm] = useState<(typeof LOAN_TERMS)[number]>(
    (application.loanTermDays as (typeof LOAN_TERMS)[number]) ?? 30
  );

  // Illustrative estimate only — the real interest rate, fees, and schedule
  // are computed server-side by the pricing engine after risk checks.
  const estimate = useMemo(() => {
    const illustrativeRate = 0.03 * (term / 7); // rough "up to" indicator
    const total = amount * (1 + illustrativeRate);
    return Math.round(total * 100) / 100;
  }, [amount, term]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-6">
          {state.error && <Alert tone="danger">{state.error}</Alert>}

          <form action={formAction} className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="loanAmount">Loan Amount</Label>
                <span className="text-2xl font-extrabold text-brand-700">
                  {formatRand(amount)}
                </span>
              </div>
              <input
                id="loanAmount"
                name="loanAmount"
                type="range"
                min={200}
                max={2000}
                step={50}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-2 w-full accent-brand-600"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>R200</span>
                <span>R2,000</span>
              </div>
            </div>

            <div>
              <Label>Loan Term</Label>
              <div className="grid grid-cols-3 gap-3">
                {LOAN_TERMS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTerm(t)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-colors",
                      term === t
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {t} Days
                  </button>
                ))}
              </div>
              <input type="hidden" name="loanTermDays" value={term} />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Continue"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="border-brand-100 bg-brand-50">
        <CardBody>
          <p className="text-sm font-semibold text-brand-700">Estimated repayment</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">
            {formatRand(estimate)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            This is an illustrative estimate only. Your final interest rate,
            service fees, and repayment schedule will be calculated after an
            affordability and risk check, and shown to you in full before you
            accept any offer.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
