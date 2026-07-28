"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { LayoutDashboard, Landmark, FileStack, UserRound, LogOut, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/loans", label: "My Loans", icon: Landmark },
  { href: "/dashboard/documents", label: "Documents", icon: FileStack },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-brand-700">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xl tracking-tight">MERIK</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </form>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-50 px-2 py-1.5 sm:hidden">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                active ? "bg-brand-50 text-brand-700" : "text-slate-500"
              )}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
