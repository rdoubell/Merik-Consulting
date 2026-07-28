import { requireSession } from "@/lib/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { ApplyShell } from "@/components/apply/ApplyShell";
import { ConsentForm } from "./ConsentForm";
import { redirect } from "next/navigation";

export default async function ConsentPage({
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
      currentStep={6}
      title="Consent"
      description="Review and accept the following before we submit your application."
    >
      <ConsentForm applicationId={applicationId} />
    </ApplyShell>
  );
}
