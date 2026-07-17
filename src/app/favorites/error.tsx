"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="bg-card/96 text-center">
      <CardContent className="px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-xl space-y-4">
          <p className="text-sm font-medium text-destructive">
            Favorites failed to load
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            Your saved events are temporarily unavailable.
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            {error.message || "Try loading the favorites page again."}
          </p>
          <Button type="button" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
