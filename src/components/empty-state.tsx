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
    <div className="panel panel-strong px-6 py-14 text-center sm:px-10">
      <div className="mx-auto max-w-xl space-y-4">
        <p className="app-kicker text-[var(--muted)]">
          No results
        </p>
        <h2 className="type-display text-[2rem] font-semibold tracking-[0.01em] text-foreground">
          {title}
        </h2>
        <p className="text-base leading-7 text-[var(--info)]/68">{description}</p>
        {actionContent}
      </div>
    </div>
  );
}
