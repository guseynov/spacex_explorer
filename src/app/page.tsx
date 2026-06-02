import { Suspense } from "react";
import { LaunchesExplorer } from "@/features/launches/components/launches-explorer";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="panel px-6 py-12 text-[var(--muted)]">
            Preparing the launch manifest...
          </div>
        </div>
      }
      >
      <LaunchesExplorer />
    </Suspense>
  );
}
