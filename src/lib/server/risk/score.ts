import "server-only";
import type { Application } from "@/generated/prisma";

export type RiskTier = "LOW" | "MEDIUM" | "HIGH";

export type RiskResult = {
  creditScoreStub: number;
  internalRiskScore: number; // 0 (safest) - 100 (riskiest)
  riskTier: RiskTier;
  affordabilityPass: boolean;
  affordabilityNotes: string;
  fraudFlags: string[];
};

/**
 * Pluggable credit bureau interface. `RulesBasedScorer` below is a
 * placeholder that only looks at data already captured on the application —
 * it is NOT a real credit check. Swap this for a real implementation (e.g.
 * TransUnion, Experian, Compuscan) by implementing this interface and
 * changing the export at the bottom of the file.
 */
export interface CreditBureauProvider {
  score(application: Application, existingActiveLoans: number): RiskResult;
}

function seededVariance(idNumber: string | undefined, spread: number) {
  if (!idNumber) return 0;
  let hash = 0;
  for (let i = 0; i < idNumber.length; i++) {
    hash = (hash * 31 + idNumber.charCodeAt(i)) >>> 0;
  }
  return (hash % (spread * 2)) - spread;
}

class RulesBasedScorer implements CreditBureauProvider {
  score(application: Application, existingActiveLoans: number): RiskResult {
    const fraudFlags: string[] = [];
    const income = application.monthlyIncome ?? 0;
    const loanAmount = application.loanAmount ?? 0;

    // --- Credit score stub: deterministic pseudo-score, not a real bureau pull.
    let creditScoreStub = 620;
    if (application.employmentStatus === "EMPLOYED") creditScoreStub += 60;
    if (application.employmentStatus === "SELF_EMPLOYED") creditScoreStub += 20;
    if (application.employmentStatus === "UNEMPLOYED") creditScoreStub -= 120;
    if (application.employmentLength) {
      const years = parseFloat(application.employmentLength);
      if (!Number.isNaN(years)) creditScoreStub += Math.min(years * 8, 80);
    }
    creditScoreStub = Math.max(
      300,
      Math.min(850, Math.round(creditScoreStub))
    );

    // --- Affordability: rough disposable-income check.
    const estimatedInstallmentRatio = 0.35; // assume worst case single repayment
    const requiredMonthlyBuffer = loanAmount / estimatedInstallmentRatio;
    const affordabilityPass = income > 0 && income >= requiredMonthlyBuffer * 0.4;
    const affordabilityNotes = affordabilityPass
      ? "Declared income supports the requested loan amount within internal thresholds."
      : "Declared income is low relative to the requested loan amount.";

    // --- Internal risk score (0 safest - 100 riskiest).
    let risk = 40;
    if (application.employmentStatus === "EMPLOYED") risk -= 15;
    if (application.employmentStatus === "SELF_EMPLOYED") risk -= 5;
    if (application.employmentStatus === "UNEMPLOYED") risk += 30;
    if (application.employmentStatus === "CONTRACT") risk += 5;

    const incomeToLoanRatio = income > 0 ? loanAmount / income : 1;
    if (incomeToLoanRatio > 0.5) risk += 20;
    else if (incomeToLoanRatio > 0.3) risk += 10;
    else risk -= 5;

    risk += existingActiveLoans * 12;

    if (!affordabilityPass) risk += 15;

    risk += seededVariance(application.userId, 6);
    risk = Math.max(0, Math.min(100, Math.round(risk)));

    const riskTier: RiskTier = risk < 30 ? "LOW" : risk < 60 ? "MEDIUM" : "HIGH";

    // --- Simple fraud heuristics (placeholder, not a real fraud engine).
    if (income > 0 && loanAmount > income * 2) {
      fraudFlags.push("Requested amount is disproportionate to declared income");
    }
    if (
      application.employmentStatus === "EMPLOYED" &&
      !application.employerName
    ) {
      fraudFlags.push("Employed status declared without an employer name");
    }
    if (
      application.employmentStatus === "SELF_EMPLOYED" &&
      !application.businessName
    ) {
      fraudFlags.push("Self-employed status declared without a business name");
    }
    if (existingActiveLoans >= 3) {
      fraudFlags.push("Applicant has multiple concurrent active loans");
    }

    return {
      creditScoreStub,
      internalRiskScore: risk,
      riskTier,
      affordabilityPass,
      affordabilityNotes,
      fraudFlags,
    };
  }
}

export const creditBureau: CreditBureauProvider = new RulesBasedScorer();
