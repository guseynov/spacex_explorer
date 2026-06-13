import type { ReactNode } from "react";

export function TrendChartCard({
  title,
  description,
  legend,
  children,
}: {
  title: string;
  description: string;
  legend: string;
  children: ReactNode;
}) {
  return (
    <section className="panel panel-strong flex flex-col gap-5 px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
          {legend}
        </p>
      </div>
      {children}
    </section>
  );
}
