import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { CreateConfigForm } from "./CreateConfigForm";
import { ActivateButton } from "./ActivateButton";
import { cn } from "@/lib/cn";

export default async function InterestConfigPage() {
  const configs = await prisma.interestConfig.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Interest &amp; Fees</h1>
        <p className="text-sm text-slate-500">
          Configure pricing used by the risk-based offer engine. Only the active
          configuration is used for new offers — these numbers are never sent
          to the customer client directly.
        </p>
      </div>

      <Card>
        <CardBody>
          <p className="font-semibold text-slate-900">Create New Configuration</p>
          <div className="mt-4">
            <CreateConfigForm />
          </div>
        </CardBody>
      </Card>

      <div className="space-y-3">
        {configs.map((c) => {
          const adj = JSON.parse(c.riskTierAdjustmentsPct) as Record<string, number>;
          const terms = JSON.parse(c.allowedTermDays) as number[];
          return (
            <Card key={c.id} className={cn(c.active && "border-success-300 ring-1 ring-success-200")}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {c.name}{" "}
                      {c.active && (
                        <span className="ml-2 rounded-full bg-success-100 px-2 py-0.5 text-xs font-semibold text-success-700">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      Created {new Date(c.createdAt).toLocaleString("en-ZA")}
                    </p>
                  </div>
                  {!c.active && <ActivateButton configId={c.id} />}
                </div>
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Range</p>
                    <p>R{c.minAmount} – R{c.maxAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Base Rate</p>
                    <p>{c.baseRatePct}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Risk Adj.</p>
                    <p>
                      L{adj.LOW ?? 0} / M{adj.MEDIUM ?? 0} / H{adj.HIGH ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Service Fee</p>
                    <p>R{c.serviceFeeFlat} + {c.serviceFeePct}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Max Loan Value</p>
                    <p>R{c.maxLoanValue}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Terms</p>
                    <p>{terms.join(", ")} days</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
        {configs.length === 0 && (
          <Card>
            <CardBody className="text-center text-slate-400">
              No interest configurations yet. Create one above to start
              generating loan offers.
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
