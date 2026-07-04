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

  const totalLaunches = data.reduce((sum, year) => sum + year.totalLaunches, 0);
  const totalSuccesses = data.reduce(
    (sum, year) => sum + year.successLaunches,
    0,
  );
  const successRate = totalLaunches > 0
    ? Math.round((totalSuccesses / totalLaunches) * 100)
    : 0;
  const peakYear = data.reduce((currentPeak, year) =>
    year.totalLaunches > currentPeak.totalLaunches ? year : currentPeak,
  );
  const latestYear = data[data.length - 1];
  const metrics = [
    {
      label: "Total events",
      value: totalLaunches.toString(),
      note: "Captured in this dataset",
    },
    {
      label: "Closure rate",
      value: `${successRate}%`,
      note: "Events marked closed",
    },
    {
      label: "Peak year",
      value: String(peakYear.year),
      note: `${peakYear.totalLaunches} events`,
    },
    {
      label: "Latest year",
      value: String(latestYear.year),
      note: `${latestYear.totalLaunches} events`,
    },
  ];

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="app-kicker">
          Trends
        </p>
        <div className="space-y-2">
          <h1 className="type-display text-[2.3rem] font-semibold leading-none tracking-[0.01em] text-foreground sm:text-[3rem]">
            Event volume and closure rate
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[var(--info)]/72">
            Event counts from NASA EONET over the recent five-year window.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <section key={metric.label} className="metric-tile px-4 py-5">
            <p className="type-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              {metric.label}
            </p>
            <p className="mt-3 type-display text-[2rem] font-semibold leading-none text-foreground">
              {metric.value}
            </p>
            <p className="mt-2 text-sm text-[var(--info)]/68">
              {metric.note}
            </p>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChartCard
          title="Events per year"
          description="Higher bars mean more tracked natural events in that year."
          legend="Event count"
        >
          <BarChart data={data} />
        </TrendChartCard>

        <TrendChartCard
          title="Closure rate"
          description="Percentage of events in that year that are marked closed."
          legend="Closure percentage"
        >
          <LineChart data={data} />
        </TrendChartCard>
      </div>
    </section>
  );
}
