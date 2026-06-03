"use client";

import clsx from "clsx";
import {
  getLaunchOutcomeLabel,
  getLaunchOutcomeTone,
  getLaunchTimingLabel,
  getLaunchTimingTone,
  LaunchStatusTone,
  type LaunchTone,
} from "@/lib/formatters";

const toneClasses: Record<LaunchTone, string> = {
  [LaunchStatusTone.Upcoming]:
    "border-[rgba(213,181,107,0.22)] bg-[rgba(213,181,107,0.08)] text-[var(--warning)]",
  [LaunchStatusTone.Past]:
    "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--info)]",
  [LaunchStatusTone.Pending]:
    "border-[rgba(163,163,173,0.22)] bg-[rgba(163,163,173,0.08)] text-[var(--muted)]",
  [LaunchStatusTone.Success]:
    "border-[rgba(143,207,157,0.22)] bg-[rgba(143,207,157,0.08)] text-[var(--success)]",
  [LaunchStatusTone.Failure]:
    "border-[rgba(222,143,132,0.22)] bg-[rgba(222,143,132,0.08)] text-[var(--danger)]",
};

export function LaunchStatusBadges({
  upcoming,
  success,
}: {
  upcoming: boolean;
  success: boolean | null;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <BadgePill
        label="Timing"
        value={getLaunchTimingLabel(upcoming)}
        tone={getLaunchTimingTone(upcoming)}
      />
      <BadgePill
        label="Outcome"
        value={getLaunchOutcomeLabel(upcoming, success)}
        tone={getLaunchOutcomeTone(upcoming, success)}
      />
    </div>
  );
}

export function StatusBadge({
  upcoming,
  success,
}: {
  upcoming: boolean;
  success: boolean | null;
}) {
  return <LaunchStatusBadges upcoming={upcoming} success={success} />;
}

function BadgePill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: LaunchTone;
}) {
  return (
    <div className="space-y-1">
      <p className="type-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <span
        className={clsx(
          "type-mono inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em]",
          toneClasses[tone],
        )}
      >
        {value}
      </span>
    </div>
  );
}
