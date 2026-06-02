"use client";

export function LaunchCardSkeleton() {
  return (
    <div className="panel p-5">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 animate-pulse bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-28 animate-pulse bg-white/10" />
          <div className="h-8 w-2/3 animate-pulse bg-white/10" />
          <div className="h-4 w-40 animate-pulse bg-white/10" />
        </div>
      </div>
    </div>
  );
}
