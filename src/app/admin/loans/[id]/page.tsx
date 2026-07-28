import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Alert } from "@/components/ui/Alert";
import { notFound } from "next/navigation";
import { LoanActions } from "./LoanActions";

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      installments: { orderBy: { dueDate: "asc" } },
      application: {
        include: {
          user: { include: { profile: true } },
          riskAssessment: true,
          documents: true,
        },
      },
    },
  });

  if (!loan) notFound();

  const app = loan.application;
  const fraudFlags: string[] = app.riskAssessment ? JSON.parse(app.riskAssessment.fraudFlags) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {app.user.profile ? `${app.user.profile.firstName} ${app.user.profile.lastName}` : app.user.email}
          </h1>
          <p className="text-sm text-slate-500">{app.user.email} · {app.user.phone}</p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase text-slate-400">Principal</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatRand(loan.principal)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase text-slate-400">Interest Rate</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{loan.interestRate}%</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase text-slate-400">Service Fee</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatRand(loan.serviceFee)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Repayable</p>
            <p className="mt-1 text-xl font-bold text-success-700">{formatRand(loan.totalRepayable)}</p>
          </CardBody>
        </Card>
      </div>

      {app.riskAssessment && (
        <Card>
          <CardBody>
            <p className="font-semibold text-slate-900">Risk Assessment</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Credit Score (stub)</p>
                <p className="mt-0.5 font-bold text-slate-900">{app.riskAssessment.creditScoreStub}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Internal Risk Score</p>
                <p className="mt-0.5 font-bold text-slate-900">{app.riskAssessment.internalRiskScore} / 100</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Risk Tier</p>
                <p className="mt-0.5 font-bold text-slate-900">{app.riskAssessment.riskTier}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Affordability</p>
                <p className="mt-0.5 font-bold text-slate-900">
                  {app.riskAssessment.affordabilityPass ? "Pass" : "Fail"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">{app.riskAssessment.affordabilityNotes}</p>
            {fraudFlags.length > 0 && (
              <Alert tone="warning" title="Fraud indicators" className="mt-3">
                <ul className="list-disc pl-4">
                  {fraudFlags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <p className="font-semibold text-slate-900">Repayment Schedule</p>
          {loan.installments.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No installments generated yet.</p>
          ) : (
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <th className="py-2">Due Date</th>
                  <th className="py-2">Amount Due</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.installments.map((inst) => (
                  <tr key={inst.id} className="border-b border-slate-50">
                    <td className="py-2.5">{new Date(inst.dueDate).toLocaleDateString("en-ZA")}</td>
                    <td className="py-2.5">{formatRand(inst.amountDue)}</td>
                    <td className="py-2.5">
                      <StatusBadge status={inst.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="font-semibold text-slate-900">Actions</p>
          <div className="mt-3">
            <LoanActions loanId={loan.id} status={loan.status} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
