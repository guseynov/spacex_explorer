"use client";

import { addDays, differenceInCalendarDays, format } from "date-fns";
import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { formatEventRangeLabel } from "@/lib/formatters";
import { normalizeEventDateRange } from "@/lib/api/event-query-builder";

type TimelineRangeSliderProps = {
  domain: {
    from: string;
    to: string;
  };
  value: {
    from: string;
    to: string;
  };
  eventCount: number;
  isPending?: boolean;
  onChange: (range: { from: string; to: string }) => void;
};

export function TimelineRangeSlider({
  domain,
  value,
  eventCount,
  isPending = false,
  onChange,
}: TimelineRangeSliderProps) {
  const [localRange, setLocalRange] = useState(value);
  const [datesExpanded, setDatesExpanded] = useState(false);
  const [activeHandle, setActiveHandle] = useState<"start" | "end" | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<"start" | "end" | null>(null);
  const localRangeRef = useRef(value);
  const totalDays = Math.max(
    1,
    differenceInCalendarDays(new Date(domain.to), new Date(domain.from)),
  );
  const startIndex = toIndex(localRange.from, domain.from, totalDays);
  const endIndex = toIndex(localRange.to, domain.from, totalDays);
  const viewport = getTimelineViewport(domain, value);
  const viewportDays = Math.max(
    1,
    differenceInCalendarDays(new Date(viewport.to), new Date(viewport.from)),
  );
  const viewportStartIndex = toIndex(localRange.from, viewport.from, viewportDays);
  const viewportEndIndex = toIndex(localRange.to, viewport.from, viewportDays);
  const overlapThreshold = Math.max(2, Math.round(viewportDays * 0.008));
  const handlesOverlap = viewportEndIndex - viewportStartIndex <= overlapThreshold;
  const startHandleTop = handlesOverlap ? 7 : 19;
  const endHandleTop = handlesOverlap ? 27 : 19;
  const rangeCollapsed = startIndex === endIndex;

  const syncLocalRange = (range: { from: string; to: string }) => {
    const normalizedRange = normalizeEventDateRange(range.from, range.to);

    localRangeRef.current = normalizedRange;
    setLocalRange(normalizedRange);

    return normalizedRange;
  };

  const ticks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const dayOffset = Math.round(viewportDays * ratio);
      const tickDate = toDateFromIndex(
        viewport.from,
        Math.min(dayOffset, viewportDays),
      );

      return {
        label: formatTimelineTick(tickDate, viewportDays),
        offset: ratio * 100,
      };
    });
  }, [viewport.from, viewportDays]);

  const presets = [
    { label: "7D", days: 7 },
    { label: "30D", days: 30 },
    { label: "90D", days: 90 },
    { label: "1Y", days: 365 },
    { label: "All", days: totalDays },
  ] as const;

  const applyRangeUpdate = (range: { from: string; to: string }) => {
    syncLocalRange(range);
  };

  const commitRangeUpdate = () => {
    const normalizedRange = normalizeEventDateRange(
      localRangeRef.current.from,
      localRangeRef.current.to,
    );

    localRangeRef.current = normalizedRange;
    setLocalRange(normalizedRange);
    setActiveHandle(null);
    dragHandleRef.current = null;

    if (normalizedRange.from === value.from && normalizedRange.to === value.to) {
      return;
    }

    onChange(normalizedRange);
  };

  const commitExplicitRange = (range: { from: string; to: string }) => {
    const normalizedRange = syncLocalRange(range);

    setActiveHandle(null);
    dragHandleRef.current = null;

    if (normalizedRange.from === value.from && normalizedRange.to === value.to) {
      return;
    }

    onChange(normalizedRange);
  };

  const updateHandleFromClientX = (handle: "start" | "end", clientX: number) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const nextIndex = toIndexFromClientX(
      clientX,
      slider.getBoundingClientRect(),
      viewportDays,
    );

    if (handle === "start") {
      applyRangeUpdate({
        from: toDateFromIndex(
          viewport.from,
          Math.min(nextIndex, viewportEndIndex),
        ),
        to: localRangeRef.current.to,
      });

      return;
    }

    applyRangeUpdate({
      from: localRangeRef.current.from,
      to: toDateFromIndex(
        viewport.from,
        Math.max(nextIndex, viewportStartIndex),
      ),
    });
  };

  const handlePointerDown = (
    handle: "start" | "end",
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragHandleRef.current = handle;
    setActiveHandle(handle);
    updateHandleFromClientX(handle, event.clientX);
  };

  const handlePointerMove = (
    handle: "start" | "end",
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (dragHandleRef.current !== handle) {
      return;
    }

    updateHandleFromClientX(handle, event.clientX);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    commitRangeUpdate();
  };

  const handleKeyDown = (
    handle: "start" | "end",
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    const currentIndex = handle === "start" ? startIndex : endIndex;
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        nextIndex -= 1;
        break;
      case "ArrowRight":
      case "ArrowUp":
        nextIndex += 1;
        break;
      case "PageDown":
        nextIndex -= 7;
        break;
      case "PageUp":
        nextIndex += 7;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = totalDays;
        break;
      default:
        return;
    }

    event.preventDefault();

    if (handle === "start") {
      commitExplicitRange({
        from: toDateFromIndex(domain.from, clampNumber(nextIndex, 0, endIndex)),
        to: localRange.to,
      });

      return;
    }

    commitExplicitRange({
      from: localRange.from,
      to: toDateFromIndex(domain.from, clampNumber(nextIndex, startIndex, totalDays)),
    });
  };

  const isPresetActive = (days: number) => {
    const presetFrom = toDateFromIndex(
      domain.from,
      Math.max(totalDays - days, 0),
    );

    return localRange.from === presetFrom && localRange.to === domain.to;
  };

  return (
    <section
      aria-label="Event timeline"
      data-map-overlay="timeline"
      className="rounded-xl border border-border bg-[var(--panel-strong)] px-3 py-3 shadow-lg md:px-4"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5 text-sm text-foreground">
          <CalendarDays className="size-4 shrink-0 text-[var(--brand)]" />
          <span className="truncate tabular-nums font-medium">
            {formatEventRangeLabel(localRange.from, localRange.to)}
          </span>
          <Badge className="hidden px-2 py-1 sm:inline-flex">
            {eventCount.toLocaleString()} events
          </Badge>
          {isPending ? <span className="text-xs text-muted-foreground">Updating</span> : null}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="flex overflow-hidden rounded-md border border-border">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                aria-pressed={isPresetActive(preset.days)}
                onClick={() =>
                  commitExplicitRange({
                    from: toDateFromIndex(domain.from, Math.max(totalDays - preset.days, 0)),
                    to: domain.to,
                  })
                }
                className="h-9 min-w-10 border-r border-border px-2 text-xs font-semibold text-muted-foreground transition-colors last:border-r-0 hover:bg-secondary hover:text-foreground aria-pressed:bg-[var(--brand)] aria-pressed:text-primary-foreground"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={datesExpanded}
            onClick={() => setDatesExpanded((current) => !current)}
            className="hidden sm:inline-flex"
          >
            {datesExpanded ? "Hide dates" : "Expand dates"}
            <ChevronDown className={datesExpanded ? "size-4 rotate-180" : "size-4"} />
          </Button>
        </div>
      </div>

      {datesExpanded ? (
        <div className="mt-3 grid gap-3 border-t border-border pt-3 md:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Start date
            </span>
            <DatePicker
              ariaLabel="Start date"
              value={localRange.from}
              min={domain.from}
              max={localRange.to}
              onChange={(nextValue) => {
                const nextRange = normalizeEventDateRange(
                  nextValue,
                  localRange.to,
                );
                commitExplicitRange(nextRange);
              }}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              End date
            </span>
            <DatePicker
              ariaLabel="End date"
              value={localRange.to}
              min={localRange.from}
              max={domain.to}
              onChange={(nextValue) => {
                const nextRange = normalizeEventDateRange(
                  localRange.from,
                  nextValue,
                );
                commitExplicitRange(nextRange);
              }}
            />
          </label>
        </div>
      ) : null}

      <div ref={sliderRef} className="relative mt-2 pt-3">
          <div className="absolute inset-x-0 top-[19px] h-1 rounded-full bg-[var(--surface-muted)]" />
          <div
            className="absolute top-[19px] h-1 rounded-full bg-[var(--brand)]"
            style={{
              left: rangeCollapsed
                ? `calc(${(viewportStartIndex / viewportDays) * 100}% - 3px)`
                : `${(viewportStartIndex / viewportDays) * 100}%`,
              width: rangeCollapsed
                ? "6px"
                : `${((viewportEndIndex - viewportStartIndex) / viewportDays) * 100}%`,
            }}
          />
          <button
            type="button"
            aria-label="Timeline start"
            aria-valuemin={0}
            aria-valuemax={totalDays}
            aria-valuenow={startIndex}
            aria-valuetext={localRange.from}
            role="slider"
            onPointerDown={(event) => handlePointerDown("start", event)}
            onPointerMove={(event) => handlePointerMove("start", event)}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onBlur={commitRangeUpdate}
            onKeyDown={(event) => handleKeyDown("start", event)}
            className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full"
            style={{
              left: `${(viewportStartIndex / viewportDays) * 100}%`,
              top: `${startHandleTop}px`,
              zIndex: activeHandle === "start" ? 4 : 3,
            }}
          >
            <span className="absolute inset-[7px] rounded-full border border-[#eaf4ef] bg-[var(--brand)] shadow-[0_0_0_4px_#173b32]" />
          </button>
          <button
            type="button"
            aria-label="Timeline end"
            aria-valuemin={0}
            aria-valuemax={totalDays}
            aria-valuenow={endIndex}
            aria-valuetext={localRange.to}
            role="slider"
            onPointerDown={(event) => handlePointerDown("end", event)}
            onPointerMove={(event) => handlePointerMove("end", event)}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onBlur={commitRangeUpdate}
            onKeyDown={(event) => handleKeyDown("end", event)}
            className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full"
            style={{
              left: `${(viewportEndIndex / viewportDays) * 100}%`,
              top: `${endHandleTop}px`,
              zIndex: activeHandle === "end" ? 4 : 2,
            }}
          >
            <span className="absolute inset-[7px] rounded-full border border-[#eaf4ef] bg-[var(--brand)] shadow-[0_0_0_4px_#173b32]" />
          </button>
          <div className="mt-7 flex justify-between text-[0.65rem] tabular-nums text-muted-foreground">
            {ticks.map((tick) => (
              <span key={tick.offset}>{tick.label}</span>
            ))}
          </div>
      </div>
    </section>
  );
}

