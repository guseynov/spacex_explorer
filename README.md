# EONET Explorer

EONET Explorer is a Next.js, React, and TypeScript app for browsing live NASA EONET earth events. It focuses on typed API boundaries, server-assisted filtering, local favorites and compare state, and responsive list/detail views without bundled fallback data.

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

## Stack and architecture

- `Next.js App Router` handles the explorer, detail, favorites, compare, and trends routes with route-level loading and error states.
- `TanStack Query` manages caching, deduplication, retry behavior, and load-more pagination.
- `Tailwind CSS` provides the styling base with a small global token layer in `globals.css`.
- `Zod` validates the normalized event shape at the API boundary so the UI consumes typed data only.

## API usage

Upstream API:

- [https://eonet.gsfc.nasa.gov/api/v3](https://eonet.gsfc.nasa.gov/api/v3)

Endpoints used:

- `GET /events`
- `GET /events/:id`
- `GET /categories`

The app maps UI filters to EONET `status`, `category`, `start`, `end`, and `days` parameters. Browser requests pass through `/api/events`, which normalizes responses and caches upstream GET traffic for five minutes. Search and some sorting are applied after fetch because EONET does not expose the same query surface as the previous launch provider.

## Performance and accessibility

- Search requests are debounced by 300ms.
- React Query stale times are currently 60s for both list and detail queries.
- The trends page aggregates recent event volume and closure rate from live EONET data.
- Retry behavior only retries `429` and `5xx` responses with a small backoff.
- Favorites and compare selections persist in `localStorage`.
- Semantic headings, labeled controls, focus styles, and `aria-live` updates are included throughout the explorer flow.

## Tradeoffs

- The event list remains client-fetched so filters, search, and load-more stay responsive.
- The detail route is server-rendered from one normalized EONET event response.
- E2E coverage runs against the live EONET-backed app shell, so browser tests can still be affected by upstream volatility.
