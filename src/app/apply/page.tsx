import { requireSession } from "@/lib/server/auth/guard";
import { getOrCreateDraftApplication } from "@/lib/server/applications/draft";
import { redirect } from "next/navigation";

export default async function ApplyEntryPage() {
  const session = await requireSession();
  const application = await getOrCreateDraftApplication(session.userId);
  redirect(`/apply/personal?applicationId=${application.id}`);
}
