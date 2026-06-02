import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LaunchDetailScreen } from "@/features/launches/components/launch-detail-screen";
import {
  fetchLaunchById,
  fetchLaunchpadById,
  fetchRocketById,
} from "@/lib/api/client";
import { SpaceXApiError } from "@/lib/api/errors";

export const metadata: Metadata = {
  title: "Launch Detail",
};

export default async function LaunchDetailPage(
  props: PageProps<"/launches/[id]">,
) {
  const params = await props.params;
  const launchId = params.id;

  let launch;

  try {
    launch = await fetchLaunchById(launchId);
  } catch (error) {
    if (error instanceof SpaceXApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const [rocketResult, launchpadResult] = await Promise.allSettled([
    fetchRocketById(launch.rocket),
    fetchLaunchpadById(launch.launchpad),
  ]);

  return (
    <div className="h-full overflow-auto pr-1">
      <LaunchDetailScreen
        launchId={launchId}
        initialLaunch={launch}
        initialRocket={
          rocketResult.status === "fulfilled" ? rocketResult.value : undefined
        }
        initialLaunchpad={
          launchpadResult.status === "fulfilled"
            ? launchpadResult.value
            : undefined
        }
      />
    </div>
  );
}
