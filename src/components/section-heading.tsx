"use client";

import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const eyebrowContent = eyebrow ? <Badge variant="outline">{eyebrow}</Badge> : null;
  const descriptionContent = description ? (
    <p className="max-w-3xl text-[0.96rem] leading-7 text-muted-foreground">
      {description}
    </p>
  ) : null;
  const actionContent = action ? <div>{action}</div> : null;

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {eyebrowContent}
        <h1 className="max-w-4xl text-balance text-[2.35rem] font-semibold leading-none tracking-[-0.025em] text-foreground sm:text-[3rem]">
          {title}
        </h1>
        {descriptionContent}
      </div>
      {actionContent}
    </div>
  );
}
