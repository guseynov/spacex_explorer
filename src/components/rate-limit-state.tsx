"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock3 } from "lucide-react";

export function RateLimitState({
  title = "Event feed temporarily unavailable",
  message,
}: {
  title?: string;
  message: string;
}) {
  const router = useRouter();

  return (
    <div className="border border-[var(--warning)]/25 bg-[var(--warning)]/5 px-6 py-12 text-center sm:px-10">
        <div className="mx-auto max-w-xl space-y-4">
          <Clock3 aria-hidden="true" className="mx-auto size-6 text-[var(--warning)]" />
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          <p className="text-base leading-7 text-muted-foreground">{message}</p>
          <Button type="button" onClick={() => router.refresh()}>
            Refresh page
          </Button>
        </div>
    </div>
  );
}
