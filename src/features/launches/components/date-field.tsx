export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="type-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="control-input min-h-11 w-full px-3 text-[0.82rem]"
      />
    </label>
  );
}
