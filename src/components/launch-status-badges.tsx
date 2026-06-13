import {
  getLaunchOutcomeLabel,
  getLaunchOutcomeTone,
  getLaunchTimingLabel,
  getLaunchTimingTone,
} from "@/lib/formatters";
import { BadgePill } from "./badge-pill";

export function LaunchStatusBadges({
  net,
  statusId,
}: {
  net: string;
  statusId: number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <BadgePill
        label="Timing"
        value={getLaunchTimingLabel(net)}
        tone={getLaunchTimingTone(net)}
      />
      <BadgePill
        label="Outcome"
        value={getLaunchOutcomeLabel(net, statusId)}
        tone={getLaunchOutcomeTone(net, statusId)}
      />
    </div>
  );
}
