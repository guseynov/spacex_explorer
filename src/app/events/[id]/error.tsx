"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EventDetailError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[800px] justify-center px-4 py-10">
      <Card className="w-full bg-card/96 text-center">
        <CardContent className="px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-xl space-y-4">
            <p className="text-sm font-medium text-destructive">
              Event load failed
            </p>
            <p className="text-base leading-7 text-muted-foreground">
              The event details could not be loaded. Try the request again.
            </p>
            <Button type="button" onClick={reset}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
