"use client";

export function LaunchCardSkeleton() {
  return (
    <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 animate-pulse rounded-[10px] bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 animate-pulse bg-white/10" />
          <div className="h-8 w-2/3 animate-pulse bg-white/10" />
          <div className="h-4 w-40 animate-pulse bg-white/10" />
        </div>
      </div>
    </div>
  );
}
