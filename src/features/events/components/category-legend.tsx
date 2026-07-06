"use client";

import { CATEGORY_LEGEND_ITEMS, getEventCategoryColor } from "../event-map-utils";

export function CategoryLegend() {
  return (
    <div className="panel flex flex-wrap items-center gap-3 px-3 py-2">
      {CATEGORY_LEGEND_ITEMS.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 text-[0.68rem] text-[var(--info)]/80"
        >
          <span
            className="h-2.5 w-2.5 rounded-full shadow-[0_0_14px_currentColor]"
            style={{ color: getEventCategoryColor(item.id), backgroundColor: "currentColor" }}
          />
          <span className="type-mono uppercase tracking-[0.12em]">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
