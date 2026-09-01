"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/server/auth/guard";
import { storage } from "@/lib/server/storage/storage";
import { revalidatePath } from "next/cache";
import type { DocumentType } from "@/generated/prisma";

export type ActionResult = { error: string } | { error: null };

const DOCUMENT_FIELD_TO_TYPE: Record<string, DocumentType> = {
  idDocument: "ID_DOCUMENT",
  passport: "PASSPORT",
  workPermit: "WORK_PERMIT",
  payslip: "PAYSLIP",
  bankStatement: "BANK_STATEMENT",
  proofOfAddress: "PROOF_OF_ADDRESS",
};

export async function uploadAdditionalDocumentAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const latestApplication = await prisma.application.findFirst({
    where: { userId: session.userId, status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
  });
  if (!latestApplication) {
    return { error: "You need a submitted application before uploading documents" };
  }

  let uploaded = false;
  for (const [field, type] of Object.entries(DOCUMENT_FIELD_TO_TYPE)) {
    const file = formData.get(field);
    if (!(file instanceof File) || file.size === 0) continue;
    uploaded = true;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { filePath } = await storage.save({
      buffer,
      applicationId: latestApplication.id,
      originalFileName: file.name,
    });

    await prisma.document.create({
      data: {
        applicationId: latestApplication.id,
        type,
        filePath,
        originalFileName: file.name,
        mimeType: file.type || "application/octet-stream",
      },
    });
  }

  if (!uploaded) return { error: "Select at least one file to upload" };

  revalidatePath("/dashboard/documents");
  return { error: null };
}

export async function updateProfileAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const phone = String(formData.get("phone") ?? "").trim();
  const addressLine = String(formData.get("addressLine") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();

  if (!/^(\+27|0)[6-8][0-9]{8}$/.test(phone)) {
    return { error: "Enter a valid South African mobile number" };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { phone },
  });

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (profile) {
    await prisma.profile.update({
      where: { userId: session.userId },
      data: { addressLine, city, postalCode },
    });
  }

  revalidatePath("/dashboard/profile");
  return { error: null };
}
