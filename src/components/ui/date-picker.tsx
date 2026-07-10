"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  ariaLabel: string;
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  ariaLabel,
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = React.useMemo(
    () => (value ? parseDateString(value) : undefined),
    [value],
  );
  const minDate = React.useMemo(() => (min ? parseDateString(min) : undefined), [min]);
  const maxDate = React.useMemo(() => (max ? parseDateString(max) : undefined), [max]);
  const disabled = React.useMemo(() => {
    const matchers: Matcher[] = [];

    if (minDate) {
      matchers.push({ before: minDate });
    }

    if (maxDate) {
      matchers.push({ after: maxDate });
    }

    return matchers;
  }, [maxDate, minDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={ariaLabel}
          className={cn(
            "h-10 w-full justify-between rounded-lg bg-background/70 px-3 font-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
            !selectedDate && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selectedDate ? format(selectedDate, "PPP") : placeholder}
          </span>
          <CalendarIcon className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto overflow-hidden p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate ?? minDate ?? new Date()}
          captionLayout="dropdown"
          navLayout="after"
          startMonth={minDate}
          endMonth={maxDate}
          disabled={disabled}
          onSelect={(date) => {
            if (!date) {
              return;
            }

            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function parseDateString(value: string) {
  return new Date(`${value}T12:00:00`);
}
