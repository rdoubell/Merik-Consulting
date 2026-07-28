import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 font-extrabold text-brand-700"
      >
        <ShieldCheck className="h-6 w-6" />
        <span className="text-xl tracking-tight">MERIK</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
