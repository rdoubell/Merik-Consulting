import { cn } from "@/lib/cn";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

type Tone = "success" | "warning" | "info" | "danger";

const toneStyles: Record<Tone, { wrap: string; icon: React.ElementType }> = {
  success: {
    wrap: "bg-success-50 text-success-700 border-success-200",
    icon: CheckCircle2,
  },
  warning: {
    wrap: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertTriangle,
  },
  info: { wrap: "bg-brand-50 text-brand-700 border-brand-200", icon: Info },
  danger: { wrap: "bg-danger-50 text-danger-600 border-red-200", icon: XCircle },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { wrap, icon: Icon } = toneStyles[tone];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        wrap,
        className
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="mt-0.5">{children}</div>}
      </div>
    </div>
  );
}
