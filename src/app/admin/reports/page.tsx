import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { subDays, startOfDay, format } from "date-fns";

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export default async function ReportsPage() {
  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6);

  const [
    totalApplications,
    totalApproved,
    totalDeclined,
    totalPaid,
    totalOverdue,
    outstanding,
    repaid,
    applicationsInRange,
    loansInRange,
  ] = await Promise.all([
    prisma.application.count({ where: { status: { not: "DRAFT" } } }),
    prisma.loan.count({ where: { status: { in: ["APPROVED", "ACTIVE", "PAID"] } } }),
    prisma.loan.count({ where: { status: "DECLINED" } }),
    prisma.loan.count({ where: { status: "PAID" } }),
    prisma.loan.count({ where: { status: "OVERDUE" } }),
    prisma.loan.aggregate({
      where: { status: { in: ["APPROVED", "ACTIVE", "OVERDUE"] } },
      _sum: { totalRepayable: true },
    }),
    prisma.loan.aggregate({ where: { status: "PAID" }, _sum: { totalRepayable: true } }),
    prisma.application.findMany({
      where: { submittedAt: { gte: sevenDaysAgo }, status: { not: "DRAFT" } },
      select: { submittedAt: true },
    }),
    prisma.loan.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true },
    }),
  ]);

  const days = Array.from({ length: 7 }).map((_, i) => startOfDay(subDays(today, 6 - i)));
  const dailyStats = days.map((day) => {
    const dayKey = format(day, "yyyy-MM-dd");
    const applications = applicationsInRange.filter(
      (a) => a.submittedAt && format(a.submittedAt, "yyyy-MM-dd") === dayKey
    ).length;
    const approvals = loansInRange.filter(
      (l) =>
        format(l.createdAt, "yyyy-MM-dd") === dayKey &&
        ["APPROVED", "ACTIVE", "PAID"].includes(l.status)
    ).length;
    const declines = loansInRange.filter(
      (l) => format(l.createdAt, "yyyy-MM-dd") === dayKey && l.status === "DECLINED"
    ).length;
    return { day: format(day, "dd MMM"), applications, approvals, declines };
  });

  const summary = [
    { label: "Total Applications", value: totalApplications },
    { label: "Approved Loans", value: totalApproved },
    { label: "Declined Loans", value: totalDeclined },
    { label: "Paid Loans", value: totalPaid },
    { label: "Overdue (Defaults)", value: totalOverdue },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Applications, approvals, and repayment performance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardBody>
              <p className="text-xs font-semibold uppercase text-slate-400">{s.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{s.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase text-slate-400">Outstanding Balance</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-700">
              {formatRand(outstanding._sum.totalRepayable ?? 0)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Repaid</p>
            <p className="mt-1 text-2xl font-extrabold text-success-700">
              {formatRand(repaid._sum.totalRepayable ?? 0)}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <p className="font-semibold text-slate-900">Last 7 Days</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <th className="py-2">Date</th>
                  <th className="py-2">Applications</th>
                  <th className="py-2">Approvals</th>
                  <th className="py-2">Declines</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats.map((d) => (
                  <tr key={d.day} className="border-b border-slate-50">
                    <td className="py-2.5">{d.day}</td>
                    <td className="py-2.5">{d.applications}</td>
                    <td className="py-2.5">{d.approvals}</td>
                    <td className="py-2.5">{d.declines}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
