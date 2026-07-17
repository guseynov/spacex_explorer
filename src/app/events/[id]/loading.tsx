import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Skeleton className="h-5 w-32 rounded-sm" />
      <div className="space-y-4 border-b border-border pb-8">
        <Skeleton className="h-6 w-48 rounded-sm" />
        <Skeleton className="h-14 w-full max-w-3xl rounded-sm" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-sm" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-sm" />
        <Skeleton className="h-72 rounded-sm" />
      </div>
    </div>
  );
}
