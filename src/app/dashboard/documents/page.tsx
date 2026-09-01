import { requireSession } from "@/lib/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UploadForm } from "./UploadForm";
import { FileText } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  ID_DOCUMENT: "South African ID",
  PASSPORT: "Passport",
  WORK_PERMIT: "Permit / Visa",
  PAYSLIP: "Payslip",
  BANK_STATEMENT: "Bank Statement",
  PROOF_OF_ADDRESS: "Proof of Address",
};

export default async function DocumentsPage() {
  const session = await requireSession();
  const documents = await prisma.document.findMany({
    where: { application: { userId: session.userId } },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Documents</h1>

      <Card>
        <CardBody>
          <p className="font-semibold text-slate-900">Uploaded Documents</p>
          {documents.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No documents uploaded yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        target="_blank"
                        className="text-sm font-medium text-brand-700 hover:underline"
                      >
                        {TYPE_LABEL[doc.type] ?? doc.type}
                      </a>
                      <p className="text-xs text-slate-400">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={doc.verificationStatus} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="font-semibold text-slate-900">Upload Additional Documents</p>
          <p className="mt-1 text-sm text-slate-500">
            Upload updated ID, payslip, bank statement, or proof of address.
          </p>
          <div className="mt-4">
            <UploadForm />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
