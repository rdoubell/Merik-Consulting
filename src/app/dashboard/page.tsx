import { requireSession } from "@/lib/server/auth/guard";
import { getUserApplications, isOfferVisibleToCustomer } from "@/lib/server/applications/queries";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const session = await requireSession();
  const { submitted } = await searchParams;
  const applications = await getUserApplications(session.userId);
  const latest = applications[0];
  const activeLoans = applications.filter(
    (a) => a.loan && ["ACTIVE", "OVERDUE"].includes(a.loan.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your account.</p>
        </div>
        <ButtonLink href="/apply">Apply for a New Loan</ButtonLink>
      </div>

      {submitted === "1" && (
        <Alert tone="success" title="Application submitted">
          We&apos;re reviewing your application now. You&apos;ll see your offer
          here as soon as it&apos;s ready.
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-lg font-semibold text-slate-900">
              You don&apos;t have any applications yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Apply in minutes for a loan between R200 and R2,000.
            </p>
            <ButtonLink href="/apply" className="mt-5">
              Apply Now
            </ButtonLink>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">Latest application</p>
                <StatusBadge status={latest.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {latest.loanAmount ? formatRand(latest.loanAmount) : "—"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {latest.loanTermDays ? `${latest.loanTermDays}-day term` : "Term not set"}
                  </p>
                </div>
                {latest.loan && isOfferVisibleToCustomer(latest.loan.status) && (
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total repayable</p>
                    <p className="text-xl font-bold text-success-700">
                      {formatRand(latest.loan.totalRepayable)}
                    </p>
                  </div>
                )}
              </div>
              {latest.status === "UNDER_REVIEW" && (
                <p className="mt-3 text-sm text-slate-500">
                  Your application is under review. Final interest, fees, and
                  your repayment schedule will appear here once your offer has
                  been approved.
                </p>
              )}
              <Link
                href={`/dashboard/loans/${latest.id}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700"
              >
                View details <ArrowRight className="h-4 w-4" />
              </Link>
            </CardBody>
          </Card>

          {activeLoans.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Loans</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {activeLoans.map((a) => (
                  <Card key={a.id}>
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">
                          {a.loan ? formatRand(a.loan.principal) : ""}
                        </p>
                        <StatusBadge status={a.loan!.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        Due {a.loan?.dueDate ? new Date(a.loan.dueDate).toLocaleDateString("en-ZA") : "—"}
                      </p>
                      <Link
                        href={`/dashboard/loans/${a.id}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700"
                      >
                        View repayment schedule <ArrowRight className="h-4 w-4" />
                      </Link>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
