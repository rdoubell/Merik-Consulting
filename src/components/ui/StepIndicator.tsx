import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

export function StepIndicator({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="w-full">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const stepNumber = i + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          return (
            <li
              key={step}
              className={cn(
                "flex items-center",
                i !== steps.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isComplete && "bg-brand-600 text-white",
                    isCurrent && "bg-brand-600 text-white ring-4 ring-brand-100",
                    !isComplete && !isCurrent && "bg-slate-100 text-slate-400"
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isCurrent ? "text-brand-700" : "text-slate-400"
                  )}
                >
                  {step}
                </span>
              </div>
              {i !== steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded",
                    isComplete ? "bg-brand-600" : "bg-slate-100"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
