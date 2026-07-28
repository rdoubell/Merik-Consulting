import "server-only";
import { prisma } from "@/lib/prisma";

export async function getOrCreateDraftApplication(userId: string) {
  const existing = await prisma.application.findFirst({
    where: { userId, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  return prisma.application.create({
    data: { userId, status: "DRAFT" },
  });
}
