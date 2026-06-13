import type { ReactNode } from "react";
import type { RowComponentProps } from "react-window";
import { LaunchCard } from "./launch-card";
import type { FavoriteLaunch } from "@/lib/api/schemas";

export type VirtualizedLaunchListRowProps = {
  launches: FavoriteLaunch[];
  actionRenderer?: (launch: FavoriteLaunch) => ReactNode;
  footer?: ReactNode;
};

export function VirtualizedLaunchRow({
  index,
  style,
  launches,
  actionRenderer,
  footer,
}: RowComponentProps<VirtualizedLaunchListRowProps>) {
  if (index === launches.length && footer) {
    return (
      <div
        style={{
          ...style,
          width: "100%",
          boxSizing: "border-box",
          borderBottom: index === launches.length - 1 ? "none" : "1px solid var(--border)",
        }}
      >
        {footer}
      </div>
    );
  }

  const launch = launches[index];

  return (
    <div
      style={{
        ...style,
        width: "100%",
        boxSizing: "border-box",
        borderBottom:
          index === launches.length - 1 ? "none" : "1px solid var(--border)",
      }}
    >
      <LaunchCard launch={launch} actionSlot={actionRenderer?.(launch)} />
    </div>
  );
}
