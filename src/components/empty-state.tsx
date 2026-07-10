"use client";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const actionContent = action ? <div className="pt-2">{action}</div> : null;

  return (
    <Card className="bg-card/96 text-center">
      <CardContent className="px-6 py-14 sm:px-10">
        <div className="mx-auto max-w-xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            No results
          </p>
          <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          <p className="text-base leading-7 text-muted-foreground">{description}</p>
          {actionContent}
        </div>
      </CardContent>
    </Card>
  );
}
