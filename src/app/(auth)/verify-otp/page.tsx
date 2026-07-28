import { redirect } from "next/navigation";
import { getPendingVerification } from "@/lib/server/auth/session";
import { prisma } from "@/lib/prisma";
import { OtpForm } from "./OtpForm";

export const metadata = { title: "Verify Your Identity | MERIK" };

export default async function VerifyOtpPage() {
  const pending = await getPendingVerification();
  if (!pending) redirect("/login");

  let devCode: string | null = null;
  if (process.env.NODE_ENV !== "production") {
    const latest = await prisma.otpCode.findFirst({
      where: { userId: pending.userId, purpose: pending.purpose, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    devCode = latest?.code ?? null;
  }

  return <OtpForm devCode={devCode} />;
}
