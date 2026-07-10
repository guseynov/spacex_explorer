"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCompare } from "./compare-context";

export function CompareBanner() {
  const router = useRouter();
  const { items, hasHydrated, clearCompare } = useCompare();

  if (!hasHydrated || items.length === 0) {
    return null;
  }

  const compareHref =
    items.length === 2
      ? (`/compare?left=${items[0].id}&right=${items[1].id}` as Route)
      : null;

  return (
    <Card className="mt-4 border-primary/20 bg-primary/8">
      <CardContent className="flex flex-col gap-4 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Badge className="text-[0.7rem]">Compare mode</Badge>
          <p className="text-sm leading-6 text-muted-foreground">
            {items.length === 1
              ? "Pick one more event to open the side-by-side comparison."
              : "Two events are selected and ready to compare."}
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item.id} variant="secondary" className="rounded-md normal-case tracking-normal">
                {item.title}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {compareHref ? (
            <Button type="button" onClick={() => router.push(compareHref)}>
              Compare selected
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={clearCompare}>
            Clear compare
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
