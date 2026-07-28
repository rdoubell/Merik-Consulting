"use client";

import { useActionState, useState } from "react";
import { uploadAdditionalDocumentAction, type ActionResult } from "@/app/dashboard/actions";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: ActionResult = { error: null };

const SLOTS = [
  { field: "idDocument", label: "South African ID" },
  { field: "payslip", label: "Latest Payslip" },
  { field: "bankStatement", label: "Recent Bank Statement" },
  { field: "proofOfAddress", label: "Proof of Address" },
];

export function UploadForm() {
  const [state, formAction, pending] = useActionState(
    uploadAdditionalDocumentAction,
    initialState
  );
  const [files, setFiles] = useState<Record<string, File | null>>({});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="danger">{state.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        {SLOTS.map((slot) => (
          <FileUpload
            key={slot.field}
            label={slot.label}
            file={files[slot.field] ?? null}
            onChange={(file) => setFiles((f) => ({ ...f, [slot.field]: file }))}
          />
        ))}
      </div>

      {SLOTS.map((slot) =>
        files[slot.field] ? (
          <input
            key={slot.field}
            type="file"
            name={slot.field}
            hidden
            ref={(el) => {
              if (!el) return;
              const dt = new DataTransfer();
              dt.items.add(files[slot.field]!);
              el.files = dt.files;
            }}
          />
        ) : null
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}
