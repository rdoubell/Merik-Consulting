import { cn } from "@/lib/cn";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-brand-50 text-brand-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-danger-50 text-danger-600",
};

const STATUS_TONE: Record<string, Tone> = {
  DRAFT: "neutral",
  SUBMITTED: "info",
  UNDER_REVIEW: "info",
  PENDING: "warning",
  APPROVED: "success",
  ACTIVE: "success",
  PAID: "success",
  DECLINED: "danger",
  OVERDUE: "danger",
  VERIFIED: "success",
  REJECTED: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        toneClasses[tone]
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
