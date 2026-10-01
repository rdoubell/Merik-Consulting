import "server-only";
import { prisma } from "@/lib/prisma";
import { notifier } from "@/lib/server/notify/notifier";
import type { OtpChannel, OtpPurpose } from "@/generated/prisma";

const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function issueOtp(input: {
  userId: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
  toAddress: string;
}) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      userId: input.userId,
      channel: input.channel,
      purpose: input.purpose,
      code,
      expiresAt,
    },
  });

  await notifier.send({
    userId: input.userId,
    channel: input.channel === "EMAIL" ? "EMAIL" : "SMS",
    toAddress: input.toAddress,
    subject: "Your MERIK verification code",
    body: `Your MERIK verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
    meta: { purpose: input.purpose },
  });

  return { expiresAt };
}

export async function verifyOtp(input: {
  userId: string;
  purpose: OtpPurpose;
  code: string;
}) {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: input.userId,
      purpose: input.purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { ok: false as const, reason: "No code requested" };
  if (otp.expiresAt < new Date())
    return { ok: false as const, reason: "Code expired" };

  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
    return { ok: false as const, reason: "Too many incorrect attempts. Request a new code." };
  }

  if (otp.code !== input.code) {
    const attempts = otp.attempts + 1;
    const exhausted = attempts >= MAX_OTP_ATTEMPTS;
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: exhausted
        ? { attempts, consumedAt: new Date() }
        : { attempts },
    });
    return {
      ok: false as const,
      reason: exhausted ? "Too many incorrect attempts. Request a new code." : "Incorrect code",
    };
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true as const };
}
