import type { Metadata } from "next";
import { ComparePage } from "@/features/compare/compare-page";

export const metadata: Metadata = {
  title: "Compare Launches",
};

export default async function CompareRoute(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const leftId = typeof searchParams.left === "string" ? searchParams.left : null;
  const rightId =
    typeof searchParams.right === "string" ? searchParams.right : null;

  return (
    <div className="h-full overflow-auto pr-1">
      <ComparePage leftId={leftId} rightId={rightId} />
    </div>
  );
}
