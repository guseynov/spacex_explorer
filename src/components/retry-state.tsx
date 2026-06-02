"use client";

export function RetryState({
  message,
  onRetry,
  buttonId,
}: {
  message: string;
  onRetry: () => void;
  buttonId?: string;
}) {
  return (
    <div className="panel px-6 py-12 text-center sm:px-10">
      <div className="mx-auto max-w-xl space-y-4">
        <p className="text-sm font-medium text-[var(--danger)]">
          Request failed
        </p>
        <p className="text-base leading-7 text-[var(--muted)]">{message}</p>
        <button
          id={buttonId}
          type="button"
          onClick={onRetry}
          className="button-primary px-5 py-3 text-sm font-semibold transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
