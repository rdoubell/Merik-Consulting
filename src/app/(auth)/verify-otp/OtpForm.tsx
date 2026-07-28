"use client";

import { useActionState, useState, useTransition } from "react";
import { verifyOtpAction, resendOtpAction, type ActionResult } from "@/app/(auth)/actions";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { KeyRound } from "lucide-react";

const initialState: ActionResult = { error: null };

export function OtpForm({ devCode }: { devCode: string | null }) {
  const [state, formAction, pending] = useActionState(verifyOtpAction, initialState);
  const [resent, setResent] = useState(false);
  const [isResending, startResend] = useTransition();

  return (
    <Card>
      <CardBody className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Enter your verification code
            </h1>
            <p className="text-sm text-slate-500">
              We&apos;ve sent a 6-digit code to your email.
            </p>
          </div>
        </div>

        {devCode && (
          <Alert tone="info" title="Development mode">
            No real SMS/email provider is configured yet, so here&apos;s your
            code: <span className="font-mono font-bold">{devCode}</span>
          </Alert>
        )}

        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {resent && !state.error && (
          <Alert tone="success">A new code has been sent.</Alert>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              className="text-center text-2xl tracking-[0.5em]"
              placeholder="------"
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Verifying…" : "Verify"}
          </Button>
        </form>

        <button
          type="button"
          disabled={isResending}
          onClick={() =>
            startResend(async () => {
              await resendOtpAction();
              setResent(true);
            })
          }
          className="w-full text-center text-sm font-medium text-brand-700 hover:underline disabled:opacity-50"
        >
          {isResending ? "Sending…" : "Resend code"}
        </button>
      </CardBody>
    </Card>
  );
}
