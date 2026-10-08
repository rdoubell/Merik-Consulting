import { z } from "zod";

const zaPhoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;

export const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .regex(zaPhoneRegex, "Enter a valid South African mobile number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    popiaConsent: z.literal(true, {
      error: "You must accept the POPIA data processing consent",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
