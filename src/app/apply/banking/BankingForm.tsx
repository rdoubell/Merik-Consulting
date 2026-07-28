"use client";

import { useActionState } from "react";
import { saveBankingInfoAction, type ActionResult } from "@/app/apply/actions";
import { Label, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody } from "@/components/ui/Card";
import type { Application } from "@/generated/prisma";

const initialState: ActionResult = { error: null };

const SA_BANKS = [
  "ABSA",
  "Capitec",
  "FNB",
  "Nedbank",
  "Standard Bank",
  "TymeBank",
  "Discovery Bank",
  "African Bank",
  "Other",
];

export function BankingForm({
  applicationId,
  application,
}: {
  applicationId: string;
  application: Application;
}) {
  const action = saveBankingInfoAction.bind(null, applicationId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Card>
      <CardBody className="space-y-5">
        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <form action={formAction} className="space-y-5">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Select id="bankName" name="bankName" required defaultValue={application.bankName ?? ""}>
              <option value="" disabled>
                Select your bank
              </option>
              {SA_BANKS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="accountHolder">Account Holder</Label>
            <Input
              id="accountHolder"
              name="accountHolder"
              required
              defaultValue={application.accountHolder ?? ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                required
                inputMode="numeric"
                defaultValue={application.accountNumber ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="branchCode">Branch Code</Label>
              <Input
                id="branchCode"
                name="branchCode"
                required
                inputMode="numeric"
                defaultValue={application.branchCode ?? ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <Select
              id="accountType"
              name="accountType"
              required
              defaultValue={application.accountType ?? "SAVINGS"}
            >
              <option value="CHEQUE">Cheque</option>
              <option value="SAVINGS">Savings</option>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
