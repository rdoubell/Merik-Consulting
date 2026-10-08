import { Card, CardBody } from "@/components/ui/Card";
import { NewCustomerForm } from "./NewCustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Add Client</h1>
        <p className="text-sm text-slate-500">
          Create a customer record manually (e.g. for a loan arranged outside the online application).
        </p>
      </div>

      <Card>
        <CardBody>
          <NewCustomerForm />
        </CardBody>
      </Card>
    </div>
  );
}
