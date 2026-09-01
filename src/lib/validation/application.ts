import { z } from "zod";

const saIdRegex = /^\d{13}$/;
const postalCodeRegex = /^\d{4}$/;

export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export const ID_TYPES = ["SA_ID", "PASSPORT"] as const;

export const PERMIT_TYPES = [
  "General Work Visa",
  "Critical Skills Work Visa",
  "Intra-Company Transfer Visa",
  "Permanent Residence Permit",
  "Asylum Seeker Permit",
  "Refugee Status Permit",
  "Other",
] as const;

export const personalInfoSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    idType: z.enum(ID_TYPES),
    idNumber: z.string().min(1, "ID/passport number is required"),
    permitType: z.string().optional(),
    permitNumber: z.string().optional(),
    permitExpiryDate: z.string().optional(),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]),
    mobileNumber: z
      .string()
      .regex(/^(\+27|0)[6-8][0-9]{8}$/, "Enter a valid South African mobile number"),
    email: z.string().email("Enter a valid email address"),
    addressLine: z.string().min(1, "Residential address is required"),
    province: z.enum(PROVINCES),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().regex(postalCodeRegex, "Enter a valid 4-digit postal code"),
  })
  .refine((data) => data.idType !== "SA_ID" || saIdRegex.test(data.idNumber), {
    message: "Enter a valid 13-digit South African ID number",
    path: ["idNumber"],
  })
  .refine((data) => data.idType !== "PASSPORT" || !!data.permitType, {
    message: "Select the type of permit or visa held",
    path: ["permitType"],
  })
  .refine((data) => data.idType !== "PASSPORT" || !!data.permitNumber, {
    message: "Permit/visa number is required",
    path: ["permitNumber"],
  })
  .refine((data) => data.idType !== "PASSPORT" || !!data.permitExpiryDate, {
    message: "Permit/visa expiry date is required",
    path: ["permitExpiryDate"],
  });
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

export const EMPLOYMENT_STATUSES = [
  "EMPLOYED",
  "SELF_EMPLOYED",
  "CONTRACT",
  "UNEMPLOYED",
  "RETIRED",
] as const;
export const SALARY_FREQUENCIES = ["WEEKLY", "BI_WEEKLY", "MONTHLY"] as const;

export const employmentInfoSchema = z
  .object({
    employmentStatus: z.enum(EMPLOYMENT_STATUSES),
    employerName: z.string().optional(),
    occupation: z.string().optional(),
    monthlyIncome: z.coerce.number().positive("Enter your monthly income"),
    salaryFrequency: z.enum(SALARY_FREQUENCIES),
    payday: z.string().min(1, "Payday is required"),
    employmentLength: z.string().min(1, "Employment length is required"),
    businessName: z.string().optional(),
    monthlyRevenue: z.coerce.number().optional(),
  })
  .refine(
    (data) => data.employmentStatus !== "EMPLOYED" || !!data.employerName,
    { message: "Employer name is required", path: ["employerName"] }
  )
  .refine(
    (data) => data.employmentStatus !== "SELF_EMPLOYED" || !!data.businessName,
    { message: "Business name is required", path: ["businessName"] }
  )
  .refine(
    (data) =>
      data.employmentStatus !== "SELF_EMPLOYED" ||
      (data.monthlyRevenue !== undefined && data.monthlyRevenue > 0),
    { message: "Monthly revenue is required", path: ["monthlyRevenue"] }
  );
export type EmploymentInfoInput = z.infer<typeof employmentInfoSchema>;

export const bankingInfoSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountHolder: z.string().min(1, "Account holder is required"),
  accountNumber: z.string().min(5, "Enter a valid account number"),
  branchCode: z.string().min(3, "Enter a valid branch code"),
  accountType: z.enum(["CHEQUE", "SAVINGS"]),
});
export type BankingInfoInput = z.infer<typeof bankingInfoSchema>;

export const LOAN_TERMS = [7, 14, 30] as const;

export const loanDetailsSchema = z.object({
  loanAmount: z.coerce
    .number()
    .min(200, "Minimum loan amount is R200")
    .max(2000, "Maximum loan amount is R2,000"),
  loanTermDays: z.coerce.number().refine((v) => (LOAN_TERMS as readonly number[]).includes(v), {
    message: "Choose a valid loan term",
  }),
});
export type LoanDetailsInput = z.infer<typeof loanDetailsSchema>;

export const consentSchema = z.object({
  consentTerms: z.literal(true, { error: "You must accept the Terms and Conditions" }),
  consentPrivacy: z.literal(true, { error: "You must accept the Privacy Policy" }),
  consentPopia: z.literal(true, { error: "You must consent to POPIA data processing" }),
  consentCreditCheck: z.literal(true, {
    error: "You must consent to credit and affordability checks",
  }),
  consentContact: z.literal(true, { error: "You must give us permission to contact you" }),
  consentElectronicComms: z.literal(true, {
    error: "You must consent to electronic communications",
  }),
});
export type ConsentInput = z.infer<typeof consentSchema>;
