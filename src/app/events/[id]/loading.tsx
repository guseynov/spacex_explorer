export default function EventDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="h-5 w-28 animate-pulse rounded bg-[rgba(255,255,255,0.08)]" />
      <div className="h-72 animate-pulse rounded-[1.15rem] bg-[rgba(255,255,255,0.05)]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[1.15rem] bg-[rgba(255,255,255,0.05)]" />
        <div className="h-64 animate-pulse rounded-[1.15rem] bg-[rgba(255,255,255,0.05)]" />
      </div>
    </div>
  );
}
