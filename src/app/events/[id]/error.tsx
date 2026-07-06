"use client";

export default function EventDetailError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[800px] justify-center px-4 py-10">
      <div className="panel w-full px-6 py-10 text-center sm:px-10">
        <div className="mx-auto max-w-xl space-y-4">
          <p className="text-sm font-medium text-[var(--danger)]">
            Event load failed
          </p>
          <p className="text-base leading-7 text-[var(--muted)]">
            The event details could not be loaded. Try the request again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="button-primary px-5 py-3 text-sm font-semibold transition"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
