import type { Metadata } from "next";
import { RateLimitState } from "@/components/rate-limit-state";
import { LaunchTrendsPanel } from "@/features/launches/components/launch-trends-panel";
import { fetchLaunchYearStats } from "@/lib/api/client";
import { LaunchApiError } from "@/lib/api/errors";

export const metadata: Metadata = {
  title: "Launch Trends",
};

const FIRST_SUPPORTED_YEAR = 2006;
const LAST_SUPPORTED_YEAR = 2022;

export default async function TrendsPage() {
  const years = Array.from(
    { length: LAST_SUPPORTED_YEAR - FIRST_SUPPORTED_YEAR + 1 },
    (_, index) => FIRST_SUPPORTED_YEAR + index,
  );
  let data: Awaited<ReturnType<typeof fetchLaunchYearStats>> | undefined;

  try {
    data = await fetchLaunchYearStats(years);
  } catch (error) {
    if (error instanceof LaunchApiError && error.status === 429) {
      return (
        <div className="flex min-h-full items-start justify-center pt-6">
          <RateLimitState message="Launch Library is rate limiting requests right now. Refresh the page in a moment to try again." />
        </div>
      );
    }

    throw error;
  }

  return <LaunchTrendsPanel data={data ?? []} />;
}
