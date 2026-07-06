import type { EonetCategoryRaw, EonetEventRaw } from "./types";

export type EonetEventWindowQuery = {
  status?: "all" | "open" | "closed";
  start?: string;
  end?: string;
  days?: number;
  limit?: number;
  category?: string;
};

const API_BASE_URL =
  process.env.EONET_API_BASE_URL ??
  process.env.NASA_EONET_API_BASE_URL ??
  "https://eonet.gsfc.nasa.gov/api/v3";
const REQUEST_DELAY_MS = Number(process.env.EONET_REQUEST_DELAY_MS ?? 1000);
const MAX_RETRIES = Number(process.env.EONET_MAX_RETRIES ?? 3);

let lastRequestAt = 0;

export async function fetchEonetCategories() {
  const response = await fetchJson<{ categories?: EonetCategoryRaw[] }>("/categories");

  return response.categories ?? [];
}

export async function fetchEonetEventsWindow(
  query: EonetEventWindowQuery,
) {
  const params = new URLSearchParams();
  params.set("status", query.status ?? "all");

  if (query.start) {
    params.set("start", query.start);
  }
  if (query.end) {
    params.set("end", query.end);
  }
  if (typeof query.days === "number") {
    params.set("days", String(query.days));
  }
  if (typeof query.limit === "number") {
    params.set("limit", String(query.limit));
  }
  if (query.category && query.category !== "all") {
    params.set("category", query.category);
  }

  console.info("[eonet] fetching events window", {
    status: query.status ?? "all",
    start: query.start ?? null,
    end: query.end ?? null,
    days: query.days ?? null,
    limit: query.limit ?? null,
    category: query.category ?? "all",
  });

  const response = await fetchJson<{ events?: EonetEventRaw[] }>(`/events?${params.toString()}`);

  return response.events ?? [];
}

export async function fetchEonetEventById(id: string) {
  return fetchJson<EonetEventRaw>(`/events/${encodeURIComponent(id)}`);
}

async function fetchJson<T>(path: string, retries = MAX_RETRIES): Promise<T> {
  await paceRequests();

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        accept: "application/json",
      },
    });

    if (response.status === 429 || response.status >= 500) {
      if (retries <= 0) {
        throw new Error(`EONET request failed with status ${response.status}.`);
      }

      const retryAfter = Number(response.headers.get("retry-after"));
      await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : backoffDelay(retries));
      return fetchJson(path, retries - 1);
    }

    if (!response.ok) {
      throw new Error(`EONET request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    await delay(backoffDelay(retries));
    return fetchJson(path, retries - 1);
  }
}

async function paceRequests() {
  const elapsed = Date.now() - lastRequestAt;

  if (elapsed < REQUEST_DELAY_MS) {
    await delay(REQUEST_DELAY_MS - elapsed);
  }

  lastRequestAt = Date.now();
}

function backoffDelay(retriesLeft: number) {
  return REQUEST_DELAY_MS * Math.max(1, 4 - retriesLeft);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
