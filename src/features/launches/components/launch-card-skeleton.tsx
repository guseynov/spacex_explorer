"use client";

export function LaunchCardSkeleton() {
  return (
    <div className="border-b border-[var(--border)] px-4 py-4 sm:px-5">
      <div className="flex items-start gap-4">
        <div className="h-[72px] w-[72px] animate-pulse rounded-[10px] bg-white/8" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 w-24 animate-pulse rounded bg-white/8" />
          <div className="h-6 w-2/3 animate-pulse rounded bg-white/8" />
          <div className="h-4 w-40 animate-pulse rounded bg-white/8" />
        </div>
      </div>
    </div>
  );
}
