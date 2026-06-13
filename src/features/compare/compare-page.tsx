import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { fetchLaunchById } from "@/lib/api/client";
import { CompareColumn } from "./compare-column";

type CompareId = string | null;

export async function ComparePage({
  leftId,
  rightId,
}: {
  leftId: CompareId;
  rightId: CompareId;
}) {
  if (!leftId || !rightId || leftId === rightId) {
    return (
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Compare"
          title="Compare two launches"
          description="Select two missions from the explorer or favorites view, then open this page to compare them side by side."
        />
        <EmptyState
          title="Choose two different launches"
          description="The compare view needs two distinct launch IDs in the URL."
          action={
            <Link
              href="/"
              className="button-primary inline-flex px-5 py-3 text-sm font-semibold transition"
            >
              Back to launches
            </Link>
          }
        />
      </div>
    );
  }

  const [left, right] = await Promise.all([
    fetchLaunchById(leftId),
    fetchLaunchById(rightId),
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Compare"
        title="Two-launch comparison"
        description="Review mission timing, outcome, hardware, and launch site details across both launches."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CompareColumn data={left} />
        <CompareColumn data={right} />
      </div>
    </div>
  );
}
