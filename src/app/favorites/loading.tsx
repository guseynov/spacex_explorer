import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="space-y-3 border-b border-border pb-6">
        <Skeleton className="h-4 w-28 rounded-sm" />
        <Skeleton className="h-10 w-64 rounded-sm" />
        <Skeleton className="h-5 w-full max-w-xl rounded-sm" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Skeleton className="h-36 rounded-sm" />
        <Skeleton className="h-36 rounded-sm" />
      </div>
    </div>
  );
}
