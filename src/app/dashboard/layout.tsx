import { requireSession } from "@/lib/server/auth/guard";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  if (session.role === "ADMIN") redirect("/admin");

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
