"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/server/auth/password";
import { issueOtp, verifyOtp as verifyOtpCode } from "@/lib/server/auth/otp";
import {
  createSession,
  createPendingVerification,
  getPendingVerification,
  clearPendingVerification,
  destroySession,
} from "@/lib/server/auth/session";
import { signupSchema, loginSchema, otpSchema } from "@/lib/validation/auth";
import { redirect } from "next/navigation";

export type ActionResult = { error: string } | { error: null };

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MINUTES = 15;

export async function signupAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    popiaConsent: formData.get("popiaConsent") === "on",
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { phone: parsed.data.phone }] },
  });
  if (existing) {
    return { error: "An account with this email or phone already exists" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      popiaConsentAt: new Date(),
    },
  });

  await issueOtp({
    userId: user.id,
    channel: "EMAIL",
    purpose: "SIGNUP_VERIFICATION",
    toAddress: user.email,
  });
  await createPendingVerification(user.id, "SIGNUP_VERIFICATION");

  redirect("/verify-otp");
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) return { error: "Incorrect email or password" };

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Too many failed attempts. Please try again later." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedOut = attempts >= MAX_LOGIN_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: lockedOut
        ? {
            failedLoginAttempts: 0,
            lockedUntil: new Date(Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000),
          }
        : { failedLoginAttempts: attempts },
    });
    return {
      error: lockedOut
        ? "Too many failed attempts. Please try again later."
        : "Incorrect email or password",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  await issueOtp({
    userId: user.id,
    channel: "EMAIL",
    purpose: "LOGIN",
    toAddress: user.email,
  });
  await createPendingVerification(user.id, "LOGIN");

  redirect("/verify-otp");
}

export async function verifyOtpAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const pending = await getPendingVerification();
  if (!pending) {
    return { error: "Your verification session expired. Please start again." };
  }

  const parsed = otpSchema.safeParse({ code: String(formData.get("code") ?? "") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid code" };
  }

  const result = await verifyOtpCode({
    userId: pending.userId,
    purpose: pending.purpose,
    code: parsed.data.code,
  });

  if (!result.ok) return { error: result.reason };

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: pending.userId },
  });

  if (pending.purpose === "SIGNUP_VERIFICATION") {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  await createSession({ userId: user.id, role: user.role, email: user.email });
  await clearPendingVerification();

  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function resendOtpAction() {
  const pending = await getPendingVerification();
  if (!pending) return { error: "Your verification session expired." };

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: pending.userId },
  });

  await issueOtp({
    userId: user.id,
    channel: "EMAIL",
    purpose: pending.purpose,
    toAddress: user.email,
  });

  return { error: null };
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
