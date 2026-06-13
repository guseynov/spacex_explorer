"use client";

import { LaunchStatusBadges } from "./launch-status-badges";

export function StatusBadge({
  net,
  statusId,
}: {
  net: string;
  statusId: number;
}) {
  return <LaunchStatusBadges net={net} statusId={statusId} />;
}
