import "server-only";
import { prisma } from "@/lib/prisma";

export async function getUserApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId, status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    include: {
      loan: { include: { installments: { orderBy: { dueDate: "asc" } } } },
      documents: true,
    },
  });
}

export async function getUserApplicationDetail(userId: string, applicationId: string) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    include: {
      loan: { include: { installments: { orderBy: { dueDate: "asc" } } } },
      documents: true,
    },
  });
  return application;
}

/**
 * Loan pricing (interest/fee/total) is only surfaced to the customer once an
 * admin has approved the offer — before that the loan may exist internally
 * (PENDING) but its terms must not leak to the client.
 */
export function isOfferVisibleToCustomer(status: string) {
  return status === "APPROVED" || status === "ACTIVE" || status === "PAID" || status === "OVERDUE";
}
