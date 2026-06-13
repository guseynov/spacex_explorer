export function LaunchTrendsSkeleton() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
        <div className="h-8 w-72 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-full max-w-3xl animate-pulse rounded-full bg-white/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <section key={index} className="panel panel-strong px-5 py-5 sm:px-6">
            <div className="space-y-3">
              <div className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="mt-5 h-[280px] animate-pulse rounded-[1.5rem] bg-white/5" />
          </section>
        ))}
      </div>
    </section>
  );
}
