import Link from "next/link";
import { getSession } from "@/lib/server/auth/session";
import { ButtonLink } from "@/components/ui/Button";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ShieldCheck } from "lucide-react";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-700">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xl tracking-tight">MERIK</span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-slate-600 hover:text-brand-700"
          >
            How It Works
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-slate-600 hover:text-brand-700"
          >
            FAQ
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-medium text-slate-600 hover:text-brand-700"
          >
            Contact
          </Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {session ? (
            <ButtonLink href={session.role === "ADMIN" ? "/admin" : "/dashboard"} size="sm">
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="outline" size="sm">
                Log In
              </ButtonLink>
              <ButtonLink href="/apply" size="sm">
                Apply Now
              </ButtonLink>
            </>
          )}
        </div>

        <MobileMenu isAuthed={!!session} isAdmin={session?.role === "ADMIN"} />
      </div>
    </header>
  );
}
