# SpaceX Explorer

SpaceX Explorer is a frontend take-home task made for Digt. It is built with Next.js, React, and TypeScript against the public SpaceX v4 API. It focuses on server-side pagination/filtering, typed API boundaries, accessible states, local favorites persistence, and list performance.

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
- `Zod`: validates SpaceX API responses at the boundary so the rest of the app uses trusted TypeScript types instead of unchecked JSON.
- `react-window`: virtualizes the loaded launch list to keep rendering stable as pages accumulate.

## SpaceX API usage

Base API:

- [https://api.spacexdata.com/v4](https://api.spacexdata.com/v4)

Endpoints used:

- `POST /launches/query`
- `GET /launches/:id`
- `GET /rockets/:id`
- `GET /launchpads/:id`

Pagination strategy:

- The list uses `POST /launches/query` with `page` and `limit=12`.
- Filters are mapped into the API query object instead of fetching everything client-side.
- Search uses a case-insensitive regex against `name`, with regex metacharacters escaped before sending the request.
- Sorting uses `date_utc` or `name` in ascending/descending order based on URL search params.

## Performance and accessibility

Performance choices:

- Loaded pages are rendered through `react-window`.
- Search requests are debounced by 300ms.
- React Query stale times are tuned by resource type:
  - launch list: 60s
  - launch detail: 60s
  - rocket/launchpad: 5m
- The home page includes a yearly launch trends panel that queries the SpaceX API for launch volume and success rate summaries.
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
- The launch detail route is server-rendered and hydrated with initial launch, rocket, and launchpad data so the detail page paints quickly without giving up interactivity.
- Launch list virtualization uses fixed row heights, so list cards intentionally keep content compact.
- Compare mode is available at `/compare` and uses shareable `left`/`right` query params plus a local compare queue to seed selections from the explorer or detail pages.

Known limitations / TODOs:

- External media uses `next/image` in unoptimized mode because remote image coverage is broad and the task is frontend-focused.
- Browser coverage uses Playwright against the Next dev server and a local mock SpaceX API route, so it stays deterministic without depending on live network access.
- Offline app-shell caching is not implemented yet; that is a future improvement rather than a shipped feature.
