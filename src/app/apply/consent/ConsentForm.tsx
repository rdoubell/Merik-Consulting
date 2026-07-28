"use client";

import { useActionState } from "react";
import { submitConsentAction, type ActionResult } from "@/app/apply/actions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody } from "@/components/ui/Card";
import Link from "next/link";

const initialState: ActionResult = { error: null };

const CONSENTS: { name: string; label: React.ReactNode }[] = [
  {
    name: "consentTerms",
    label: (
      <>
        I have read and agree to the{" "}
        <Link href="/legal/terms" className="text-brand-700 underline" target="_blank">
          Terms and Conditions
        </Link>
        .
      </>
    ),
  },
  {
    name: "consentPrivacy",
    label: (
      <>
        I have read and agree to the{" "}
        <Link href="/legal/privacy" className="text-brand-700 underline" target="_blank">
          Privacy Policy
        </Link>
        .
      </>
    ),
  },
  {
    name: "consentPopia",
    label: "I consent to MERIK processing my personal information in accordance with POPIA.",
  },
  {
    name: "consentCreditCheck",
    label:
      "I consent to MERIK performing credit and affordability checks as part of this application.",
  },
  {
    name: "consentContact",
    label: "I give MERIK permission to contact me regarding this application via phone, SMS, or email.",
  },
  {
    name: "consentElectronicComms",
    label: "I consent to receive electronic communications, agreements, and notices from MERIK.",
  },
];

export function ConsentForm({ applicationId }: { applicationId: string }) {
  const action = submitConsentAction.bind(null, applicationId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Card>
      <CardBody className="space-y-5">
        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <form action={formAction} className="space-y-5">
          <div className="space-y-3">
            {CONSENTS.map((c) => (
              <label key={c.name} className="flex items-start gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name={c.name}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          <Alert tone="info">
            By submitting, you confirm all information provided is accurate.
            Your final loan offer — including interest, fees, and total
            repayment — will only be shown to you after an affordability and
            risk assessment, and you will not be bound to accept it.
          </Alert>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Submitting…" : "Submit Application"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
