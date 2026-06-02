"use client";

import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/empty-state";
import { RetryState } from "@/components/retry-state";
import { fetchLaunchYearStats } from "@/lib/api/client";

const FIRST_SUPPORTED_YEAR = 2006;
const LAST_SUPPORTED_YEAR = 2022;

type YearStat = {
  year: number;
  totalLaunches: number;
  successLaunches: number;
};

const CHART_HEIGHT = 280;
const MARGIN = {
  top: 24,
  right: 20,
  bottom: 48,
  left: 44,
};

export function LaunchTrendsPanel() {
  const years = useMemo(() => {
    return Array.from(
      { length: LAST_SUPPORTED_YEAR - FIRST_SUPPORTED_YEAR + 1 },
      (_, index) => FIRST_SUPPORTED_YEAR + index,
    );
  }, []);

  const query = useQuery({
    queryKey: ["launch-year-stats", years],
    queryFn: () => fetchLaunchYearStats(years),
    staleTime: 30 * 60 * 1000,
  });

  if (query.isPending) {
    return <LaunchTrendsSkeleton />;
  }

  if (query.isError) {
    return (
      <RetryState
        message="The launch trends report could not be loaded. Retry to fetch the yearly summary again."
        onRetry={() => query.refetch()}
      />
    );
  }

  if (!query.data || query.data.length === 0) {
    return (
      <EmptyState
        title="No launch trend data"
        description="The yearly summary is currently unavailable for this window."
      />
    );
  }

  const stats = query.data;

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
            Launches counted directly from the SpaceX API, covering 2006 through 2022.
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChartCard
          title="Launches per year"
          description="Higher bars mean more launches in that year."
          legend="Launch count"
        >
          <BarChart data={stats} />
        </TrendChartCard>

        <TrendChartCard
          title="Success rate"
          description="Percentage of launches that ended in success."
          legend="Success percentage"
        >
          <LineChart data={stats} />
        </TrendChartCard>
      </div>
    </section>
  );
}

function TrendChartCard({
  title,
  description,
  legend,
  children,
}: {
  title: string;
  description: string;
  legend: string;
  children: ReactNode;
}) {
  return (
    <section className="panel panel-strong flex flex-col gap-5 px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
          {legend}
        </p>
      </div>
      {children}
    </section>
  );
}

function BarChart({ data }: { data: YearStat[] }) {
  const maxLaunches = Math.max(...data.map((item) => item.totalLaunches), 1);
  const chartWidth = getChartWidth(data.length);
  const plotWidth = chartWidth - MARGIN.left - MARGIN.right;
  const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const slotWidth = plotWidth / data.length;
  const barWidth = Math.max(slotWidth * 0.56, 24);
  const baselineY = MARGIN.top + plotHeight;

  return (
    <figure className="space-y-3">
      <div className="overflow-x-auto pb-2">
      <svg
        width={chartWidth}
        viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
        className="block h-auto"
        role="img"
        aria-label="Bar chart showing the number of launches for each year"
      >
        <line
          x1={MARGIN.left}
          y1={baselineY}
          x2={chartWidth - MARGIN.right}
          y2={baselineY}
          stroke="var(--border-strong)"
          strokeWidth="1"
        />

        {[0, 0.5, 1].map((step) => {
          const y = MARGIN.top + plotHeight - plotHeight * step;
          return (
            <g key={step}>
              <line
                x1={MARGIN.left}
                y1={y}
                x2={chartWidth - MARGIN.right}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4 5"
              />
              <text
                x={MARGIN.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="var(--muted)"
                className="text-[10px] font-medium"
              >
                {Math.round(maxLaunches * step)}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const centerX = MARGIN.left + slotWidth * index + slotWidth / 2;
          const barHeight = (item.totalLaunches / maxLaunches) * plotHeight;
          const barY = baselineY - barHeight;

          return (
            <g key={item.year}>
              <rect
                x={centerX - barWidth / 2}
                y={barY}
                width={barWidth}
                height={Math.max(barHeight, 4)}
                rx="10"
                fill="var(--accent)"
              />
              <text
                x={centerX}
                y={Math.max(barY - 8, 18)}
                textAnchor="middle"
                fill="var(--foreground)"
                className="text-[11px] font-semibold"
              >
                {item.totalLaunches} launches
              </text>
              <text
                x={centerX}
                y={baselineY + 20}
                textAnchor="middle"
                fill="var(--muted)"
                className="text-[11px] font-medium"
              >
                {item.year}
              </text>
            </g>
          );
        })}
      </svg>
      </div>
    </figure>
  );
}

function LineChart({ data }: { data: YearStat[] }) {
  const chartWidth = getChartWidth(data.length);
  const plotWidth = chartWidth - MARGIN.left - MARGIN.right;
  const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const stepWidth = plotWidth / Math.max(data.length - 1, 1);
  const points = data.map((item, index) => {
    const x = MARGIN.left + stepWidth * index;
    const successRate =
      item.totalLaunches === 0 ? 0 : (item.successLaunches / item.totalLaunches) * 100;
    const y = MARGIN.top + plotHeight - (successRate / 100) * plotHeight;
    return { ...item, successRate, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = [
    `M ${points[0].x} ${MARGIN.top + plotHeight}`,
    ...points.map((point, index) => `${index === 0 ? "L" : "L"} ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${MARGIN.top + plotHeight}`,
    "Z",
  ].join(" ");

  return (
    <figure className="space-y-3">
      <div className="overflow-x-auto pb-2">
      <svg
        width={chartWidth}
        viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
        className="block h-auto"
        role="img"
        aria-label="Line chart showing the yearly launch success rate"
      >
        <line
          x1={MARGIN.left}
          y1={MARGIN.top + plotHeight}
          x2={chartWidth - MARGIN.right}
          y2={MARGIN.top + plotHeight}
          stroke="var(--border-strong)"
          strokeWidth="1"
        />

        {[0, 25, 50, 75, 100].map((tick) => {
          const y = MARGIN.top + plotHeight - (tick / 100) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                y1={y}
                x2={chartWidth - MARGIN.right}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4 5"
              />
              <text
                x={MARGIN.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="var(--muted)"
                className="text-[10px] font-medium"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="rgba(255, 255, 255, 0.06)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--success)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((point) => (
          <g key={point.year}>
            <circle cx={point.x} cy={point.y} r="5.5" fill="var(--success)" />
            <circle cx={point.x} cy={point.y} r="10" fill="rgba(255, 255, 255, 0.08)" />
            <text
              x={point.x}
              y={Math.max(point.y - 10, 18)}
              textAnchor="middle"
              fill="var(--foreground)"
              className="text-[11px] font-semibold"
            >
              {Math.round(point.successRate)}%
            </text>
            <text
              x={point.x}
              y={MARGIN.top + plotHeight + 20}
              textAnchor="middle"
              fill="var(--muted)"
              className="text-[11px] font-medium"
            >
              {point.year}
            </text>
          </g>
        ))}
      </svg>
      </div>
    </figure>
  );
}

function getChartWidth(yearCount: number) {
  const minimumWidth = 960;
  const perYearWidth = 64;

  return Math.max(minimumWidth, MARGIN.left + MARGIN.right + yearCount * perYearWidth);
}

function LaunchTrendsSkeleton() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
        <div className="h-8 w-72 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-full max-w-3xl animate-pulse rounded-full bg-white/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <section key={index} className="panel panel-strong px-5 py-5 sm:px-6">
            <div className="space-y-3">
              <div className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="mt-5 h-[280px] animate-pulse rounded-[1.5rem] bg-white/5" />
          </section>
        ))}
      </div>
    </section>
  );
}
