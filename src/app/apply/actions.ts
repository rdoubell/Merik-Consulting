"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/server/auth/guard";
import { storage } from "@/lib/server/storage/storage";
import { evaluateApplication } from "@/lib/server/loans/offer";
import {
  personalInfoSchema,
  employmentInfoSchema,
  bankingInfoSchema,
  loanDetailsSchema,
  consentSchema,
} from "@/lib/validation/application";
import type { DocumentType } from "@/generated/prisma";
import { redirect } from "next/navigation";

export type ActionResult = { error: string } | { error: null };

async function ownedDraftOrThrow(applicationId: string, userId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!application || application.userId !== userId) {
    throw new Error("Application not found");
  }
  return application;
}

export async function savePersonalInfoAction(
  applicationId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  await ownedDraftOrThrow(applicationId, session.userId);

  const raw = Object.fromEntries(formData.entries());
  const parsed = personalInfoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { firstName, lastName, idNumber, dateOfBirth, gender, addressLine, province, city, postalCode } =
    parsed.data;

  const existingIdOwner = await prisma.profile.findUnique({ where: { idNumber } });
  if (existingIdOwner && existingIdOwner.userId !== session.userId) {
    return { error: "This ID number is already associated with another account" };
  }

  await prisma.profile.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      firstName,
      lastName,
      idNumber,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      addressLine,
      province,
      city,
      postalCode,
    },
    update: {
      firstName,
      lastName,
      idNumber,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      addressLine,
      province,
      city,
      postalCode,
    },
  });

  redirect(`/apply/employment?applicationId=${applicationId}`);
}

export async function saveEmploymentInfoAction(
  applicationId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  await ownedDraftOrThrow(applicationId, session.userId);

  const raw = Object.fromEntries(formData.entries());
  const parsed = employmentInfoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      employmentStatus: parsed.data.employmentStatus,
      employerName: parsed.data.employerName || null,
      occupation: parsed.data.occupation || null,
      monthlyIncome: parsed.data.monthlyIncome,
      salaryFrequency: parsed.data.salaryFrequency,
      payday: parsed.data.payday,
      employmentLength: parsed.data.employmentLength,
      businessName: parsed.data.businessName || null,
      monthlyRevenue: parsed.data.monthlyRevenue || null,
    },
  });

  redirect(`/apply/banking?applicationId=${applicationId}`);
}

export async function saveBankingInfoAction(
  applicationId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  await ownedDraftOrThrow(applicationId, session.userId);

  const raw = Object.fromEntries(formData.entries());
  const parsed = bankingInfoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { ...parsed.data },
  });

  redirect(`/apply/loan-details?applicationId=${applicationId}`);
}

export async function saveLoanDetailsAction(
  applicationId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  await ownedDraftOrThrow(applicationId, session.userId);

  const raw = Object.fromEntries(formData.entries());
  const parsed = loanDetailsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { loanAmount: parsed.data.loanAmount, loanTermDays: parsed.data.loanTermDays },
  });

  redirect(`/apply/verification?applicationId=${applicationId}`);
}

const DOCUMENT_FIELD_TO_TYPE: Record<string, DocumentType> = {
  idDocument: "ID_DOCUMENT",
  payslip: "PAYSLIP",
  bankStatement: "BANK_STATEMENT",
  proofOfAddress: "PROOF_OF_ADDRESS",
};

export async function uploadDocumentsAction(
  applicationId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  await ownedDraftOrThrow(applicationId, session.userId);

  for (const [field, type] of Object.entries(DOCUMENT_FIELD_TO_TYPE)) {
    const file = formData.get(field);
    if (!(file instanceof File) || file.size === 0) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { filePath } = await storage.save({
      buffer,
      applicationId,
      originalFileName: file.name,
    });

    await prisma.document.deleteMany({ where: { applicationId, type } });
    await prisma.document.create({
      data: {
        applicationId,
        type,
        filePath,
        originalFileName: file.name,
        mimeType: file.type || "application/octet-stream",
      },
    });
  }

  const hasId = await prisma.document.findFirst({
    where: { applicationId, type: "ID_DOCUMENT" },
  });
  if (!hasId) {
    return { error: "Please upload your South African ID to continue" };
  }

  redirect(`/apply/consent?applicationId=${applicationId}`);
}

export async function submitConsentAction(
  applicationId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  const application = await ownedDraftOrThrow(applicationId, session.userId);

  const raw = {
    consentTerms: formData.get("consentTerms") === "on",
    consentPrivacy: formData.get("consentPrivacy") === "on",
    consentPopia: formData.get("consentPopia") === "on",
    consentCreditCheck: formData.get("consentCreditCheck") === "on",
    consentContact: formData.get("consentContact") === "on",
    consentElectronicComms: formData.get("consentElectronicComms") === "on",
  };

  const parsed = consentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "You must accept all consents to continue" };
  }

  if (!application.loanAmount || !application.loanTermDays) {
    return { error: "Please complete the loan details step before submitting" };
  }

  const now = new Date();
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      consentTermsAt: now,
      consentPrivacyAt: now,
      consentPopiaAt: now,
      consentCreditCheckAt: now,
      consentContactAt: now,
      consentElectronicCommsAt: now,
      status: "SUBMITTED",
      submittedAt: now,
    },
  });

  await evaluateApplication(applicationId);

  redirect(`/dashboard?submitted=1`);
}
