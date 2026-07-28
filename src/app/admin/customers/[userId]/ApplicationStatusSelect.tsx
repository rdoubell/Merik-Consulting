"use client";

import { useTransition } from "react";
import { updateApplicationStatusAction } from "@/app/admin/actions";
import type { ApplicationStatus } from "@/generated/prisma";

const STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "DECLINED",
];

export function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() =>
          updateApplicationStatusAction(applicationId, e.target.value as ApplicationStatus)
        )
      }
      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
