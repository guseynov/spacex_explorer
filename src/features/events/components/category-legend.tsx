"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LEGEND_ITEMS, getEventCategoryColor } from "../event-map-utils";

export function CategoryLegend() {
  return (
    <Card className="bg-card/90">
      <CardContent className="flex flex-wrap items-center gap-3 px-3 py-2">
        {CATEGORY_LEGEND_ITEMS.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 text-[0.68rem] text-foreground/80"
          >
            <span
              className="h-2.5 w-2.5 rounded-full shadow-[0_0_14px_currentColor]"
              style={{ color: getEventCategoryColor(item.id), backgroundColor: "currentColor" }}
            />
            <span className="uppercase tracking-[0.12em] text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
