"use client";

import { useActionState } from "react";
import { createCustomerAction } from "@/app/admin/actions";
import { Label, Input, FieldHint } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: { error: string } | { error: null } = { error: null };

export function NewCustomerForm() {
  const [state, formAction, pending] = useActionState(createCustomerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="danger">{state.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="Leave blank if not on file" />
        <FieldHint>If left blank, a placeholder is generated — update it once you have a real email.</FieldHint>
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" placeholder="Leave blank if not on file" />
        <FieldHint>If left blank, a placeholder is generated — update it once you have a real number.</FieldHint>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create Client"}
      </Button>
    </form>
  );
}
