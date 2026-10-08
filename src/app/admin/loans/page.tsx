import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { customerDisplayName } from "@/lib/customerName";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LoanStatus } from "@/generated/prisma";

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

const TABS: { label: string; statuses: LoanStatus[] }[] = [
  { label: "Pending", statuses: ["PENDING"] },
  { label: "Approved", statuses: ["APPROVED", "ACTIVE"] },
  { label: "Declined", statuses: ["DECLINED"] },
  { label: "Paid", statuses: ["PAID"] },
  { label: "Overdue", statuses: ["OVERDUE"] },
];

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = TABS.find((t) => t.label.toLowerCase() === tab) ?? TABS[0];

  const loans = await prisma.loan.findMany({
    where: { status: { in: activeTab.statuses } },
    orderBy: { createdAt: "desc" },
    include: { application: { include: { user: { include: { profile: true } } } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Loans</h1>
        <p className="text-sm text-slate-500">Manage loan offers by status.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={`/admin/loans?tab=${t.label.toLowerCase()}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeTab.label === t.label
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Principal</th>
                  <th className="px-6 py-3">Term</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {customerDisplayName(loan.application.user)}
                    </td>
                    <td className="px-6 py-3">{formatRand(loan.principal)}</td>
                    <td className="px-6 py-3">{loan.termDays} days</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={loan.status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/admin/loans/${loan.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-brand-700"
                      >
                        Review <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {loans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No loans in this status.
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
