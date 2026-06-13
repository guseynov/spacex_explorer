import type { ReactNode } from "react";

export function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="panel px-6 py-6">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}
