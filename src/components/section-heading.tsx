"use client";

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
  const eyebrowContent = eyebrow ? (
    <p className="type-mono text-[0.92rem] font-medium text-[var(--info)]">
      {eyebrow}
    </p>
  ) : null;
  const descriptionContent = description ? (
    <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
      {description}
    </p>
  ) : null;
  const actionContent = action ? <div>{action}</div> : null;

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {eyebrowContent}
        <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-balance text-foreground sm:text-[3rem]">
          {title}
        </h1>
        {descriptionContent}
      </div>
      {actionContent}
    </div>
  );
}
