"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="bg-card/96 text-center">
      <CardContent className="px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-xl space-y-4">
          <p className="text-sm font-medium text-destructive">
            Request failed
          </p>
          <p className="text-base leading-7 text-muted-foreground">{message}</p>
          <Button id={buttonId} type="button" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
