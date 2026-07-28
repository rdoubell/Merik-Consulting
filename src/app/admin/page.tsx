import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { startOfDay } from "date-fns";

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export default async function AdminOverviewPage() {
  const today = startOfDay(new Date());

  const [
    applicationsToday,
    pendingLoans,
    activeLoans,
    overdueLoans,
    recentApplications,
    outstanding,
  ] = await Promise.all([
    prisma.application.count({ where: { submittedAt: { gte: today } } }),
    prisma.loan.count({ where: { status: "PENDING" } }),
    prisma.loan.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
    prisma.loan.count({ where: { status: "OVERDUE" } }),
    prisma.application.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { include: { profile: true } }, loan: true },
    }),
    prisma.loan.aggregate({
      where: { status: { in: ["APPROVED", "ACTIVE", "OVERDUE"] } },
      _sum: { totalRepayable: true },
    }),
  ]);

  const stats = [
    { label: "Applications Today", value: applicationsToday },
    { label: "Pending Review", value: pendingLoans },
    { label: "Active Loans", value: activeLoans },
    { label: "Overdue", value: overdueLoans },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Overview</h1>
        <p className="text-sm text-slate-500">A snapshot of today&apos;s activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody>
              <p className="text-xs font-semibold uppercase text-slate-400">{s.label}</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{s.value}</p>
            </CardBody>
          </Card>
        ))}
        <Card className="sm:col-span-2 lg:col-span-4">
          <CardBody>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Total Outstanding Balance (Approved/Active/Overdue)
            </p>
            <p className="mt-1 text-3xl font-extrabold text-brand-700">
              {formatRand(outstanding._sum.totalRepayable ?? 0)}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <p className="font-semibold text-slate-900">Recent Applications</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <th className="py-2">Applicant</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Loan Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-50">
                    <td className="py-2.5">
                      <Link
                        href={`/admin/customers/${app.userId}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {app.user.profile
                          ? `${app.user.profile.firstName} ${app.user.profile.lastName}`
                          : app.user.email}
                      </Link>
                    </td>
                    <td className="py-2.5">
                      {app.loanAmount ? formatRand(app.loanAmount) : "—"}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-2.5">
                      {app.loan ? <StatusBadge status={app.loan.status} /> : "—"}
                    </td>
                  </tr>
                ))}
                {recentApplications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No applications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
