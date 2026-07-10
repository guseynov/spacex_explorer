import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Card className="bg-card/96">
        <CardContent className="px-6 py-12">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Events
            </p>
            <Skeleton className="h-8 w-56 rounded-full" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-4 rounded-full" />
              <Skeleton className="h-4 rounded-full" />
              <Skeleton className="h-4 rounded-full" />
              <Skeleton className="h-4 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Skeleton className="h-80 rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-[30rem] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
