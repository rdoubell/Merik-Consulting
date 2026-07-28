import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { StepIndicator } from "@/components/ui/StepIndicator";

const STEPS = [
  "Personal",
  "Employment",
  "Banking",
  "Loan Details",
  "Verification",
  "Consent",
];

export function ApplyShell({
  currentStep,
  title,
  description,
  children,
}: {
  currentStep: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-700">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-xl tracking-tight">MERIK</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="mt-8">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-slate-500">{description}</p>}
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
