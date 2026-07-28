# MERIK — Micro-Loan Platform

Fast, affordable short-term micro loans (R200–R2,000) for South African
borrowers. A full-stack Next.js app: marketing site, a 6-step loan
application, a customer dashboard, and an admin platform with risk scoring,
interest configuration, and reporting.

This build runs entirely locally — no cloud accounts required.

## Stack

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS**
- **SQLite + Prisma** for local dev (schema is Postgres-portable — see
  [Going to production](#going-to-production))
- **Custom auth**: bcrypt password hashing, JWT session cookies (`jose`), OTP
  codes generated server-side
- Documents stored on the local filesystem (`/uploads`), served only through
  an authenticated route

All risk scoring, interest/fee pricing, and approval logic live in
server-only modules under `src/lib/server/` and are never sent to the client.

## Getting started

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run db:seed          # creates an admin user + demo customers/loans
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seeded accounts

All seeded users share the password `Password123!`.

| Role     | Email                          | Notes                                   |
| -------- | ------------------------------- | ---------------------------------------- |
| Admin    | admin@merik.co.za              | Full admin dashboard access              |
| Customer | jane.customer@example.com      | Has a loan **pending** admin review      |
| Customer | sipho.customer@example.com     | Has an **approved/active** loan          |

### OTP in development

There's no SMS/email provider configured. Every OTP code is written to the
`Notification` table by the `DevNotifier` (`src/lib/server/notify/notifier.ts`)
and shown directly on the verification screen under a "Development mode"
banner, so login/signup work without any external service.

## Project structure

```
src/app/(marketing)/   Homepage, legal pages — public
src/app/(auth)/        Signup, login, OTP verification
src/app/apply/         6-step loan application wizard
src/app/dashboard/     Customer dashboard (auth required)
src/app/admin/         Admin dashboard (admin role required)
src/app/api/           Authenticated file/document/agreement routes
src/lib/server/        Server-only business logic (risk, pricing, auth, storage, notify)
src/lib/validation/    Zod schemas shared by client forms and server actions
src/components/        UI kit + layout components
prisma/schema.prisma   Data model
prisma/seed.ts         Demo data
```

## How pricing/risk works

1. On submission, `evaluateApplication()` (`src/lib/server/loans/offer.ts`)
   runs a placeholder rules-based risk scorer (`src/lib/server/risk/score.ts`)
   against the application.
2. If the applicant passes automatic checks, `priceLoan()`
   (`src/lib/server/loans/pricing.ts`) reads the currently **active**
   `InterestConfig` (set by an admin under Interest & Fees) and generates a
   priced loan offer — this creates a `Loan` row with status `PENDING`.
3. An admin reviews the risk assessment and documents, then approves or
   declines the loan from `/admin/loans/[id]`.
4. **Interest rate, service fee, and total repayable are only ever rendered
   to the customer once the loan status is `APPROVED` or later** — see
   `isOfferVisibleToCustomer()` in `src/lib/server/applications/queries.ts`.
   Before that, the customer dashboard only shows "Under Review."

## Swapping in real providers

Everything below is stubbed behind an interface so wiring in a real provider
is a matter of implementing that interface and swapping one export — no
callers need to change.

| Concern                  | Interface                                              | Swap point                                          |
| ------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| SMS / WhatsApp / Email    | `Notifier` in `src/lib/server/notify/notifier.ts`        | Implement against Twilio / a WhatsApp Business API / Resend, then change the `notifier` export |
| Credit bureau / fraud     | `CreditBureauProvider` in `src/lib/server/risk/score.ts`  | Implement against a real bureau (TransUnion, Experian, Compuscan), then change the `creditBureau` export |
| Document storage          | `StorageProvider` in `src/lib/server/storage/storage.ts`  | Implement against S3 / Supabase Storage, then change the `storage` export |
| Payments / repayments     | Not yet implemented — "Make a Repayment" is a disabled placeholder in the customer dashboard | Add a payment gateway integration and a route/action to record repayments against `RepaymentInstallment` |

## Going to production

- **Database**: switch `datasource db { provider = "sqlite" }` in
  `prisma/schema.prisma` to `"postgresql"` and point `DATABASE_URL` at a real
  Postgres instance (Supabase, RDS, etc). A few SQLite-specific choices will
  need small adjustments: Prisma enums map directly, but anywhere JSON is
  stored as a `String` column (e.g. `riskTierAdjustmentsPct`,
  `allowedTermDays`, `fraudFlags`) can move to Prisma's native `Json` type on
  Postgres.
- **Secrets**: set a strong, unique `SESSION_SECRET` and never commit `.env`.
- **File storage**: move off local disk (see table above) before deploying
  anywhere with an ephemeral filesystem.
- **Compliance**: the Terms, Privacy, and loan agreement text in this build
  are placeholders for demonstration — replace with attorney-reviewed copy
  before originating real loans.
