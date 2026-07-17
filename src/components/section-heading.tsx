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
    <p className="text-xs font-medium text-primary">{eyebrow}</p>
  ) : null;
  const descriptionContent = description ? (
    <p className="max-w-3xl text-[0.96rem] leading-7 text-muted-foreground">
      {description}
    </p>
  ) : null;
  const actionContent = action ? <div>{action}</div> : null;

  return (
    <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrowContent}
        <h1 className="max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-4xl">
          {title}
        </h1>
        {descriptionContent}
      </div>
      {actionContent}
    </div>
  );
}
