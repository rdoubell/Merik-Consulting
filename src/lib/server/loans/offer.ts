import "server-only";
import { prisma } from "@/lib/prisma";
import { creditBureau } from "@/lib/server/risk/score";
import { priceLoan, NoActiveConfigError, LoanAmountOutOfRangeError } from "@/lib/server/loans/pricing";
import { addDays } from "date-fns";

/**
 * Runs risk assessment for a freshly submitted application and, if it
 * passes, generates a priced loan offer. Everything here is server-only —
 * the customer only ever sees the resulting Application/Loan status, never
 * the scoring or pricing inputs, until an admin exposes an approved offer.
 */
export async function evaluateApplication(applicationId: string) {
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
  });

  const existingActiveLoans = await prisma.loan.count({
    where: {
      application: { userId: application.userId },
      status: { in: ["ACTIVE", "OVERDUE"] },
    },
  });

  const risk = creditBureau.score(application, existingActiveLoans);

  await prisma.riskAssessment.upsert({
    where: { applicationId },
    create: {
      applicationId,
      creditScoreStub: risk.creditScoreStub,
      internalRiskScore: risk.internalRiskScore,
      riskTier: risk.riskTier,
      affordabilityPass: risk.affordabilityPass,
      affordabilityNotes: risk.affordabilityNotes,
      fraudFlags: JSON.stringify(risk.fraudFlags),
    },
    update: {
      creditScoreStub: risk.creditScoreStub,
      internalRiskScore: risk.internalRiskScore,
      riskTier: risk.riskTier,
      affordabilityPass: risk.affordabilityPass,
      affordabilityNotes: risk.affordabilityNotes,
      fraudFlags: JSON.stringify(risk.fraudFlags),
      computedAt: new Date(),
    },
  });

  const passesAutoChecks =
    risk.affordabilityPass &&
    risk.fraudFlags.length === 0 &&
    risk.riskTier !== "HIGH";

  if (!passesAutoChecks || !application.loanAmount || !application.loanTermDays) {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "UNDER_REVIEW" },
    });
    return { status: "UNDER_REVIEW" as const, risk };
  }

  try {
    const offer = await priceLoan({
      principal: application.loanAmount,
      termDays: application.loanTermDays,
      riskTier: risk.riskTier,
    });

    await prisma.$transaction([
      prisma.loan.create({
        data: {
          applicationId,
          status: "PENDING",
          principal: offer.principal,
          interestRate: offer.interestRate,
          serviceFee: offer.serviceFee,
          totalRepayable: offer.totalRepayable,
          termDays: offer.termDays,
          interestConfigId: offer.interestConfigId,
          dueDate: addDays(new Date(), offer.termDays),
        },
      }),
      prisma.application.update({
        where: { id: applicationId },
        data: { status: "UNDER_REVIEW" },
      }),
    ]);

    return { status: "UNDER_REVIEW" as const, risk, offerGenerated: true };
  } catch (err) {
    if (err instanceof NoActiveConfigError || err instanceof LoanAmountOutOfRangeError) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "UNDER_REVIEW" },
      });
      return { status: "UNDER_REVIEW" as const, risk, offerGenerated: false };
    }
    throw err;
  }
}
