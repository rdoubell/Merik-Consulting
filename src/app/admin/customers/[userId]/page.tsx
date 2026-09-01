import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DocumentVerifyButtons } from "./DocumentVerifyButtons";
import { ApplicationStatusSelect } from "./ApplicationStatusSelect";
import { FileText, ArrowRight } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  ID_DOCUMENT: "South African ID",
  PASSPORT: "Passport",
  WORK_PERMIT: "Permit / Visa",
  PAYSLIP: "Payslip",
  BANK_STATEMENT: "Bank Statement",
  PROOF_OF_ADDRESS: "Proof of Address",
};

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const customer = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      applications: {
        where: { status: { not: "DRAFT" } },
        orderBy: { createdAt: "desc" },
        include: { documents: true, riskAssessment: true, loan: true },
      },
    },
  });

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {customer.profile ? `${customer.profile.firstName} ${customer.profile.lastName}` : customer.email}
        </h1>
        <p className="text-sm text-slate-500">{customer.email} · {customer.phone}</p>
      </div>

      {customer.profile && (
        <Card>
          <CardBody className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                {customer.profile.idType === "PASSPORT" ? "Passport Number" : "ID Number"}
              </p>
              <p className="mt-0.5 font-medium text-slate-900">{customer.profile.idNumber}</p>
              {customer.profile.idType === "PASSPORT" && (
                <p className="mt-1 text-xs text-slate-500">
                  {customer.profile.permitType} · {customer.profile.permitNumber}
                  {customer.profile.permitExpiryDate &&
                    ` · expires ${new Date(customer.profile.permitExpiryDate).toLocaleDateString("en-ZA")}`}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Date of Birth</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {new Date(customer.profile.dateOfBirth).toLocaleDateString("en-ZA")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Address</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {customer.profile.addressLine}, {customer.profile.city}, {customer.profile.province}{" "}
                {customer.profile.postalCode}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-900">Applications</h2>
        <div className="mt-3 space-y-4">
          {customer.applications.length === 0 && (
            <Card>
              <CardBody className="text-center text-slate-400">No submitted applications.</CardBody>
            </Card>
          )}
          {customer.applications.map((app) => (
            <Card key={app.id}>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {app.loanAmount ? formatRand(app.loanAmount) : "—"} ·{" "}
                      {app.loanTermDays ? `${app.loanTermDays} days` : ""}
                    </p>
                    <p className="text-xs text-slate-400">
                      Submitted {app.submittedAt ? new Date(app.submittedAt).toLocaleString("en-ZA") : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ApplicationStatusSelect applicationId={app.id} currentStatus={app.status} />
                    {app.loan && <StatusBadge status={app.loan.status} />}
                  </div>
                </div>

                {app.riskAssessment && (
                  <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">Credit Score</p>
                      <p className="font-semibold text-slate-900">{app.riskAssessment.creditScoreStub}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">Risk Tier</p>
                      <p className="font-semibold text-slate-900">{app.riskAssessment.riskTier}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">Affordability</p>
                      <p className="font-semibold text-slate-900">
                        {app.riskAssessment.affordabilityPass ? "Pass" : "Fail"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">Fraud Flags</p>
                      <p className="font-semibold text-slate-900">
                        {JSON.parse(app.riskAssessment.fraudFlags).length || "None"}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Documents</p>
                  <ul className="space-y-2">
                    {app.documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                      >
                        <a
                          href={`/api/documents/${doc.id}/download`}
                          target="_blank"
                          className="flex items-center gap-2 text-sm font-medium text-brand-700 hover:underline"
                        >
                          <FileText className="h-4 w-4" /> {TYPE_LABEL[doc.type] ?? doc.type}
                        </a>
                        <DocumentVerifyButtons documentId={doc.id} status={doc.verificationStatus} />
                      </li>
                    ))}
                    {app.documents.length === 0 && (
                      <p className="text-sm text-slate-400">No documents uploaded.</p>
                    )}
                  </ul>
                </div>

                {app.loan && (
                  <Link
                    href={`/admin/loans/${app.loan.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700"
                  >
                    Manage loan <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
