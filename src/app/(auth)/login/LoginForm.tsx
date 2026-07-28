"use client";

import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/app/(auth)/actions";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";

const initialState: ActionResult = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Log in to manage your loans and applications.
          </p>
        </div>

        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in…" : "Log In"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-brand-700">
            Sign up
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
