type MockRocket = {
  id: string;
  name: string;
  type: string;
  country: string;
  company: string;
  first_flight: string;
  description: string;
  success_rate_pct: number;
  flickr_images: string[];
};

type MockLaunchpad = {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
  details: string;
  timezone: string;
  status: string;
  launch_attempts: number;
  launch_successes: number;
  images: {
    large: string[];
  };
};

type MockLaunch = {
  id: string;
  name: string;
  date_utc: string;
  date_local: string;
  upcoming: boolean;
  success: boolean | null;
  details: string | null;
  flight_number: number;
  rocket: string;
  launchpad: string;
  links: {
    patch: {
      small: string | null;
      large: string | null;
    };
    flickr: {
      original: string[];
      small: string[];
    };
    article: string | null;
    wikipedia: string | null;
    webcast: string | null;
    presskit: string | null;
  };
};

export type MockLaunchQuery = {
  query?: {
    success?: boolean;
    date_utc?: {
      $gte?: string;
      $lt?: string;
      $lte?: string;
    };
    name?: {
      $regex?: string;
      $options?: string;
    };
  };
  options?: {
    page?: number;
    limit?: number;
    sort?: Record<string, "asc" | "desc">;
  };
};

export type MockSpaceXDataset = ReturnType<typeof createMockSpaceXDataset>;

export function createMockSpaceXDataset() {
  const rockets: MockRocket[] = [
    {
      id: "rocket-falcon-9",
      name: "Falcon 9",
      type: "orbital",
      country: "United States",
      company: "SpaceX",
      first_flight: "2010-06-04",
      description: "Reusable orbital launcher used for the majority of SpaceX missions.",
      success_rate_pct: 98,
      flickr_images: [
        "https://example.com/falcon-9-1.jpg",
        "https://example.com/falcon-9-2.jpg",
      ],
    },
    {
      id: "rocket-falcon-heavy",
      name: "Falcon Heavy",
      type: "orbital",
      country: "United States",
      company: "SpaceX",
      first_flight: "2018-02-06",
      description: "Heavy-lift booster used for large payloads and high-energy missions.",
      success_rate_pct: 87,
      flickr_images: [
        "https://example.com/falcon-heavy-1.jpg",
        "https://example.com/falcon-heavy-2.jpg",
      ],
    },
  ];

  const launchpads: MockLaunchpad[] = [
    {
      id: "launchpad-ccafs",
      name: "CCAFS",
      full_name: "Cape Canaveral Space Force Station",
      locality: "Cape Canaveral",
      region: "Florida",
      details: "Historic Florida launch site used for Falcon 9 and Falcon Heavy missions.",
      timezone: "America/New_York",
      status: "active",
      launch_attempts: 120,
      launch_successes: 116,
      images: {
        large: ["https://example.com/ccafs.jpg"],
      },
    },
    {
      id: "launchpad-ksc",
      name: "KSC",
      full_name: "Kennedy Space Center",
      locality: "Merritt Island",
      region: "Florida",
      details: "Primary launch site for many cargo, crew, and private orbital missions.",
      timezone: "America/New_York",
      status: "active",
      launch_attempts: 35,
      launch_successes: 34,
      images: {
        large: ["https://example.com/ksc.jpg"],
      },
    },
  ];

  const launches = buildMockLaunches(rockets, launchpads).sort((a, b) =>
    a.date_utc < b.date_utc ? 1 : -1,
  );

  const rocketById = new Map(rockets.map((rocket) => [rocket.id, rocket]));
  const launchpadById = new Map(
    launchpads.map((launchpad) => [launchpad.id, launchpad]),
  );

  return {
    rockets,
    launchpads,
    launches,
    rocketById,
    launchpadById,
  };
}

