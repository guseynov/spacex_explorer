export function DetailLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-[var(--border)] pt-3">
      <p className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="text-sm leading-6 text-[var(--muted)]">{value}</p>
    </div>
  );
}
