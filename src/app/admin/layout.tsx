import { requireAdmin } from "@/lib/server/auth/guard";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 bg-slate-900 sm:block">
        <div className="fixed h-screen w-64">
          <AdminNav />
        </div>
      </aside>
      <div className="flex-1">
        <div className="border-b border-slate-100 bg-slate-900 sm:hidden">
          <AdminNav />
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
