"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();
  const usesDropdownCaption = props.captionLayout?.startsWith("dropdown");

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-card/98 p-4 [--cell-size:2.6rem]", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex flex-col gap-4", defaultClassNames.months),
        month: cn("flex flex-col gap-4", defaultClassNames.month),
        month_caption: cn(
          "flex items-center gap-3 px-1 pt-1",
          defaultClassNames.month_caption,
        ),
        caption_label: cn(
          usesDropdownCaption
            ? "inline-flex h-11 min-w-[7.75rem] items-center justify-between gap-2 rounded-xl border border-input bg-background/82 px-4 py-2 text-base font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            : "text-sm font-semibold text-foreground",
          defaultClassNames.caption_label,
        ),
        nav: cn("ml-auto flex items-center gap-2", defaultClassNames.nav),
        button_previous: cn(
          "inline-flex size-9 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition-colors hover:border-primary/25 hover:bg-secondary hover:text-foreground",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          "inline-flex size-9 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition-colors hover:border-primary/25 hover:bg-secondary hover:text-foreground",
          defaultClassNames.button_next,
        ),
        chevron: cn("size-4 shrink-0 text-muted-foreground", defaultClassNames.chevron),
        dropdown_root: cn("relative inline-flex items-center", defaultClassNames.dropdown_root),
        dropdowns: cn("flex items-center gap-3", defaultClassNames.dropdowns),
        dropdown: cn(
          "absolute inset-0 cursor-pointer opacity-0",
          defaultClassNames.dropdown,
        ),
        months_dropdown: cn("min-w-[7.5rem]", defaultClassNames.months_dropdown),
        years_dropdown: cn("min-w-[5.5rem]", defaultClassNames.years_dropdown),
        month_grid: cn("mt-3 w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn(defaultClassNames.weekdays),
        weekday: cn(
          "h-10 w-[var(--cell-size)] px-0 text-[0.8rem] font-medium text-muted-foreground",
          defaultClassNames.weekday,
        ),
        weeks: cn(defaultClassNames.weeks),
        week: cn(defaultClassNames.week),
        day: cn(
          "h-[var(--cell-size)] w-[var(--cell-size)] p-0 text-center text-sm",
          defaultClassNames.day,
        ),
        day_button: cn(
          "size-[var(--cell-size)] rounded-xl p-0 text-[1.02rem] font-medium text-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
          defaultClassNames.day_button,
        ),
        today: cn(
          "rounded-xl bg-secondary text-foreground",
          defaultClassNames.today,
        ),
        selected: cn(
          "rounded-xl bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(68,144,245,0.28)] hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          defaultClassNames.selected,
        ),
        range_start: cn(
          "bg-primary text-primary-foreground rounded-l-md rounded-r-none",
          defaultClassNames.range_start,
        ),
        range_middle: cn(
          "rounded-none bg-accent text-accent-foreground",
          defaultClassNames.range_middle,
        ),
        range_end: cn(
          "bg-primary text-primary-foreground rounded-l-none rounded-r-md",
          defaultClassNames.range_end,
        ),
        outside: cn("text-muted-foreground opacity-45", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-35", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      {...props}
    />
  );
}

export { Calendar };
