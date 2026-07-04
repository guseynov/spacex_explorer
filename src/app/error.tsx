"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="panel px-6 py-12 text-center sm:px-10">
      <div className="mx-auto max-w-xl space-y-4">
        <p className="text-sm font-medium text-[var(--danger)]">
          Route failed to load
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          EONET Explorer hit a loading error.
        </h2>
        <p className="text-base leading-7 text-[var(--muted)]">
          {error.message || "Try reloading the current route."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="button-primary px-5 py-3 text-sm font-semibold transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
