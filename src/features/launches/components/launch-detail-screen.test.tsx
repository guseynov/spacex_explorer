// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { useQueries, useQuery } from "@tanstack/react-query";
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
    useQueries: vi.fn(),
  };
});

const mockUseQuery = vi.mocked(useQuery);
const mockUseQueries = vi.mocked(useQueries);

const launch = {
  id: "launch-1",
  name: "Crew Demo-2",
  date_utc: "2020-05-30T19:22:00.000Z",
  date_local: "2020-05-30T15:22:00-04:00",
  upcoming: false,
  success: true,
  details: "A historic crewed launch.",
  flight_number: 94,
  rocket: "rocket-1",
  launchpad: "launchpad-1",
  links: {
    patch: {
      small: "https://images2.imgbox.com/a9/9a/test.png",
      large: "https://images2.imgbox.com/e3/cc/test.png",
    },
    flickr: {
      original: ["https://live.staticflickr.com/65535/test.jpg"],
      small: [],
    },
    article: "https://example.com/article",
    wikipedia: null,
    webcast: "https://example.com/webcast",
    presskit: null,
  },
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

    mockUseQueries.mockReturnValue([
      {
        data: {
          name: "Falcon 9",
          company: "SpaceX",
          country: "United States",
          description: "Reusable launch vehicle.",
        },
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      },
      {
        data: {
          full_name: "KSC LC 39A",
          locality: "Cape Canaveral",
          region: "Florida",
          details: "Historic launch site.",
        },
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      },
    ] as never);

    renderWithProviders(<LaunchDetailScreen launchId="launch-1" />);

    expect(
      screen.getByRole("heading", { name: /crew demo-2/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Falcon 9/)).toBeInTheDocument();
    expect(screen.getByText(/KSC LC 39A/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /article/i })).toHaveAttribute(
      "href",
      "https://example.com/article",
    );
    expect(
      screen.getByAltText(/crew demo-2 flickr image 1/i),
    ).toBeInTheDocument();
  });

  it("renders gallery fallback copy when no images exist", () => {
    mockUseQuery.mockReturnValue({
      data: {
        ...launch,
        links: {
          ...launch.links,
          flickr: {
            original: [],
            small: [],
          },
        },
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    mockUseQueries.mockReturnValue([
      {
        data: {
          name: "Falcon 9",
          company: "SpaceX",
          country: "United States",
          description: "Reusable launch vehicle.",
        },
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      },
      {
        data: {
          full_name: "KSC LC 39A",
          locality: "Cape Canaveral",
          region: "Florida",
          details: "Historic launch site.",
        },
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      },
    ] as never);

    renderWithProviders(<LaunchDetailScreen launchId="launch-1" />);

    expect(
      screen.getByText(/no flickr gallery is available for this launch/i),
    ).toBeInTheDocument();
  });
});
