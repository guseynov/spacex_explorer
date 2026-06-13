import { CHART_HEIGHT, MARGIN, getChartWidth } from "./launch-trends-chart";
import type { YearStat } from "./launch-trends-panel";

export function LineChart({ data }: { data: YearStat[] }) {
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
      <div className="hidden overflow-x-auto pb-2 md:block">
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

      <div className="flex flex-col gap-2 md:hidden">
        {points.map((point) => (
          <div
            key={point.year}
            className="grid grid-cols-[3.5rem_minmax(0,1fr)_3.75rem] items-center gap-3"
          >
            <span className="text-[0.78rem] font-medium text-[var(--muted)]">
              {point.year}
            </span>
            <div className="h-3 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <div
                className="h-full rounded-full bg-[var(--success)]"
                style={{ width: `${point.successRate}%` }}
              />
            </div>
            <span className="text-right text-[0.82rem] font-semibold text-[var(--foreground)]">
              {Math.round(point.successRate)}%
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}
