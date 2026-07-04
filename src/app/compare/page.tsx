import type { Metadata } from "next";
import { ComparePage } from "@/features/compare/compare-page";

export const metadata: Metadata = {
  title: "Compare Events",
};

export default async function CompareRoute(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="h-full overflow-auto pr-1">
      <ComparePage
        leftId={getSearchParam(searchParams.left)}
        rightId={getSearchParam(searchParams.right)}
      />
    </div>
  );
}

function getSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}
