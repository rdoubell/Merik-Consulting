"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  Users,
  Landmark,
  Percent,
  BarChart3,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/loans", label: "Loans", icon: Landmark },
  { href: "/admin/interest-config", label: "Interest & Fees", icon: Percent },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-5 font-extrabold text-white">
        <ShieldCheck className="h-6 w-6" />
        <span className="text-lg tracking-tight">MERIK Admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className="border-t border-white/10 p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </form>
    </div>
  );
}
