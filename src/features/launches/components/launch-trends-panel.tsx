import { EmptyState } from "@/components/empty-state";
import { BarChart } from "./bar-chart";
import { LineChart } from "./line-chart";
import { TrendChartCard } from "./trend-chart-card";

export type YearStat = {
  year: number;
  totalLaunches: number;
  successLaunches: number;
};

export function LaunchTrendsPanel({ data }: { data: YearStat[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No launch trend data"
        description="The yearly summary is currently unavailable for this window."
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
          Trends
        </p>
        <div className="space-y-2">
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[2rem]">
            Launch volume and success rate
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Launches counted through Launch Library 2.
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChartCard
          title="Launches per year"
          description="Higher bars mean more launches in that year."
          legend="Launch count"
        >
          <BarChart data={data} />
        </TrendChartCard>

        <TrendChartCard
          title="Success rate"
          description="Percentage of launches that ended in success."
          legend="Success percentage"
        >
          <LineChart data={data} />
        </TrendChartCard>
      </div>
    </section>
  );
}
