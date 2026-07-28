import { requireSession } from "@/lib/server/auth/guard";
import { getUserApplications } from "@/lib/server/applications/queries";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export default async function LoansPage() {
  const session = await requireSession();
  const applications = await getUserApplications(session.userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900">My Loans</h1>

      {applications.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-slate-500">
            You haven&apos;t applied for a loan yet.
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => (
            <Card key={a.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {a.loanAmount ? formatRand(a.loanAmount) : "Application"} ·{" "}
                    {a.loanTermDays ? `${a.loanTermDays} days` : ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    Applied {new Date(a.createdAt).toLocaleDateString("en-ZA")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.loan?.status ?? a.status} />
                  <Link
                    href={`/dashboard/loans/${a.id}`}
                    className="flex items-center gap-1 text-sm font-semibold text-brand-700"
                  >
                    Details <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
