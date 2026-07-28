"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export function MobileMenu({
  isAuthed,
  isAdmin,
}: {
  isAuthed: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-slate-100 bg-white px-4 pb-6 pt-2 shadow-lg">
          <nav className="flex flex-col gap-1">
            <Link
              href="/#how-it-works"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </Link>
            <Link
              href="/#faq"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              FAQ
            </Link>
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Contact
            </Link>
            <div className="mt-3 flex flex-col gap-2">
              {isAuthed ? (
                <ButtonLink
                  href={isAdmin ? "/admin" : "/dashboard"}
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink
                    href="/login"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Log In
                  </ButtonLink>
                  <ButtonLink href="/apply" onClick={() => setOpen(false)}>
                    Apply Now
                  </ButtonLink>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
