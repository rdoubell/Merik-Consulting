import { requireSession } from "@/lib/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { ApplyShell } from "@/components/apply/ApplyShell";
import { LoanDetailsForm } from "./LoanDetailsForm";
import { redirect } from "next/navigation";

export default async function LoanDetailsPage({
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
      currentStep={4}
      title="Loan Details"
      description="Choose how much you'd like to borrow and over what term."
    >
      <LoanDetailsForm applicationId={applicationId} application={application} />
    </ApplyShell>
  );
}
