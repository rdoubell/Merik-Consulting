import { requireSession } from "@/lib/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { ApplyShell } from "@/components/apply/ApplyShell";
import { BankingForm } from "./BankingForm";
import { redirect } from "next/navigation";

export default async function BankingInfoPage({
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
      currentStep={3}
      title="Banking Information"
      description="Your loan will be disbursed to this account once approved."
    >
      <BankingForm applicationId={applicationId} application={application} />
    </ApplyShell>
  );
}
