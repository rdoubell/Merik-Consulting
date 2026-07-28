"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionResult } from "@/app/dashboard/actions";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { User, Profile } from "@/generated/prisma";

const initialState: ActionResult = { error: null };

export function ProfileForm({ user, profile }: { user: User; profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <Card>
      <CardBody className="space-y-5">
        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" defaultValue={user.email} readOnly className="bg-slate-50 text-slate-500" />
            <p className="mt-1 text-xs text-slate-400">Your email is used to log in and can&apos;t be changed here.</p>
          </div>
          <div>
            <Label htmlFor="phone">Mobile Number</Label>
            <Input id="phone" name="phone" defaultValue={user.phone} required />
          </div>
          {profile && (
            <>
              <div>
                <Label htmlFor="addressLine">Residential Address</Label>
                <Input id="addressLine" name="addressLine" defaultValue={profile.addressLine} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={profile.city} required />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" name="postalCode" defaultValue={profile.postalCode} required />
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
