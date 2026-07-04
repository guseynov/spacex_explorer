"use client";

import { useRouter } from "next/navigation";

export function RateLimitState({
  title = "Event feed temporarily unavailable",
  message,
}: {
  title?: string;
  message: string;
}) {
  const router = useRouter();

  return (
    <div className="panel px-6 py-12 text-center sm:px-10">
      <div className="mx-auto max-w-xl space-y-4">
        <p className="text-sm font-medium text-[var(--warning)]">
          Rate limited
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        <p className="text-base leading-7 text-[var(--muted)]">{message}</p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="button-primary px-5 py-3 text-sm font-semibold transition"
        >
          Refresh page
        </button>
      </div>
    </div>
  );
}
