"use client";

import { addDays, differenceInCalendarDays } from "date-fns";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeHandle, setActiveHandle] = useState<"start" | "end" | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<"start" | "end" | null>(null);
  const localRangeRef = useRef(value);
  const windowLength = Math.max(
    1,
    differenceInCalendarDays(
      new Date(localRange.to),
      new Date(localRange.from),
    ),
  );
  const totalDays = Math.max(
    1,
    differenceInCalendarDays(new Date(domain.to), new Date(domain.from)),
  );
  const startIndex = toIndex(localRange.from, domain.from, totalDays);
  const endIndex = toIndex(localRange.to, domain.from, totalDays);
  const animationFrameRef = useRef<number | null>(null);
  const overlapThreshold = Math.max(2, Math.round(totalDays * 0.008));
  const handlesOverlap = endIndex - startIndex <= overlapThreshold;
  const startHandleTop = handlesOverlap ? 7 : 19;
  const endHandleTop = handlesOverlap ? 27 : 19;
  const rangeCollapsed = startIndex === endIndex;

  const syncLocalRange = (range: { from: string; to: string }) => {
    const normalizedRange = normalizeEventDateRange(range.from, range.to);

    localRangeRef.current = normalizedRange;
    setLocalRange(normalizedRange);

    return normalizedRange;
  };

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        window.clearInterval(animationFrameRef.current);
      }
      return;
    }

    animationFrameRef.current = window.setInterval(() => {
      const nextStart = Math.min(startIndex + 1, totalDays - windowLength);
      const nextEnd = Math.min(nextStart + windowLength, totalDays);
      const nextRange = {
        from: toDateFromIndex(domain.from, nextStart),
        to: toDateFromIndex(domain.from, nextEnd),
      };

      if (nextEnd >= totalDays) {
        setIsPlaying(false);
      }

      syncLocalRange(nextRange);
      onChange(nextRange);
    }, 480);

    return () => {
      if (animationFrameRef.current) {
        window.clearInterval(animationFrameRef.current);
      }
    };
  }, [domain.from, isPlaying, onChange, startIndex, totalDays, windowLength]);

  const ticks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const dayOffset = Math.round(totalDays * ratio);

      return {
        label: toDateFromIndex(domain.from, Math.min(dayOffset, totalDays)).slice(0, 7),
        offset: ratio * 100,
      };
    });
  }, [domain.from, totalDays]);

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
      totalDays,
    );

    if (handle === "start") {
      applyRangeUpdate({
        from: toDateFromIndex(domain.from, Math.min(nextIndex, endIndex)),
        to: localRangeRef.current.to,
      });

      return;
    }

    applyRangeUpdate({
      from: localRangeRef.current.from,
      to: toDateFromIndex(domain.from, Math.max(nextIndex, startIndex)),
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

  return (
    <Card className="bg-card/92">
      <CardContent className="space-y-4 px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Timeline
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/88">
              <span>{formatEventRangeLabel(localRange.from, localRange.to)}</span>
              <Badge className="px-2 py-1 text-[0.58rem]">
                {eventCount} events
              </Badge>
              {isPending ? (
                <span className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Syncing
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setIsPlaying((current) => !current)}
              aria-label={isPlaying ? "Pause timeline playback" : "Play timeline playback"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  commitExplicitRange({
                    from: toDateFromIndex(domain.from, Math.max(totalDays - preset.days, 0)),
                    to: domain.to,
                  })
                }
                className="uppercase tracking-[0.14em]"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
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
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
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

        <div
          ref={sliderRef}
          className="relative pt-3"
        >
          <div className="absolute inset-x-0 top-[19px] h-[3px] rounded-full bg-white/8" />
          <div
            className="absolute top-[19px] h-[3px] rounded-full bg-[linear-gradient(90deg,rgba(147,197,253,0.9),rgba(68,144,245,0.6))]"
            style={{
              left: rangeCollapsed
                ? `calc(${(startIndex / totalDays) * 100}% - 3px)`
                : `${(startIndex / totalDays) * 100}%`,
              width: rangeCollapsed
                ? "6px"
                : `${((endIndex - startIndex) / totalDays) * 100}%`,
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
              left: `${(startIndex / totalDays) * 100}%`,
              top: `${startHandleTop}px`,
              zIndex: activeHandle === "start" ? 4 : 3,
            }}
          >
            <span className="absolute inset-[7px] rounded-full border border-[rgba(255,255,255,0.75)] bg-[#f8fbff] shadow-[0_0_0_6px_rgba(68,144,245,0.14),0_0_18px_rgba(68,144,245,0.28)]" />
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
              left: `${(endIndex / totalDays) * 100}%`,
              top: `${endHandleTop}px`,
              zIndex: activeHandle === "end" ? 4 : 2,
            }}
          >
            <span className="absolute inset-[7px] rounded-full border border-[rgba(255,255,255,0.75)] bg-[#f8fbff] shadow-[0_0_0_6px_rgba(68,144,245,0.14),0_0_18px_rgba(68,144,245,0.28)]" />
          </button>
          <div className="mt-7 flex justify-between text-[0.54rem] uppercase tracking-[0.14em] text-muted-foreground">
            {ticks.map((tick) => (
              <span key={tick.offset}>{tick.label}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
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
