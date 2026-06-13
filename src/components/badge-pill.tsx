import clsx from "clsx";
import { LaunchStatusTone, type LaunchTone } from "@/lib/formatters";

const toneClasses: Record<LaunchTone, string> = {
  [LaunchStatusTone.Upcoming]:
    "bg-[rgba(240,187,84,0.1)] text-[var(--warning)] before:bg-[var(--warning)]",
  [LaunchStatusTone.Past]:
    "bg-[var(--surface-muted)] text-[var(--info)] before:bg-[var(--info)]",
  [LaunchStatusTone.Pending]:
    "bg-[rgba(156,167,181,0.1)] text-[var(--muted)] before:bg-[var(--muted)]",
  [LaunchStatusTone.Success]:
    "bg-[rgba(85,214,154,0.1)] text-[var(--success)] before:bg-[var(--success)]",
  [LaunchStatusTone.Failure]:
    "bg-[rgba(255,119,112,0.1)] text-[var(--danger)] before:bg-[var(--danger)]",
};

export function BadgePill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: LaunchTone;
}) {
  return (
    <div>
      <span
        className={clsx(
          "type-mono inline-flex items-center gap-1.5 rounded-[5px] px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.06em] before:h-1.5 before:w-1.5 before:rounded-full before:content-['']",
          toneClasses[tone],
        )}
      >
        <span className="sr-only">{label}: </span>
        {value}
      </span>
    </div>
  );
}
