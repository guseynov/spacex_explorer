import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LaunchDetailScreen } from "@/features/launches/components/launch-detail-screen";
import { fetchLaunchById } from "@/lib/api/client";
import { LaunchApiError } from "@/lib/api/errors";

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
    if (error instanceof LaunchApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="h-full overflow-auto pr-1">
      <LaunchDetailScreen
        launchId={launchId}
        initialLaunch={launch}
      />
    </div>
  );
}
