import { requireSession } from "@/lib/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await requireSession();
  const [user, profile] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.userId } }),
    prisma.profile.findUnique({ where: { userId: session.userId } }),
  ]);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Profile</h1>
      <ProfileForm user={user} profile={profile} />
    </div>
  );
}
