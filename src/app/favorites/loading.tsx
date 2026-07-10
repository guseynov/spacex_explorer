import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Card className="bg-card/96">
        <CardContent className="px-6 py-10">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Bookmarks
            </p>
            <Skeleton className="h-7 w-48 rounded-full" />
            <Skeleton className="h-4 w-72 rounded-full" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
