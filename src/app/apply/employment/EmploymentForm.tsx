"use client";

import { useActionState, useState } from "react";
import { saveEmploymentInfoAction, type ActionResult } from "@/app/apply/actions";
import { Label, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody } from "@/components/ui/Card";
import type { Application } from "@/generated/prisma";

const initialState: ActionResult = { error: null };

export function EmploymentForm({
  applicationId,
  application,
}: {
  applicationId: string;
  application: Application;
}) {
  const action = saveEmploymentInfoAction.bind(null, applicationId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [status, setStatus] = useState(application.employmentStatus ?? "EMPLOYED");
  const isSelfEmployed = status === "SELF_EMPLOYED";
  const isEmployed = status === "EMPLOYED" || status === "CONTRACT";

  return (
    <Card>
      <CardBody className="space-y-5">
        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <form action={formAction} className="space-y-5">
          <div>
            <Label htmlFor="employmentStatus">Employment Status</Label>
            <Select
              id="employmentStatus"
              name="employmentStatus"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="EMPLOYED">Employed</option>
              <option value="SELF_EMPLOYED">Self-Employed</option>
              <option value="CONTRACT">Contract</option>
              <option value="UNEMPLOYED">Unemployed</option>
              <option value="RETIRED">Retired</option>
            </Select>
          </div>

          {isEmployed && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="employerName">Employer Name</Label>
                <Input
                  id="employerName"
                  name="employerName"
                  defaultValue={application.employerName ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  defaultValue={application.occupation ?? ""}
                />
              </div>
            </div>
          )}

          {isSelfEmployed && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  defaultValue={application.businessName ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="monthlyRevenue">Monthly Revenue (R)</Label>
                <Input
                  id="monthlyRevenue"
                  name="monthlyRevenue"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={application.monthlyRevenue ?? ""}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="monthlyIncome">Monthly Income (R)</Label>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                required
                min={0}
                step="0.01"
                defaultValue={application.monthlyIncome ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="salaryFrequency">Salary Payment Frequency</Label>
              <Select
                id="salaryFrequency"
                name="salaryFrequency"
                required
                defaultValue={application.salaryFrequency ?? "MONTHLY"}
              >
                <option value="WEEKLY">Weekly</option>
                <option value="BI_WEEKLY">Bi-Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="payday">Payday</Label>
              <Input
                id="payday"
                name="payday"
                required
                placeholder="e.g. 25th of the month"
                defaultValue={application.payday ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="employmentLength">Employment Length (years)</Label>
              <Input
                id="employmentLength"
                name="employmentLength"
                required
                placeholder="e.g. 2.5"
                defaultValue={application.employmentLength ?? ""}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
