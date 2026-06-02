export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="panel px-6 py-10">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Launch detail
          </p>
          <div className="h-8 w-64 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-80 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel h-[34rem] animate-pulse bg-white/5" />
        <div className="space-y-6">
          <div className="panel h-56 animate-pulse bg-white/5" />
          <div className="panel h-56 animate-pulse bg-white/5" />
        </div>
      </div>

      <div className="panel h-96 animate-pulse bg-white/5" />
    </div>
  );
}
