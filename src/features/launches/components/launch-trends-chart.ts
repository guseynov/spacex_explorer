export const CHART_HEIGHT = 280;
export const MARGIN = {
  top: 24,
  right: 20,
  bottom: 48,
  left: 44,
};

export function getChartWidth(yearCount: number) {
  const minimumWidth = 960;
  const perYearWidth = 64;

  return Math.max(minimumWidth, MARGIN.left + MARGIN.right + yearCount * perYearWidth);
}
