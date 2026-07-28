"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/auth/guard";
import { revalidatePath } from "next/cache";
import type { VerificationStatus, ApplicationStatus } from "@/generated/prisma";

async function logAction(
  actorId: string,
  action: string,
  applicationId?: string,
  meta?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      applicationId,
      action,
      meta: meta ? JSON.stringify(meta) : null,
    },
  });
}

export async function approveLoanAction(loanId: string) {
  const session = await requireAdmin();
  const loan = await prisma.loan.findUniqueOrThrow({ where: { id: loanId } });

  const dueDate = loan.dueDate ?? new Date(Date.now() + loan.termDays * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.loan.update({
      where: { id: loanId },
      data: {
        status: "APPROVED",
        approvedById: session.userId,
        approvedAt: new Date(),
        disbursedAt: new Date(),
        dueDate,
      },
    }),
    prisma.application.update({
      where: { id: loan.applicationId },
      data: { status: "APPROVED" },
    }),
    prisma.repaymentInstallment.deleteMany({ where: { loanId } }),
    prisma.repaymentInstallment.create({
      data: {
        loanId,
        dueDate,
        amountDue: loan.totalRepayable,
      },
    }),
  ]);

  await logAction(session.userId, "LOAN_APPROVED", loan.applicationId, { loanId });
  revalidatePath("/admin/loans");
  revalidatePath(`/admin/loans/${loanId}`);
}

export async function declineLoanAction(loanId: string) {
  const session = await requireAdmin();
  const loan = await prisma.loan.findUniqueOrThrow({ where: { id: loanId } });

  await prisma.$transaction([
    prisma.loan.update({ where: { id: loanId }, data: { status: "DECLINED" } }),
    prisma.application.update({
      where: { id: loan.applicationId },
      data: { status: "DECLINED" },
    }),
  ]);

  await logAction(session.userId, "LOAN_DECLINED", loan.applicationId, { loanId });
  revalidatePath("/admin/loans");
  revalidatePath(`/admin/loans/${loanId}`);
}

export async function markLoanPaidAction(loanId: string) {
  const session = await requireAdmin();
  const now = new Date();

  await prisma.$transaction([
    prisma.loan.update({ where: { id: loanId }, data: { status: "PAID", paidAt: now } }),
    prisma.repaymentInstallment.updateMany({
      where: { loanId },
      data: { status: "PAID", paidAt: now },
    }),
  ]);
  // amountPaid must match amountDue per installment; do it individually since
  // updateMany can't reference another column.
  const installments = await prisma.repaymentInstallment.findMany({ where: { loanId } });
  await Promise.all(
    installments.map((i) =>
      prisma.repaymentInstallment.update({
        where: { id: i.id },
        data: { amountPaid: i.amountDue },
      })
    )
  );

  await logAction(session.userId, "LOAN_MARKED_PAID", undefined, { loanId });
  revalidatePath("/admin/loans");
  revalidatePath(`/admin/loans/${loanId}`);
}

export async function markLoanOverdueAction(loanId: string) {
  const session = await requireAdmin();

  await prisma.$transaction([
    prisma.loan.update({ where: { id: loanId }, data: { status: "OVERDUE" } }),
    prisma.repaymentInstallment.updateMany({
      where: { loanId, status: "PENDING" },
      data: { status: "OVERDUE" },
    }),
  ]);

  await logAction(session.userId, "LOAN_MARKED_OVERDUE", undefined, { loanId });
  revalidatePath("/admin/loans");
  revalidatePath(`/admin/loans/${loanId}`);
}

export async function updateDocumentVerificationAction(
  documentId: string,
  status: VerificationStatus
) {
  const session = await requireAdmin();
  const doc = await prisma.document.update({
    where: { id: documentId },
    data: { verificationStatus: status },
  });

  await logAction(session.userId, "DOCUMENT_VERIFICATION_UPDATED", doc.applicationId, {
    documentId,
    status,
  });
  revalidatePath("/admin/customers");
}

export async function updateApplicationStatusAction(
  applicationId: string,
  status: ApplicationStatus
) {
  const session = await requireAdmin();
  await prisma.application.update({ where: { id: applicationId }, data: { status } });

  await logAction(session.userId, "APPLICATION_STATUS_UPDATED", applicationId, { status });
  revalidatePath("/admin/customers");
}

export async function createInterestConfigAction(
  _prev: { error: string } | { error: null },
  formData: FormData
) {
  const session = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const minAmount = Number(formData.get("minAmount"));
  const maxAmount = Number(formData.get("maxAmount"));
  const baseRatePct = Number(formData.get("baseRatePct"));
  const lowAdj = Number(formData.get("lowAdj") ?? 0);
  const mediumAdj = Number(formData.get("mediumAdj") ?? 0);
  const highAdj = Number(formData.get("highAdj") ?? 0);
  const serviceFeeFlat = Number(formData.get("serviceFeeFlat"));
  const serviceFeePct = Number(formData.get("serviceFeePct"));
  const maxLoanValue = Number(formData.get("maxLoanValue"));
  const allowedTermDays = String(formData.get("allowedTermDays") ?? "7,14,30")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
  const makeActive = formData.get("makeActive") === "on";

  if (!name || Number.isNaN(minAmount) || Number.isNaN(maxAmount) || Number.isNaN(baseRatePct)) {
    return { error: "Please fill in all required fields" };
  }

  await prisma.$transaction(async (tx) => {
    if (makeActive) {
      await tx.interestConfig.updateMany({ where: { active: true }, data: { active: false } });
    }
    await tx.interestConfig.create({
      data: {
        name,
        active: makeActive,
        minAmount,
        maxAmount,
        baseRatePct,
        riskTierAdjustmentsPct: JSON.stringify({ LOW: lowAdj, MEDIUM: mediumAdj, HIGH: highAdj }),
        serviceFeeFlat,
        serviceFeePct,
        maxLoanValue,
        allowedTermDays: JSON.stringify(allowedTermDays),
        createdById: session.userId,
      },
    });
  });

  revalidatePath("/admin/interest-config");
  return { error: null };
}

export async function activateInterestConfigAction(configId: string) {
  await requireAdmin();

  await prisma.$transaction([
    prisma.interestConfig.updateMany({ where: { active: true }, data: { active: false } }),
    prisma.interestConfig.update({ where: { id: configId }, data: { active: true } }),
  ]);

  revalidatePath("/admin/interest-config");
}