function toIndex(value: string, domainFrom: string, totalDays: number) {
  return clampNumber(
    differenceInCalendarDays(new Date(value), new Date(domainFrom)),
    0,
    totalDays,
  );
}

function toDateFromIndex(domainFrom: string, index: number) {
  return addDays(new Date(domainFrom), index).toISOString().slice(0, 10);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toIndexFromClientX(clientX: number, rect: DOMRect, totalDays: number) {
  const ratio = clampNumber((clientX - rect.left) / rect.width, 0, 1);

  return Math.round(ratio * totalDays);
}

export function getTimelineViewport(
  domain: { from: string; to: string },
  value: { from: string; to: string },
) {
  const domainDays = Math.max(
    1,
    differenceInCalendarDays(new Date(domain.to), new Date(domain.from)),
  );
  const rangeStart = toIndex(value.from, domain.from, domainDays);
  const rangeEnd = toIndex(value.to, domain.from, domainDays);
  const rangeDays = Math.max(1, rangeEnd - rangeStart);

  if (rangeDays >= domainDays * 0.75) {
    return domain;
  }

  const viewportDays = Math.min(
    domainDays,
    Math.max(28, rangeDays * 4),
  );
  const paddingDays = viewportDays - rangeDays;
  let viewportStart = rangeStart - Math.round(paddingDays / 2);
  let viewportEnd = viewportStart + viewportDays;

  if (viewportStart < 0) {
    viewportEnd -= viewportStart;
    viewportStart = 0;
  }

  if (viewportEnd > domainDays) {
    viewportStart -= viewportEnd - domainDays;
    viewportEnd = domainDays;
  }

  viewportStart = Math.max(0, viewportStart);

  return {
    from: toDateFromIndex(domain.from, viewportStart),
    to: toDateFromIndex(domain.from, viewportEnd),
  };
}

function formatTimelineTick(value: string, viewportDays: number) {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (viewportDays <= 45) {
    return format(date, "MMM d");
  }

  if (viewportDays <= 400) {
    return format(date, "MMM yyyy");
  }

  return format(date, "yyyy-MM");
}
