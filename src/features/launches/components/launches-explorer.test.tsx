// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useInfiniteQuery } from "@tanstack/react-query";
import { renderWithProviders } from "@/test/render";
import { LaunchesExplorer } from "./launches-explorer";
import { useLaunchFilters } from "../use-launch-filters";

vi.mock("@tanstack/react-query", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-query")>(
      "@tanstack/react-query",
    );

  return {
    ...actual,
    useInfiniteQuery: vi.fn(),
  };
});

vi.mock("../use-launch-filters", () => ({
  useLaunchFilters: vi.fn(),
}));

const mockUseInfiniteQuery = vi.mocked(useInfiniteQuery);
const mockUseLaunchFilters = vi.mocked(useLaunchFilters);

const baseFilters = {
  timing: "all" as const,
  category: "all" as const,
  from: "",
  to: "",
  sort: "date_desc" as const,
  search: "",
};

const setFilters = vi.fn();
const resetFilters = vi.fn();

function buildQueryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    hasNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
    ...overrides,
  };
}

describe("LaunchesExplorer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLaunchFilters.mockReturnValue({
      filters: baseFilters,
      setFilters,
      resetFilters,
    });
  });

  it("renders initial skeletons while the list is loading", () => {
    mockUseInfiniteQuery.mockReturnValue(
      buildQueryResult({ isPending: true }) as never,
    );

    const { container } = renderWithProviders(<LaunchesExplorer />);

    expect(screen.getByText("Loading event list...")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders an empty state and clears filters", async () => {
    const user = userEvent.setup();

    mockUseInfiniteQuery.mockReturnValue(
      buildQueryResult({
        data: {
          pages: [{ results: [] }],
        },
      }) as never,
    );

    renderWithProviders(<LaunchesExplorer />);

    expect(
      screen.getByRole("heading", { name: /no events match these filters/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset filters/i }),
    ).toHaveFocus();

    await user.click(
      screen.getByRole("button", { name: /reset filters/i }),
    );
    expect(resetFilters).toHaveBeenCalled();
  });

  it("renders an error state with retry", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    mockUseInfiniteQuery.mockReturnValue(
      buildQueryResult({
        isError: true,
        refetch,
      }) as never,
    );

    renderWithProviders(<LaunchesExplorer />);

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /try again/i })).toHaveFocus();
  });

  it("renders event state filter controls", () => {
    mockUseLaunchFilters.mockReturnValue({
      filters: {
        ...baseFilters,
        timing: "all",
      },
      setFilters,
      resetFilters,
    });

    mockUseInfiniteQuery.mockReturnValue(
      buildQueryResult({
        data: {
          pages: [{ results: [] }],
        },
      }) as never,
    );

    renderWithProviders(<LaunchesExplorer />);

    expect(screen.getAllByRole("button", { name: "Active" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Closed" }).length).toBeGreaterThan(0);
  });

  it("loads the next page when the button is pressed", async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();

    mockUseInfiniteQuery.mockReturnValue(
      buildQueryResult({
        hasNextPage: true,
        fetchNextPage,
        data: {
          pages: [
            {
              results: [
                {
                  id: "EONET_1",
                  name: "Mediterranean Wildfire Complex",
                  net: "2020-01-01T00:00:00.000Z",
                  status: {
                    id: 2,
                    name: "Closed Event",
                    abbrev: "Closed",
                  },
                  image: null,
                  rocket: {
                    configuration: {
                      name: "Wildfires",
                    },
                  },
                  pad: null,
                },
              ],
            },
          ],
        },
      }) as never,
    );

    renderWithProviders(<LaunchesExplorer />);

    await user.click(
      screen.getByRole("button", { name: /load more events/i }),
    );

    expect(fetchNextPage).toHaveBeenCalled();
  });
});
