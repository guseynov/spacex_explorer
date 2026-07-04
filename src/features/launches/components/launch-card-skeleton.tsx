"use client";

export function LaunchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[0.375rem] border border-[var(--border)] bg-[rgba(15,21,36,0.92)]">
      <div className="h-[138px] animate-pulse bg-white/6" />
      <div className="space-y-3 px-4 py-4">
        <div className="h-4 w-20 animate-pulse rounded bg-white/8" />
        <div className="h-7 w-2/3 animate-pulse rounded bg-white/8" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-white/8" />
          <div className="h-3 w-full animate-pulse rounded bg-white/8" />
          <div className="h-3 w-full animate-pulse rounded bg-white/8" />
        </div>
        <div className="h-px bg-white/6" />
        <div className="flex justify-between">
          <div className="h-4 w-16 animate-pulse rounded bg-white/8" />
          <div className="h-4 w-16 animate-pulse rounded bg-white/8" />
        </div>
      </div>
    </div>
  );
}
