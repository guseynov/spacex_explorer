import type { Metadata } from "next";
import { RateLimitState } from "@/components/rate-limit-state";
import { LaunchTrendsPanel } from "@/features/launches/components/launch-trends-panel";
import { fetchLaunchYearStats } from "@/lib/api/client";
import { LaunchApiError } from "@/lib/api/errors";

export const metadata: Metadata = {
  title: "Event Trends",
};

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  let data: Awaited<ReturnType<typeof fetchLaunchYearStats>>;

  try {
    data = await fetchLaunchYearStats();
  } catch (error) {
    if (error instanceof LaunchApiError && error.status === 429) {
      return (
        <div className="flex min-h-full items-start justify-center pt-6">
          <RateLimitState
            title="EONET feed temporarily unavailable"
            message="NASA EONET is rate limiting requests right now. Refresh the page in a moment to try again."
          />
        </div>
      );
    }

    if (error instanceof LaunchApiError && error.status === 503) {
      return (
        <div className="flex min-h-full items-start justify-center pt-6">
          <RateLimitState
            title="EONET feed temporarily unavailable"
            message="NASA EONET is temporarily unavailable. Refresh the page in a moment to try again."
          />
        </div>
      );
    }

    throw error;
  }

  return <LaunchTrendsPanel data={data} />;
}
