# SpaceX Explorer

SpaceX Explorer is a frontend take-home task made for Digt. It is built with Next.js, React, and TypeScript against the public Launch Library 2 API. It focuses on server-side pagination/filtering, typed API boundaries, accessible states, local favorites persistence, and list performance.

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful scripts:

```bash
npm run lint
npm run build
npm run test:run
npm run test:e2e
```

## Stack and architecture decisions

- `Next.js App Router`: the repo started empty, so App Router was the cleanest choice for route organization, metadata, and route-level loading/error ergonomics. The final routes are `/`, `/favorites`, and `/launches/[id]`.
- `TanStack Query`: used for caching, deduplication, retry behavior, and load-more pagination. It is a better fit than custom fetch state because the task explicitly requires caching and background refresh behavior.
- `Tailwind CSS`: used for fast, consistent styling with a small amount of global CSS for theme tokens and utility classes.
- `Zod`: validates the Launch Library 2 response shape at the boundary; application code consumes those validated LL2 fields directly.
- `react-window`: virtualizes the loaded launch list to keep rendering stable as pages accumulate.

## Launch API usage

Base API:

- [https://ll.thespacedevs.com/2.3.0](https://ll.thespacedevs.com/2.3.0)

Endpoints used:

- `GET /launches/`
- `GET /launches/:id/`

Pagination strategy:

- The list uses LL2 offset pagination with `limit=12` and is restricted to SpaceX launch service provider ID `121`.
- Filters are mapped to LL2 date, status, search, and ordering query parameters instead of fetching everything client-side.
- Browser requests pass through `/api/launch-library`, which caches upstream GET responses for five minutes to respect the public API rate limit.
- The yearly trends view downloads the requested date window in pages of 100 and aggregates locally instead of issuing two requests per year.

## Performance and accessibility

Performance choices:

- Loaded pages are rendered through `react-window`.
- Search requests are debounced by 300ms.
- React Query stale times are tuned by resource type:
  - launch list: 60s
  - launch detail: 60s
- The trends page includes yearly SpaceX launch volume and success rate summaries sourced from Launch Library 2.
- Retry policy only retries `429` and `5xx` responses, with a basic 500ms/1000ms backoff.
- Favorites and compare selections persist in `localStorage`, so saved state survives reloads in the same browser.

Accessibility choices:

- Semantic headings and sections across list, favorites, and detail pages.
- Labeled filter controls and visible keyboard focus styles.
- `aria-live="polite"` for list loading/result updates.
- The launch list auto-loads the next page as you approach the end of the virtualized feed, while the live result text keeps pagination state readable.
- Gallery images use descriptive alt text based on the mission name.

## Tradeoffs, limitations, and next steps

Tradeoffs:

- The launch list stays client-fetched so filters, search, and load-more remain responsive.
- The launch detail route is server-rendered from one LL2 detailed launch response, which already embeds launcher configuration and pad data.
- Launch list virtualization uses fixed row heights, so list cards intentionally keep content compact.
- Compare mode is available at `/compare` and uses shareable `left`/`right` query params plus a local compare queue to seed selections from the explorer or detail pages.

Known limitations / TODOs:

- External media uses `next/image` in unoptimized mode because remote image coverage is broad and the task is frontend-focused.
- Browser coverage uses Playwright against the Next dev server and an LL2-shaped mock route, so the tests exercise the same contract as production without live network dependencies.
- Offline app-shell caching is not implemented yet; that is a future improvement rather than a shipped feature.
