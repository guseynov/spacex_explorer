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
  id: "launch-1",
  name: "Crew Demo-2",
  net: "2020-05-30T19:22:00.000Z",
  status: { id: 3, name: "Launch Successful", abbrev: "Success" },
  image: {
    image_url: "https://example.com/launch.jpg",
    thumbnail_url: "https://example.com/launch-thumb.jpg",
  },
  infographic: null,
  failreason: "",
  agency_launch_attempt_count: 94,
  orbital_launch_attempt_count: 100,
  mission: {
    name: "Crew Demo-2",
    description: "A historic crewed launch.",
    image: null,
    info_urls: [{ url: "https://example.com/article" }],
    vid_urls: [{ url: "https://example.com/webcast" }],
  },
  rocket: {
    id: 1,
    configuration: {
      id: 164,
      name: "Falcon 9",
      full_name: "Falcon 9 Block 5",
      variant: "Block 5",
      description: "Reusable launch vehicle.",
      manufacturer: {
        name: "SpaceX",
        country: [{ name: "United States of America" }],
      },
      image: null,
    },
  },
  pad: {
    id: 80,
    name: "KSC LC 39A",
    active: true,
    description: "Historic launch site.",
    image: null,
    location: {
      name: "Cape Canaveral, Florida, USA",
      description: "Kennedy Space Center.",
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

  it("renders launch, rocket, launchpad, and gallery data", () => {
    mockUseQuery.mockReturnValue({
      data: launch,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(<LaunchDetailScreen launchId="launch-1" />);

    expect(
      screen.getByRole("heading", { name: /crew demo-2/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Falcon 9 Block 5/)).toBeInTheDocument();
    expect(screen.getByText(/KSC LC 39A/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /article/i })).toHaveAttribute(
      "href",
      "https://example.com/article",
    );
    expect(
      screen.getByAltText(/crew demo-2 mission image 1/i),
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
      screen.getByText(/no mission gallery is available for this launch/i),
    ).toBeInTheDocument();
  });
});
