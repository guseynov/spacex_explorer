export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="panel px-6 py-10">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Bookmarks
          </p>
          <div className="h-7 w-48 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-72 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
      <div className="panel h-64 animate-pulse bg-white/5" />
    </div>
  );
}
