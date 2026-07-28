"use client";

import { useActionState, useState } from "react";
import { uploadDocumentsAction, type ActionResult } from "@/app/apply/actions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody } from "@/components/ui/Card";
import { FileUpload } from "@/components/ui/FileUpload";
import type { Document } from "@/generated/prisma";

const initialState: ActionResult = { error: null };

const SLOTS: { field: string; label: string; type: Document["type"]; hint?: string }[] = [
  { field: "idDocument", label: "South African ID", type: "ID_DOCUMENT" },
  { field: "payslip", label: "Latest Payslip", type: "PAYSLIP", hint: "If employed" },
  { field: "bankStatement", label: "Recent Bank Statement", type: "BANK_STATEMENT" },
  { field: "proofOfAddress", label: "Proof of Address", type: "PROOF_OF_ADDRESS" },
];

export function VerificationForm({
  applicationId,
  existingDocuments,
  needsPayslip,
}: {
  applicationId: string;
  existingDocuments: Document[];
  needsPayslip: boolean;
}) {
  const action = uploadDocumentsAction.bind(null, applicationId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const uploadedTypes = new Set(existingDocuments.map((d) => d.type));

  return (
    <Card>
      <CardBody className="space-y-5">
        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <form action={formAction} className="space-y-5">
          {SLOTS.filter((slot) => slot.field !== "payslip" || needsPayslip).map((slot) => (
            <FileUpload
              key={slot.field}
              label={
                uploadedTypes.has(slot.type)
                  ? `${slot.label} (already uploaded — replace if needed)`
                  : slot.label
              }
              hint={slot.hint}
              file={files[slot.field] ?? null}
              onChange={(file) => setFiles((f) => ({ ...f, [slot.field]: file }))}
            />
          ))}

          {/* Hidden inputs mirror selected files so they submit with the form */}
          {SLOTS.filter((slot) => slot.field !== "payslip" || needsPayslip).map((slot) =>
            files[slot.field] ? (
              <HiddenFileInput key={slot.field} name={slot.field} file={files[slot.field]!} />
            ) : null
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Uploading…" : "Continue"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

function HiddenFileInput({ name, file }: { name: string; file: File }) {
  return (
    <input
      type="file"
      name={name}
      hidden
      ref={(el) => {
        if (!el) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        el.files = dt.files;
      }}
    />
  );
}
