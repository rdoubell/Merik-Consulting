import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-extrabold text-brand-700">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-xl tracking-tight">MERIK</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Fast, affordable micro loans from R200 to R2,000, with responsible
              lending at the core of everything we do.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>
                <Link href="/#how-it-works" className="hover:text-brand-700">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#responsible-lending" className="hover:text-brand-700">
                  Responsible Lending
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-brand-700">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-brand-700">
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>
                <Link href="/legal/terms" className="hover:text-brand-700">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-brand-700">
                  Privacy Policy (POPIA)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> 0800 123 456
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> support@merik.co.za
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Johannesburg, South Africa
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-400">
          <p>
            MERIK is a registered credit provider committed to responsible
            lending in accordance with the National Credit Act (NCA) and the
            Protection of Personal Information Act (POPIA). All loans are
            subject to affordability assessment and credit checks.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} MERIK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
