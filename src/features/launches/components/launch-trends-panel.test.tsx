// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { LaunchTrendsPanel } from "./launch-trends-panel";

describe("LaunchTrendsPanel", () => {
  it("renders yearly launch trends from query data", () => {
    const data = Array.from({ length: 17 }, (_, index) => {
      const year = 2006 + index;

      return {
        year,
        totalLaunches: year === 2022 ? 25 : year === 2006 ? 2 : 10 + index,
        successLaunches: year === 2022 ? 24 : year === 2006 ? 1 : 9 + index,
      };
    });

    renderWithProviders(<LaunchTrendsPanel data={data} />);

    expect(
      screen.getByRole("heading", { name: /launch volume and success rate/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("2006").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2022").length).toBeGreaterThan(0);
    expect(screen.queryByText("2023")).not.toBeInTheDocument();
    expect(screen.getAllByText("25 launches").length).toBeGreaterThan(0);
    expect(screen.getAllByText("96%").length).toBeGreaterThan(0);
  });
});
