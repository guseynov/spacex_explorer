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
          title="Compare two events"
          description="Select two NASA EONET events from the explorer or favorites view, then open this page to compare them side by side."
        />
        <EmptyState
          title="Choose two different events"
          description="The compare view needs two distinct event IDs in the URL."
          action={
            <Link
              href="/"
              className="button-primary inline-flex px-5 py-3 text-sm font-semibold transition"
            >
              Back to events
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
        title="Two-event comparison"
        description="Review event timing, category, source, and latest geometry details across both selected records."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CompareColumn data={left} />
        <CompareColumn data={right} />
      </div>
    </div>
  );
}
