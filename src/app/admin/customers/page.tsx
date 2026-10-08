import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { customerDisplayName } from "@/lib/customerName";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q
        ? {
            OR: [
              { email: { contains: q } },
              { phone: { contains: q } },
              { profile: { firstName: { contains: q } } },
              { profile: { lastName: { contains: q } } },
              { profile: { idNumber: { contains: q } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { profile: true, applications: { select: { id: true, status: true } } },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Search and manage customer applications.</p>
        </div>
        <ButtonLink href="/admin/customers/new" size="sm">
          <UserPlus className="h-4 w-4" /> Add Client
        </ButtonLink>
      </div>

      <form className="max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search by name, email, phone, or ID number"
            className="pl-10"
          />
        </div>
      </form>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Applications</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {customerDisplayName(c)}
                      </Link>
                    </td>
                    <td className="px-6 py-3">{c.email}</td>
                    <td className="px-6 py-3">{c.phone}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.applications.length === 0 && <span className="text-slate-400">—</span>}
                        {c.applications.map((a) => (
                          <StatusBadge key={a.id} status={a.status} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No customers found.
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
