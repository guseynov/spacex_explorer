# Earth Event Explorer

Earth Event Explorer is a Next.js, React, and TypeScript app for exploring NASA EONET natural events through a DB-backed mirror. The app centers the globe, timeline, and event list instead of a generic card grid, while keeping typed API normalization, favorites, and compare state.

## Run Locally On WSL2

Run Postgres, apply the schema, and sync EONET before starting the app:

```bash
cp .env.example .env.local
docker compose up -d postgres
npm install
npm run db:generate
npm run db:migrate
npm run eonet:sync
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a larger historical dataset, run:

```bash
npm run eonet:backfill
```

Useful commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
npm run eonet:sync
npm run eonet:backfill
```

## Deploy On Vercel

1. Create a Postgres database and copy its pooled connection string into `DATABASE_URL`.
   - Vercel Postgres integrations: [https://vercel.com/docs/postgres](https://vercel.com/docs/postgres)
   - Neon also works: [https://neon.com/docs/connect/connect-from-any-app](https://neon.com/docs/connect/connect-from-any-app)

2. Set Vercel environment variables:

```bash
DATABASE_URL=postgresql://...
EONET_SYNC_SECRET=<generate-a-long-random-string>
NEXT_PUBLIC_MAP_STYLE_URL=<optional-maplibre-style-url>
```

3. The included Vercel build command runs migrations before the Next.js build:

```bash
npm run db:deploy && npm run build
```

The install command can stay as `npm install`; `postinstall` runs `prisma generate`.

4. Deploy, then seed the database once:

```bash
vercel --prod
curl -X POST "https://<your-project>.vercel.app/api/cron/eonet-sync?secret=<EONET_SYNC_SECRET>"
```

5. The included [vercel.json](./vercel.json) runs `/api/cron/eonet-sync` once per day at 02:00 UTC, which works on Vercel Hobby. On Pro, you can change the schedule to `0 */6 * * *` for a six-hour sync cadence.

API keys:

- NASA EONET does not require an API key: [https://eonet.gsfc.nasa.gov/docs/v3](https://eonet.gsfc.nasa.gov/docs/v3)
- A map key is optional. Without `NEXT_PUBLIC_MAP_STYLE_URL`, local/dev uses the public MapLibre demo style. For production, use a MapLibre-compatible provider such as MapTiler: [https://docs.maptiler.com/cloud/api/authentication-key/](https://docs.maptiler.com/cloud/api/authentication-key/)
- Vercel Marketplace Postgres providers or Neon provide `DATABASE_URL` through their dashboard; no NASA key is needed.

## Stack

- `Next.js App Router` for the explorer, event detail, favorites, compare, and API routes.
- `TanStack Query` for client-side caching and refetch behavior.
- `Tailwind CSS` plus a small token layer in [src/app/globals.css](./src/app/globals.css).
- `Zod` for validated event schemas at the EONET boundary.
- `MapLibre GL JS` for the interactive map.
- `Prisma` with Postgres for the mirrored EONET dataset and sync runs.

## API shape

Upstream API:

- [https://eonet.gsfc.nasa.gov/api/v3](https://eonet.gsfc.nasa.gov/api/v3)

App routes:

- `GET /api/events`
- `GET /api/events/[id]`
- `GET /api/events/timeline`
- `GET /api/sync/status`

The browser API reads from the mirrored database and returns event-first types:

- `Event`
- `EventStatus`
- `EventCategory`
- `EventSource`
- `EventGeometry`
- `EventListPage`
- `FavoriteEvent`

The list route supports `status`, `category`, `from`, `to`, `sort`, `search`, `page`, and `limit`. Timeline buckets come from the mirrored database and the browser never needs to hit NASA directly during normal browsing.

## Map configuration

MapLibre style is configurable through:

```bash
NEXT_PUBLIC_MAP_STYLE_URL=https://your-style-host/style.json
```

If that variable is not set, the app falls back to the public MapLibre demo style for local development.

## Notes

- Favorites and compare selections persist in `localStorage` under the current EONET event shape.
- `npm run eonet:sync` refreshes the recent mirror window; `npm run eonet:backfill` fills historical data in throttled windows.
- Playwright coverage targets the map-first explorer, detail route, favorites, and compare flow.
