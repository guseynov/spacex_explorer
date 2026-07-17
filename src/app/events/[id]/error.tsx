"use client";

import { RetryState } from "@/components/retry-state";

export default function EventDetailError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[800px] justify-center px-4 py-10">
      <RetryState message="The event record could not be loaded. Try the request again." onRetry={reset} />
    </div>
  );
}
