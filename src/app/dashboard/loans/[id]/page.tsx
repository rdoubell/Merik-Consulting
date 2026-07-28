import { requireSession } from "@/lib/server/auth/guard";
import { getUserApplicationDetail, isOfferVisibleToCustomer } from "@/lib/server/applications/queries";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { notFound } from "next/navigation";
import { Download, Wallet } from "lucide-react";

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const application = await getUserApplicationDetail(session.userId, id);
  if (!application) notFound();

  const loan = application.loan;
  const offerVisible = loan ? isOfferVisibleToCustomer(loan.status) : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {application.loanAmount ? formatRand(application.loanAmount) : "Application"} Loan
          </h1>
          <p className="text-sm text-slate-500">
            Applied {new Date(application.createdAt).toLocaleDateString("en-ZA")}
          </p>
        </div>
        <StatusBadge status={loan?.status ?? application.status} />
      </div>

      {!loan && (
        <Alert tone="info">
          Your application is still being processed. Check back soon for an
          update.
        </Alert>
      )}

      {loan && !offerVisible && (
        <Alert tone="info" title="Under review">
          Your loan offer is being finalised. Once approved, your interest,
          fees, and full repayment schedule will appear here.
        </Alert>
      )}

      {loan && offerVisible && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-xs font-semibold uppercase text-slate-400">Principal</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatRand(loan.principal)}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs font-semibold uppercase text-slate-400">Total Repayable</p>
                <p className="mt-1 text-xl font-bold text-success-700">
                  {formatRand(loan.totalRepayable)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs font-semibold uppercase text-slate-400">Due Date</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString("en-ZA") : "—"}
                </p>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">Repayment Schedule</p>
              </div>
              {loan.installments.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  Your repayment schedule will be generated once the loan is
                  disbursed.
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
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
                          <td className="py-2.5">
                            {new Date(inst.dueDate).toLocaleDateString("en-ZA")}
                          </td>
                          <td className="py-2.5">{formatRand(inst.amountDue)}</td>
                          <td className="py-2.5">
                            <StatusBadge status={inst.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href={`/api/loans/${loan.id}/agreement`}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" /> Download Agreement
            </ButtonLink>
            <Button variant="secondary" disabled className="gap-2">
              <Wallet className="h-4 w-4" /> Make a Repayment (coming soon)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
