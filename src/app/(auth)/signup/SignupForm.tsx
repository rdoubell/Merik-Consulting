"use client";

import { useActionState } from "react";
import { signupAction, type ActionResult } from "@/app/(auth)/actions";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";

const initialState: ActionResult = { error: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState
  );

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            You&apos;ll verify your email with a one-time code before you can
            apply.
          </p>
        </div>

        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="phone">Mobile Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="082 123 4567"
              required
              autoComplete="tel"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <label className="flex items-start gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="popiaConsent"
              required
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              I consent to MERIK processing my personal information in
              accordance with the{" "}
              <Link href="/legal/privacy" className="text-brand-700 underline">
                Privacy Policy
              </Link>{" "}
              and POPIA.
            </span>
          </label>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-700">
            Log in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
