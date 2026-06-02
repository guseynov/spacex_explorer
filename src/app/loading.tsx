export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="panel px-6 py-12">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Launches
          </p>
          <div className="h-8 w-56 animate-pulse rounded-full bg-white/10" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-4 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="panel h-80 animate-pulse bg-white/5" />
        <div className="space-y-4">
          <div className="panel h-28 animate-pulse bg-white/5" />
          <div className="panel h-[30rem] animate-pulse bg-white/5" />
        </div>
      </div>
    </div>
  );
}
