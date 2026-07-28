import { requireSession } from "@/lib/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { ApplyShell } from "@/components/apply/ApplyShell";
import { PersonalForm } from "./PersonalForm";
import { redirect } from "next/navigation";

export default async function PersonalInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ applicationId?: string }>;
}) {
  const session = await requireSession();
  const { applicationId } = await searchParams;
  if (!applicationId) redirect("/apply");

  const [profile, user] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: session.userId } }),
  ]);

  return (
    <ApplyShell
      currentStep={1}
      title="Personal Information"
      description="Tell us a bit about yourself. This helps us verify your identity."
    >
      <PersonalForm applicationId={applicationId} profile={profile} user={user} />
    </ApplyShell>
  );
}
