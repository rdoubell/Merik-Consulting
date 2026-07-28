"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { activateInterestConfigAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

export function ActivateButton({ configId }: { configId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await activateInterestConfigAction(configId);
          router.refresh();
        })
      }
    >
      {isPending ? "Activating…" : "Make Active"}
    </Button>
  );
}
