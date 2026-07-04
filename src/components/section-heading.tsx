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
    <p className="app-kicker">
      {eyebrow}
    </p>
  ) : null;
  const descriptionContent = description ? (
    <p className="max-w-3xl text-[0.96rem] leading-7 text-[var(--info)]/70">
      {description}
    </p>
  ) : null;
  const actionContent = action ? <div>{action}</div> : null;

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {eyebrowContent}
        <h1 className="type-display max-w-4xl text-[2.3rem] font-semibold leading-none tracking-[0.01em] text-balance text-foreground sm:text-[3.2rem]">
          {title}
        </h1>
        {descriptionContent}
      </div>
      {actionContent}
    </div>
  );
}
