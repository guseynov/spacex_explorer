"use client";

import { RetryState } from "@/components/retry-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <div className="mx-auto max-w-3xl px-4 py-12"><RetryState message={error.message || "Try loading this route again."} onRetry={reset} /></div>;
}
