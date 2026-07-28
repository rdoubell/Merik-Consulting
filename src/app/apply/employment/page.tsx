import { requireSession } from "@/lib/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { ApplyShell } from "@/components/apply/ApplyShell";
import { EmploymentForm } from "./EmploymentForm";
import { redirect } from "next/navigation";

export default async function EmploymentInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ applicationId?: string }>;
}) {
  const session = await requireSession();
  const { applicationId } = await searchParams;
  if (!applicationId) redirect("/apply");

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application || application.userId !== session.userId) redirect("/apply");

  return (
    <ApplyShell
      currentStep={2}
      title="Employment Information"
      description="This helps us assess what you can comfortably afford to repay."
    >
      <EmploymentForm applicationId={applicationId} application={application} />
    </ApplyShell>
  );
}
