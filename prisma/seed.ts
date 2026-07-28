import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  // --- Admin user ---------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@merik.co.za" },
    update: {},
    create: {
      email: "admin@merik.co.za",
      phone: "0800000001",
      passwordHash,
      role: "ADMIN",
      popiaConsentAt: new Date(),
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`Admin: admin@merik.co.za / Password123!`);

  // --- Active interest configuration --------------------------------------
  const existingActive = await prisma.interestConfig.findFirst({ where: { active: true } });
  if (!existingActive) {
    await prisma.interestConfig.create({
      data: {
        name: "Standard Pricing",
        active: true,
        minAmount: 200,
        maxAmount: 2000,
        baseRatePct: 15,
        riskTierAdjustmentsPct: JSON.stringify({ LOW: 0, MEDIUM: 8, HIGH: 18 }),
        serviceFeeFlat: 10,
        serviceFeePct: 2,
        maxLoanValue: 2000,
        allowedTermDays: JSON.stringify([7, 14, 30]),
        createdById: admin.id,
      },
    });
    console.log("Created active interest configuration");
  }

  // --- Demo customer #1: pending review (no loan decision yet) -----------
  const customer1 = await prisma.user.upsert({
    where: { email: "jane.customer@example.com" },
    update: {},
    create: {
      email: "jane.customer@example.com",
      phone: "0821112222",
      passwordHash,
      role: "CUSTOMER",
      popiaConsentAt: new Date(),
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Jane",
          lastName: "Ndlovu",
          idNumber: "9203015800082",
          dateOfBirth: new Date("1992-03-01"),
          gender: "Female",
          addressLine: "45 Main Road",
          province: "Gauteng",
          city: "Johannesburg",
          postalCode: "2000",
        },
      },
    },
  });

  const app1 = await prisma.application.upsert({
    where: { id: "seed-app-1" },
    update: {},
    create: {
      id: "seed-app-1",
      userId: customer1.id,
      status: "UNDER_REVIEW",
      employmentStatus: "EMPLOYED",
      employerName: "Shoprite Holdings",
      occupation: "Cashier",
      monthlyIncome: 7500,
      salaryFrequency: "MONTHLY",
      payday: "25th",
      employmentLength: "2",
      bankName: "Capitec",
      accountHolder: "Jane Ndlovu",
      accountNumber: "1122334455",
      branchCode: "470010",
      accountType: "SAVINGS",
      loanAmount: 800,
      loanTermDays: 14,
      consentTermsAt: new Date(),
      consentPrivacyAt: new Date(),
      consentPopiaAt: new Date(),
      consentCreditCheckAt: new Date(),
      consentContactAt: new Date(),
      consentElectronicCommsAt: new Date(),
      submittedAt: new Date(),
    },
  });

  await prisma.riskAssessment.upsert({
    where: { applicationId: app1.id },
    update: {},
    create: {
      applicationId: app1.id,
      creditScoreStub: 680,
      internalRiskScore: 22,
      riskTier: "LOW",
      affordabilityPass: true,
      affordabilityNotes: "Declared income comfortably supports the requested amount.",
      fraudFlags: JSON.stringify([]),
    },
  });

  await prisma.loan.upsert({
    where: { applicationId: app1.id },
    update: {},
    create: {
      applicationId: app1.id,
      status: "PENDING",
      principal: 800,
      interestRate: 15,
      serviceFee: 26,
      totalRepayable: 946,
      termDays: 14,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("Seeded customer #1 (jane.customer@example.com) with a PENDING loan awaiting review");

  // --- Demo customer #2: approved + active loan with a repayment schedule
  const customer2 = await prisma.user.upsert({
    where: { email: "sipho.customer@example.com" },
    update: {},
    create: {
      email: "sipho.customer@example.com",
      phone: "0833334444",
      passwordHash,
      role: "CUSTOMER",
      popiaConsentAt: new Date(),
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Sipho",
          lastName: "Dlamini",
          idNumber: "8807126800088",
          dateOfBirth: new Date("1988-07-12"),
          gender: "Male",
          addressLine: "12 Beach Road",
          province: "Western Cape",
          city: "Cape Town",
          postalCode: "8001",
        },
      },
    },
  });

  const app2 = await prisma.application.upsert({
    where: { id: "seed-app-2" },
    update: {},
    create: {
      id: "seed-app-2",
      userId: customer2.id,
      status: "APPROVED",
      employmentStatus: "EMPLOYED",
      employerName: "City of Cape Town",
      occupation: "Administrator",
      monthlyIncome: 12000,
      salaryFrequency: "MONTHLY",
      payday: "25th",
      employmentLength: "5",
      bankName: "FNB",
      accountHolder: "Sipho Dlamini",
      accountNumber: "6677889900",
      branchCode: "250655",
      accountType: "CHEQUE",
      loanAmount: 1500,
      loanTermDays: 30,
      consentTermsAt: new Date(),
      consentPrivacyAt: new Date(),
      consentPopiaAt: new Date(),
      consentCreditCheckAt: new Date(),
      consentContactAt: new Date(),
      consentElectronicCommsAt: new Date(),
      submittedAt: new Date(),
    },
  });

  await prisma.riskAssessment.upsert({
    where: { applicationId: app2.id },
    update: {},
    create: {
      applicationId: app2.id,
      creditScoreStub: 710,
      internalRiskScore: 15,
      riskTier: "LOW",
      affordabilityPass: true,
      affordabilityNotes: "Strong affordability profile.",
      fraudFlags: JSON.stringify([]),
    },
  });

  const dueDate2 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const loan2 = await prisma.loan.upsert({
    where: { applicationId: app2.id },
    update: {},
    create: {
      applicationId: app2.id,
      status: "APPROVED",
      principal: 1500,
      interestRate: 15,
      serviceFee: 40,
      totalRepayable: 1765,
      termDays: 30,
      approvedById: admin.id,
      approvedAt: new Date(),
      disbursedAt: new Date(),
      dueDate: dueDate2,
    },
  });

  const existingInstallment = await prisma.repaymentInstallment.findFirst({
    where: { loanId: loan2.id },
  });
  if (!existingInstallment) {
    await prisma.repaymentInstallment.create({
      data: { loanId: loan2.id, dueDate: dueDate2, amountDue: 1765 },
    });
  }
  console.log("Seeded customer #2 (sipho.customer@example.com) with an APPROVED active loan");

  console.log("\nSeed complete. Demo password for all seeded users: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