function buildMockLaunches(rockets: MockRocket[], launchpads: MockLaunchpad[]) {
  const launches: MockLaunch[] = [];
  const currentYear = new Date().getFullYear();
  let flightNumber = 100;

  function addLaunch(input: {
    id: string;
    name: string;
    dateUtc: string;
    success: boolean | null;
    details: string;
    rocketIndex: number;
    launchpadIndex: number;
    flickrImages: string[];
  }) {
    launches.push({
      id: input.id,
      name: input.name,
      date_utc: input.dateUtc,
      date_local: input.dateUtc,
      upcoming: new Date(input.dateUtc).getTime() > Date.now(),
      success: input.success,
      details: input.details,
      flight_number: flightNumber++,
      rocket: rockets[input.rocketIndex].id,
      launchpad: launchpads[input.launchpadIndex].id,
      links: {
        patch: {
          small: null,
          large: null,
        },
        flickr: {
          original: input.flickrImages,
          small: input.flickrImages,
        },
        article: `https://example.com/articles/${input.id}`,
        wikipedia: `https://example.com/wiki/${input.id}`,
        webcast: `https://example.com/webcasts/${input.id}`,
        presskit: `https://example.com/press/${input.id}`,
      },
    });
  }

  for (let year = currentYear - 4; year <= currentYear; year += 1) {
    addLaunch({
      id: `launch-${year}-alpha`,
      name: `Mission ${year} Alpha`,
      dateUtc: `${year}-01-15T14:00:00.000Z`,
      success: true,
      details: `Alpha mission for ${year}.`,
      rocketIndex: 0,
      launchpadIndex: 0,
      flickrImages: [
        "https://example.com/gallery/alpha-1.jpg",
        "https://example.com/gallery/alpha-2.jpg",
      ],
    });

    addLaunch({
      id: `launch-${year}-beta`,
      name: `Mission ${year} Beta`,
      dateUtc: `${year}-06-15T14:00:00.000Z`,
      success: false,
      details: `Beta mission for ${year}.`,
      rocketIndex: 1,
      launchpadIndex: 1,
      flickrImages: [],
    });

    addLaunch({
      id: `launch-${year}-gamma`,
      name: `Mission ${year} Gamma`,
      dateUtc: `${year}-11-20T14:00:00.000Z`,
      success: true,
      details: `Gamma mission for ${year}.`,
      rocketIndex: year % 2,
      launchpadIndex: year % 2,
      flickrImages: ["https://example.com/gallery/gamma-1.jpg"],
    });
  }

  addLaunch({
    id: `launch-${currentYear + 1}-future`,
    name: "Mission Future Prime",
    dateUtc: `${currentYear + 1}-03-14T12:00:00.000Z`,
    success: null,
    details: "A planned upcoming mission for the compare and favorites flows.",
    rocketIndex: 0,
    launchpadIndex: 0,
    flickrImages: [
      "https://example.com/gallery/future-1.jpg",
      "https://example.com/gallery/future-2.jpg",
    ],
  });

  return launches;
}

export function filterMockLaunches(
  dataset: MockSpaceXDataset,
  payload: MockLaunchQuery,
) {
  return sortMockLaunches(
    dataset.launches.filter((launch) =>
      matchesLaunchQuery(launch, payload.query),
    ),
    payload.options?.sort,
  );
}

export function paginateMockLaunches(
  launches: MockLaunch[],
  page = 1,
  limit = 12,
) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 1, 1);
  const totalDocs = launches.length;
  const totalPages = Math.max(Math.ceil(totalDocs / safeLimit), 1);
  const pageIndex = Math.min(safePage, totalPages);
  const start = (pageIndex - 1) * safeLimit;
  const docs = launches.slice(start, start + safeLimit);

  return {
    docs,
    totalDocs,
    limit: safeLimit,
    totalPages,
    page: pageIndex,
    hasPrevPage: pageIndex > 1,
    hasNextPage: pageIndex < totalPages,
    prevPage: pageIndex > 1 ? pageIndex - 1 : null,
    nextPage: pageIndex < totalPages ? pageIndex + 1 : null,
  };
}

export function matchesLaunchQuery(
  launch: MockLaunch,
  query?: MockLaunchQuery["query"],
) {
  if (!query) {
    return true;
  }

  if (Object.prototype.hasOwnProperty.call(query, "success")) {
    if (launch.success !== query.success) {
      return false;
    }
  }

  if (query.date_utc) {
    const launchTime = new Date(launch.date_utc).getTime();

    if (query.date_utc.$gte && launchTime < new Date(query.date_utc.$gte).getTime()) {
      return false;
    }

    if (query.date_utc.$lt && launchTime >= new Date(query.date_utc.$lt).getTime()) {
      return false;
    }

    if (query.date_utc.$lte && launchTime > new Date(query.date_utc.$lte).getTime()) {
      return false;
    }
  }

  if (query.name?.$regex) {
    const flags = query.name.$options === "i" ? "i" : "";
    if (!new RegExp(query.name.$regex, flags).test(launch.name)) {
      return false;
    }
  }

  return true;
}

export function sortMockLaunches(
  launches: MockLaunch[],
  sort?: Record<string, "asc" | "desc">,
) {
  const entries = Object.entries(sort ?? {});
  const [field, direction] = entries[0] ?? ["date_utc", "desc"];

  return [...launches].sort((left, right) => {
    const leftValue = left[field as keyof MockLaunch];
    const rightValue = right[field as keyof MockLaunch];

    if (leftValue === rightValue) {
      return 0;
    }

    const comparison = String(leftValue).localeCompare(String(rightValue), undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return direction === "asc" ? comparison : -comparison;
  });
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
