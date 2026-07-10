"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RateLimitState({
  title = "Event feed temporarily unavailable",
  message,
}: {
  title?: string;
  message: string;
}) {
  const router = useRouter();

  return (
    <Card className="bg-card/96 text-center">
      <CardContent className="px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-xl space-y-4">
          <p className="text-sm font-medium text-[var(--warning)]">
            Rate limited
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          <p className="text-base leading-7 text-muted-foreground">{message}</p>
          <Button type="button" onClick={() => router.refresh()}>
            Refresh page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
