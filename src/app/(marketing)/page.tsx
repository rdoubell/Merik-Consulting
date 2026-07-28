import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  FileText,
  ShieldCheck,
  Zap,
  Clock,
  Lock,
  BadgeCheck,
  HeartHandshake,
  Wallet,
  ChevronDown,
} from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Apply Online",
    description:
      "Fill in a short digital application — personal, employment, and banking details take just a few minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Get Verified",
    description:
      "Upload your ID and supporting documents. We run a quick affordability and credit check to keep lending responsible.",
  },
  {
    icon: Wallet,
    title: "Receive Your Cash",
    description:
      "Once approved, your offer is disbursed straight to your bank account — no branch visits, no paperwork.",
  },
];

const reasons = [
  {
    icon: Zap,
    title: "Fast Decisions",
    description: "Apply in minutes and get an outcome without the wait.",
  },
  {
    icon: Lock,
    title: "Secure by Design",
    description:
      "Bank-grade encryption and secure document storage protect your information end to end.",
  },
  {
    icon: BadgeCheck,
    title: "Fully Transparent",
    description:
      "Every cost is disclosed clearly before you accept an offer — no hidden fees, ever.",
  },
  {
    icon: HeartHandshake,
    title: "Responsible Lending",
    description:
      "We only lend what you can comfortably afford to repay, assessed on your real circumstances.",
  },
];

const testimonials = [
  {
    name: "Thabo M.",
    location: "Johannesburg",
    quote:
      "I applied on my lunch break and had an answer before I got back to my desk. Simple and honest.",
  },
  {
    name: "Nomvula K.",
    location: "Durban",
    quote:
      "No confusing terms, no surprise fees. MERIK told me exactly what I'd repay before I accepted anything.",
  },
  {
    name: "Sipho D.",
    location: "Cape Town",
    quote:
      "The document upload from my phone camera made the whole process painless. Highly recommend.",
  },
];

const faqs = [
  {
    q: "How much can I borrow?",
    a: "MERIK offers short-term loans between R200 and R2,000, subject to an affordability assessment.",
  },
  {
    q: "How long do I have to repay?",
    a: "Loan terms are typically 7, 14, or 30 days. Your exact repayment date and amount are confirmed in your loan offer before you accept.",
  },
  {
    q: "When will I see the interest and fees?",
    a: "We only display final interest, fees, and your total repayment amount once your loan offer has been generated after affordability and risk checks — full transparency before you ever accept.",
  },
  {
    q: "What documents do I need?",
    a: "Your South African ID, a recent payslip (if employed), a recent bank statement, and proof of address. You can upload these from your phone.",
  },
  {
    q: "Is my information safe?",
    a: "Yes. We use SSL encryption, secure authentication, and encrypted document storage, and we handle your data in line with POPIA.",
  },
  {
    q: "Will this affect my credit record?",
    a: "As a responsible lender we perform affordability and credit checks as part of every application, in line with the National Credit Act.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Registered &amp; POPIA compliant
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Fast Cash When You Need It Most
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Apply online in minutes for loans between R200 and R2,000 with a
              simple digital application process.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/apply" size="lg">
                Apply Now
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="outline" size="lg">
                Learn More
              </ButtonLink>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand-600" /> Apply in ~5 minutes
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-brand-600" /> Bank-grade security
              </div>
            </div>
          </div>

          <Card className="lg:justify-self-end lg:w-full lg:max-w-md">
            <CardBody className="space-y-4">
              <p className="text-sm font-semibold text-slate-500">Loan calculator preview</p>
              <div>
                <p className="text-3xl font-extrabold text-slate-900">R1,000</p>
                <p className="text-sm text-slate-500">over 30 days</p>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 w-1/2 rounded-full bg-brand-600" />
              </div>
              <p className="text-xs text-slate-400">
                Final interest, fees, and your repayment schedule are calculated
                after a quick affordability check — shown to you before you accept
                any offer.
              </p>
              <ButtonLink href="/apply" className="w-full">
                Get My Rate
              </ButtonLink>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-slate-600">
            Three simple steps between you and the cash you need.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <Card key={step.title}>
              <CardBody>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <step.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-brand-600">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Why choose MERIK */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Why Choose MERIK
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason) => (
              <div key={reason.title} className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200/60">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <reason.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{reason.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible lending */}
      <section id="responsible-lending" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Responsible Lending
            </h2>
            <p className="mt-4 text-slate-600">
              We only ever lend what you can afford to repay. Every application
              goes through an affordability assessment and credit check before
              approval, in line with South Africa&apos;s National Credit Act.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "Full cost disclosure before you accept any loan offer",
                "Affordability checks on every application, every time",
                "No loan roll-overs that trap you in a debt cycle",
                "Clear, plain-language agreements — no fine print surprises",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-success-100 bg-success-50">
            <CardBody>
              <p className="text-sm font-semibold text-success-700">Our commitment</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                Transparent costs, every time.
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Interest, fees, and your total repayment amount are always shown
                in full before you accept an offer — so you know exactly what
                you&apos;re signing up for.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              What Our Customers Say
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardBody>
                  <p className="text-sm text-slate-600">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-slate-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-400">{t.location}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mt-10 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60">
          {faqs.map((faq) => (
            <details key={faq.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900">
                {faq.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-brand-600 px-6 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            It only takes a few minutes to apply. See how much you could
            borrow today.
          </p>
          <ButtonLink
            href="/apply"
            size="lg"
            className="mt-6 bg-white text-brand-700 hover:bg-brand-50"
          >
            Apply Now
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
