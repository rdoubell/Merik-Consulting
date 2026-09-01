"use client";

import { useActionState, useState } from "react";
import { savePersonalInfoAction, type ActionResult } from "@/app/apply/actions";
import { Label, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody } from "@/components/ui/Card";
import { PROVINCES, PERMIT_TYPES } from "@/lib/validation/application";
import type { Profile, User, IdentificationType } from "@/generated/prisma";

const initialState: ActionResult = { error: null };

export function PersonalForm({
  applicationId,
  profile,
  user,
}: {
  applicationId: string;
  profile: Profile | null;
  user: User;
}) {
  const action = savePersonalInfoAction.bind(null, applicationId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [idType, setIdType] = useState<IdentificationType>(profile?.idType ?? "SA_ID");
  const isPassport = idType === "PASSPORT";

  return (
    <Card>
      <CardBody className="space-y-5">
        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" required defaultValue={profile?.firstName} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" required defaultValue={profile?.lastName} />
            </div>
          </div>

          <div>
            <Label htmlFor="idType">Identification Type</Label>
            <Select
              id="idType"
              name="idType"
              required
              value={idType}
              onChange={(e) => setIdType(e.target.value as IdentificationType)}
            >
              <option value="SA_ID">South African ID</option>
              <option value="PASSPORT">Passport (foreign national)</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="idNumber">
              {isPassport ? "Passport Number" : "South African ID Number"}
            </Label>
            <Input
              id="idNumber"
              name="idNumber"
              required
              inputMode={isPassport ? "text" : "numeric"}
              maxLength={isPassport ? undefined : 13}
              defaultValue={profile?.idNumber}
              placeholder={isPassport ? "Passport number" : "13 digits"}
            />
          </div>

          {isPassport && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="permitType">Permit / Visa Type</Label>
                <Select id="permitType" name="permitType" required defaultValue={profile?.permitType ?? ""}>
                  <option value="" disabled>
                    Select
                  </option>
                  {PERMIT_TYPES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="permitNumber">Permit / Visa Number</Label>
                <Input
                  id="permitNumber"
                  name="permitNumber"
                  required
                  defaultValue={profile?.permitNumber ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="permitExpiryDate">Permit / Visa Expiry Date</Label>
                <Input
                  id="permitExpiryDate"
                  name="permitExpiryDate"
                  type="date"
                  required
                  defaultValue={
                    profile?.permitExpiryDate
                      ? new Date(profile.permitExpiryDate).toISOString().slice(0, 10)
                      : undefined
                  }
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                defaultValue={
                  profile?.dateOfBirth
                    ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
                    : undefined
                }
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select id="gender" name="gender" required defaultValue={profile?.gender ?? ""}>
                <option value="" disabled>
                  Select
                </option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                readOnly
                defaultValue={user.phone}
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                readOnly
                defaultValue={user.email}
                className="bg-slate-50 text-slate-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="addressLine">Residential Address</Label>
            <Input id="addressLine" name="addressLine" required defaultValue={profile?.addressLine} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="province">Province</Label>
              <Select id="province" name="province" required defaultValue={profile?.province ?? ""}>
                <option value="" disabled>
                  Select
                </option>
                {PROVINCES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required defaultValue={profile?.city} />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                required
                inputMode="numeric"
                maxLength={4}
                defaultValue={profile?.postalCode}
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
