import { useState } from "react";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { TimelineRangeSlider, getTimelineViewport } from "./timeline-range-slider";

const domain = {
  from: "2018-01-01",
  to: "2026-07-16",
};

describe("TimelineRangeSlider", () => {
  it("uses a contextual viewport for a 30 day range", () => {
    expect(
      getTimelineViewport(domain, {
        from: "2026-06-16",
        to: "2026-07-16",
      }),
    ).toEqual({
      from: "2026-03-18",
      to: "2026-07-16",
    });
  });

  it("separates the handles after selecting 30D", () => {
    function Harness() {
      const [value, setValue] = useState(domain);

      return (
        <TimelineRangeSlider
          domain={domain}
          value={value}
          eventCount={44}
          onChange={setValue}
        />
      );
    }

    renderWithProviders(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "30D" }));

    const start = screen.getByRole("slider", { name: "Timeline start" });
    const end = screen.getByRole("slider", { name: "Timeline end" });
    const startPosition = Number.parseFloat(start.style.left);
    const endPosition = Number.parseFloat(end.style.left);

    expect(start).toHaveAttribute("aria-valuetext", "2026-06-16");
    expect(end).toHaveAttribute("aria-valuetext", "2026-07-16");
    expect(endPosition - startPosition).toBeGreaterThanOrEqual(20);
  });

  it("keeps the full scale for All", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <TimelineRangeSlider
        domain={domain}
        value={domain}
        eventCount={44}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("slider", { name: "Timeline start" })).toHaveStyle({ left: "0%" });
    expect(screen.getByRole("slider", { name: "Timeline end" })).toHaveStyle({ left: "100%" });
    expect(
      screen.queryByRole("button", { name: "Play timeline playback" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("2018-01")).toBeInTheDocument();
  });

  it("extends the All preset to the fixed history boundary", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <TimelineRangeSlider
        domain={domain}
        value={{ from: "2026-04-17", to: domain.to }}
        eventCount={44}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "All" }));

    expect(onChange).toHaveBeenLastCalledWith(domain);
    expect(screen.getByRole("slider", { name: "Timeline start" })).toHaveAttribute(
      "aria-valuetext",
      domain.from,
    );
  });
});
