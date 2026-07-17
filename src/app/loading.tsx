import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative h-[calc(100svh-3.5rem)] overflow-hidden bg-background">
      <Skeleton className="absolute inset-0 rounded-none opacity-40" />
      <div className="absolute inset-y-0 right-0 hidden w-[25rem] space-y-3 border-l border-border bg-card p-4 lg:block">
        <Skeleton className="h-10 rounded-sm" />
        <Skeleton className="h-40 rounded-sm" />
        <Skeleton className="h-24 rounded-sm" />
        <Skeleton className="h-24 rounded-sm" />
      </div>
      <Skeleton className="absolute bottom-4 left-4 right-4 h-24 rounded-sm lg:right-[26rem]" />
    </div>
  );
}
