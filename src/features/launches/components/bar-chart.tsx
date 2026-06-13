import { CHART_HEIGHT, MARGIN, getChartWidth } from "./launch-trends-chart";
import type { YearStat } from "./launch-trends-panel";

export function BarChart({ data }: { data: YearStat[] }) {
  const maxLaunches = Math.max(...data.map((item) => item.totalLaunches), 1);
  const chartWidth = getChartWidth(data.length);
  const plotWidth = chartWidth - MARGIN.left - MARGIN.right;
  const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const slotWidth = plotWidth / data.length;
  const barWidth = Math.max(slotWidth * 0.56, 24);
  const baselineY = MARGIN.top + plotHeight;

  return (
    <figure className="space-y-3">
      <div className="hidden overflow-x-auto pb-2 md:block">
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

      <div className="flex flex-col gap-2 md:hidden">
        {data.map((item) => {
          const launchShare = (item.totalLaunches / maxLaunches) * 100;

          return (
            <div
              key={item.year}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)_3.75rem] items-center gap-3"
            >
              <span className="text-[0.78rem] font-medium text-[var(--muted)]">
                {item.year}
              </span>
              <div className="h-3 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${launchShare}%` }}
                />
              </div>
              <span className="text-right text-[0.82rem] font-semibold text-[var(--foreground)]">
                {item.totalLaunches}
              </span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
