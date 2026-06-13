import { useEffect, useRef, type ReactNode } from "react";
import { toFavoriteLaunch } from "@/lib/api/query-builder";
import { LaunchCard } from "./launch-card";

export function MobileLaunchList({
  launches,
  actionRenderer,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  launches: ReturnType<typeof toFavoriteLaunch>[];
  actionRenderer?: (launch: ReturnType<typeof toFavoriteLaunch>) => ReactNode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasNextPage || isFetchingNextPage) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage && hasNextPage) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "600px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, launches.length, onLoadMore]);

  return (
    <div className="panel overflow-hidden">
      {launches.map((launch, index) => (
        <div
          key={launch.id}
          className={
            index < launches.length - 1
              ? "border-b border-[var(--border)]"
              : undefined
          }
        >
          <LaunchCard
            launch={launch}
            actionSlot={actionRenderer?.(launch)}
          />
        </div>
      ))}
      {hasNextPage ? (
        <div ref={sentinelRef} className="h-8" aria-hidden="true" />
      ) : (
        <p className="px-5 py-4 text-center text-sm text-[var(--muted)]">
          You&apos;ve reached the end of the current launch results.
        </p>
      )}
    </div>
  );
}
