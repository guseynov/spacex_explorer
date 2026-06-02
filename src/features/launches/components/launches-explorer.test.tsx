// @vitest-environment jsdom

import { fireEvent, screen } from "@testing-library/react";
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
  result: "all" as const,
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

    expect(screen.getByText("Loading launch list...")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders an empty state and clears filters", async () => {
    const user = userEvent.setup();

    mockUseInfiniteQuery.mockReturnValue(
      buildQueryResult({
        data: {
          pages: [{ docs: [] }],
        },
      }) as never,
    );

    renderWithProviders(<LaunchesExplorer />);

    expect(
      screen.getByRole("heading", { name: /no launches match these filters/i }),
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

  it("disables the result filter for upcoming launches", () => {
    mockUseLaunchFilters.mockReturnValue({
      filters: {
        ...baseFilters,
        timing: "upcoming",
      },
      setFilters,
      resetFilters,
    });

    mockUseInfiniteQuery.mockReturnValue(
      buildQueryResult({
        data: {
          pages: [{ docs: [] }],
        },
      }) as never,
    );

    renderWithProviders(<LaunchesExplorer />);

    expect(
      screen.getAllByRole("button", { name: "Success" }).some((button) =>
        button.hasAttribute("disabled"),
      ),
    ).toBe(true);
    expect(screen.queryByText(/upcoming launches do not have/i)).toBeNull();
  });

  it("loads the next page when the list is scrolled near the bottom", () => {
    const fetchNextPage = vi.fn();

    mockUseInfiniteQuery.mockReturnValue(
      buildQueryResult({
        hasNextPage: true,
        fetchNextPage,
        data: {
          pages: [
            {
              docs: [
                {
                  id: "1",
                  name: "Transporter-9",
                  date_utc: "2020-01-01T00:00:00.000Z",
                  success: true,
                  upcoming: false,
                  rocket: "rocket-1",
                  launchpad: "launchpad-1",
                  links: {
                    patch: {
                      small: null,
                      large: null,
                    },
                  },
                },
              ],
            },
          ],
        },
      }) as never,
    );

    renderWithProviders(<LaunchesExplorer />);

    const list = screen.getByRole("list");
    Object.defineProperty(list, "clientHeight", {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(list, "scrollHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(list, "scrollTop", {
      configurable: true,
      value: 500,
    });

    fireEvent.scroll(list);

    expect(fetchNextPage).toHaveBeenCalled();
  });
});
