import clsx from "clsx";
import {
  getLaunchOutcomeLabel,
  getLaunchOutcomeTone,
  LaunchStatusTone,
} from "@/lib/formatters";

const toneClasses = {
  [LaunchStatusTone.Upcoming]:
    "border-[rgba(251,191,36,0.24)] bg-[rgba(251,191,36,0.08)] text-[var(--warning)] before:bg-[var(--warning)]",
  [LaunchStatusTone.Past]:
    "border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[var(--info)] before:bg-[var(--info)]",
  [LaunchStatusTone.Pending]:
    "border-[rgba(197,208,232,0.12)] bg-[rgba(197,208,232,0.05)] text-[var(--muted)] before:bg-[var(--muted)]",
  [LaunchStatusTone.Success]:
    "border-[rgba(74,222,128,0.24)] bg-[rgba(74,222,128,0.08)] text-[var(--success)] before:bg-[var(--success)]",
  [LaunchStatusTone.Failure]:
    "border-[rgba(248,113,113,0.24)] bg-[rgba(248,113,113,0.08)] text-[var(--danger)] before:bg-[var(--danger)]",
} as const;

export function LaunchStatusBadges({
  net,
  statusId,
}: {
  net: string;
  statusId: number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {renderPill(
        "Status",
        getLaunchOutcomeLabel(net, statusId),
        getLaunchOutcomeTone(net, statusId),
      )}
    </div>
  );
}

function renderPill(label: string, value: string, tone: keyof typeof toneClasses) {
  return (
    <span
      className={clsx(
        "type-mono inline-flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.08em] before:h-1.5 before:w-1.5 before:rounded-full before:content-['']",
        toneClasses[tone],
      )}
    >
      <span className="sr-only">{label}: </span>
      {value}
    </span>
  );
}
