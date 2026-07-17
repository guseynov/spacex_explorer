"use client";

import { Compass } from "lucide-react";

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
    <div className="border border-dashed border-border bg-card/35 px-6 py-14 text-center sm:px-10">
        <div className="mx-auto max-w-lg space-y-4">
          <Compass aria-hidden="true" className="mx-auto size-6 text-primary" strokeWidth={1.6} />
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          <p className="text-base leading-7 text-muted-foreground">{description}</p>
          {actionContent}
        </div>
    </div>
  );
}
