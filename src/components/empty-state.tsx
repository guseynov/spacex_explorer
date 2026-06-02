"use client";

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
    <div className="panel px-6 py-12 text-center sm:px-10">
      <div className="mx-auto max-w-xl space-y-4">
        <p className="text-sm font-medium text-[var(--info)]">
          No results
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        <p className="text-base leading-7 text-[var(--muted)]">{description}</p>
        {actionContent}
      </div>
    </div>
  );
}
