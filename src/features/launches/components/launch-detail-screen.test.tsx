// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { renderWithProviders } from "@/test/render";
import { LaunchDetailScreen } from "./launch-detail-screen";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );

  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

const mockUseQuery = vi.mocked(useQuery);

const launch = {
  id: "EONET_1234",
  name: "Northern California Wildfires",
  net: "2020-05-30T19:22:00.000Z",
  status: { id: 2, name: "Closed Event", abbrev: "Closed" },
  image: {
    image_url: "https://example.com/launch.jpg",
    thumbnail_url: "https://example.com/launch-thumb.jpg",
  },
  infographic: null,
  failreason: "",
  agency_launch_attempt_count: 94,
  orbital_launch_attempt_count: 100,
  mission: {
    name: "Northern California Wildfires",
    description: "A large wildfire event observed across several counties.",
    image: null,
    info_urls: [{ url: "https://example.com/source" }],
    vid_urls: [{ url: "https://example.com/webcast" }],
  },
  rocket: {
    id: 1,
    configuration: {
      id: 164,
      name: "Wildfires",
      full_name: "Wildfires",
      variant: "Natural event",
      description: "Thermal hotspot and fire perimeter observations.",
      manufacturer: {
        name: "NASA EONET",
        country: [{ name: "United States of America" }],
      },
      image: null,
    },
  },
  pad: {
    id: 80,
    name: "NASA FIRMS",
    active: true,
    description: "Observed geometry derived from NASA source feeds.",
    image: null,
    location: {
      name: "California, United States",
      description: "Approximate latest geometry summary.",
      timezone_name: "America/New_York",
      country: { name: "United States of America" },
    },
    country: { name: "United States of America" },
  },
  info_urls: [],
  vid_urls: [],
  mission_patches: [],
  program: [],
};

describe("LaunchDetailScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders event, category, geometry, and gallery data", () => {
    mockUseQuery.mockReturnValue({
      data: launch,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(<LaunchDetailScreen launchId="launch-1" />);

    expect(
      screen.getByRole("heading", { name: /northern california wildfires/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Wildfires$/)).toBeInTheDocument();
    expect(screen.getByText(/NASA FIRMS/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /source/i })).toHaveAttribute(
      "href",
      "https://example.com/source",
    );
    expect(
      screen.getByAltText(/northern california wildfires event image 1/i),
    ).toBeInTheDocument();
  });

  it("renders gallery fallback copy when no images exist", () => {
    mockUseQuery.mockReturnValue({
      data: {
        ...launch,
        image: null,
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(<LaunchDetailScreen launchId="launch-1" />);

    expect(
      screen.getByText(/no related imagery is available for this event/i),
    ).toBeInTheDocument();
  });
});
