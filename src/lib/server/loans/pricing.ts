import "server-only";
import { prisma } from "@/lib/prisma";
import type { RiskTier } from "@/lib/server/risk/score";

export type LoanOffer = {
  interestConfigId: string;
  principal: number;
  interestRate: number; // % of principal, total for the term
  serviceFee: number;
  totalRepayable: number;
  termDays: number;
};

export class NoActiveConfigError extends Error {
  constructor() {
    super("No active interest configuration found");
  }
}

export class LoanAmountOutOfRangeError extends Error {
  constructor() {
    super("Requested loan amount is outside the configured range");
  }
}

/**
 * Computes a loan offer for the given amount/term/risk tier using the
 * currently active InterestConfig. This is the ONLY place pricing is
 * decided — never expose rate/fee math to client code, and never call this
 * on behalf of an unauthenticated or unapproved request.
 */
export async function priceLoan(input: {
  principal: number;
  termDays: number;
  riskTier: RiskTier;
}): Promise<LoanOffer> {
  const config = await prisma.interestConfig.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  if (!config) throw new NoActiveConfigError();

  if (input.principal < config.minAmount || input.principal > config.maxAmount) {
    throw new LoanAmountOutOfRangeError();
  }

  const riskAdjustments = JSON.parse(
    config.riskTierAdjustmentsPct
  ) as Record<RiskTier, number>;
  const adjustmentPct = riskAdjustments[input.riskTier] ?? 0;

  const interestRate = config.baseRatePct + adjustmentPct;
  const interestAmount = (input.principal * interestRate) / 100;
  const serviceFee =
    config.serviceFeeFlat + (input.principal * config.serviceFeePct) / 100;
  const totalRepayable = Math.round((input.principal + interestAmount + serviceFee) * 100) / 100;

  return {
    interestConfigId: config.id,
    principal: input.principal,
    interestRate,
    serviceFee: Math.round(serviceFee * 100) / 100,
    totalRepayable,
    termDays: input.termDays,
  };
}
