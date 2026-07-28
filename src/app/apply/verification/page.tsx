import { requireSession } from "@/lib/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { ApplyShell } from "@/components/apply/ApplyShell";
import { VerificationForm } from "./VerificationForm";
import { redirect } from "next/navigation";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ applicationId?: string }>;
}) {
  const session = await requireSession();
  const { applicationId } = await searchParams;
  if (!applicationId) redirect("/apply");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { documents: true },
  });
  if (!application || application.userId !== session.userId) redirect("/apply");

  return (
    <ApplyShell
      currentStep={5}
      title="Verification"
      description="Upload your documents. You can take a photo with your phone or choose a file."
    >
      <VerificationForm
        applicationId={applicationId}
        existingDocuments={application.documents}
        needsPayslip={application.employmentStatus === "EMPLOYED" || application.employmentStatus === "CONTRACT"}
      />
    </ApplyShell>
  );
}
