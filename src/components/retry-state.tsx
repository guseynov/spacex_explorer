"use client";

import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

export function RetryState({
  message,
  onRetry,
  buttonId,
}: {
  message: string;
  onRetry: () => void;
  buttonId?: string;
}) {
  return (
    <div className="border border-destructive/25 bg-destructive/5 px-6 py-12 text-center sm:px-10">
        <div className="mx-auto max-w-xl space-y-4">
          <TriangleAlert aria-hidden="true" className="mx-auto size-6 text-destructive" />
          <p className="text-sm font-medium text-destructive">We could not load this view</p>
          <p className="text-base leading-7 text-muted-foreground">{message}</p>
          <Button id={buttonId} type="button" onClick={onRetry}>
            Try again
          </Button>
        </div>
    </div>
  );
}
