import type { Launch } from "./api/schemas";

export function createMockLaunchLibraryDataset() {
  const currentYear = new Date().getFullYear();
  const launches: Launch[] = [];
  let launchNumber = 650;

  for (let year = currentYear - 4; year <= currentYear; year += 1) {
    launches.push(
      createLaunch({
        id: `launch-${year}-alpha`,
        name: `Mission ${year} Alpha`,
        net: `${year}-01-15T14:00:00.000Z`,
        statusId: 3,
        description: `Alpha mission for ${year}.`,
        launchNumber: launchNumber++,
      }),
      createLaunch({
        id: `launch-${year}-beta`,
        name: `Mission ${year} Beta`,
        net: `${year}-06-15T14:00:00.000Z`,
        statusId: 4,
        description: `Beta mission for ${year}.`,
        launchNumber: launchNumber++,
      }),
      createLaunch({
        id: `launch-${year}-gamma`,
        name: `Mission ${year} Gamma`,
        net: `${year}-11-20T14:00:00.000Z`,
        statusId: 3,
        description: `Gamma mission for ${year}.`,
        launchNumber: launchNumber++,
      }),
    );
  }

  launches.push(
    createLaunch({
      id: `launch-${currentYear + 1}-future`,
      name: "Mission Future Prime",
      net: `${currentYear + 1}-03-14T12:00:00.000Z`,
      statusId: 1,
      description: "A planned upcoming mission for the compare and favorites flows.",
      launchNumber: launchNumber++,
    }),
  );

  return launches;
}

function createLaunch(input: {
  id: string;
  name: string;
  net: string;
  statusId: number;
  description: string;
  launchNumber: number;
}): Launch {
  const successful = input.statusId === 3;
  const status = successful
    ? { id: 3, name: "Launch Successful", abbrev: "Success" }
    : input.statusId === 4
      ? { id: 4, name: "Launch Failure", abbrev: "Failure" }
      : { id: 1, name: "Go for Launch", abbrev: "Go" };

  return {
    id: input.id,
    name: input.name,
    net: input.net,
    status,
    image: {
      image_url: "https://example.com/gallery/launch.jpg",
      thumbnail_url: "https://example.com/gallery/launch-thumb.jpg",
    },
    infographic: null,
    failreason: successful ? "" : "Mock launch failure.",
    agency_launch_attempt_count: input.launchNumber,
    orbital_launch_attempt_count: input.launchNumber + 7000,
    mission: {
      name: input.name,
      description: input.description,
      image: null,
      info_urls: [{ url: `https://example.com/articles/${input.id}` }],
      vid_urls: [{ url: `https://example.com/webcasts/${input.id}` }],
    },
    rocket: {
      id: input.launchNumber,
      configuration: {
        id: 164,
        name: "Falcon 9",
        full_name: "Falcon 9 Block 5",
        variant: "Block 5",
        description: "Reusable orbital launcher used for SpaceX missions.",
        maiden_flight: "2018-05-11",
        successful_launches: 640,
        total_launch_count: 645,
        manufacturer: {
          name: "SpaceX",
          country: [{ name: "United States of America" }],
        },
        image: null,
      },
    },
    pad: {
      id: 80,
      name: "Space Launch Complex 40",
      active: true,
      description: "Cape Canaveral launchpad used by Falcon 9.",
      map_image: "https://example.com/gallery/pad-map.jpg",
      total_launch_count: 387,
      orbital_launch_attempt_count: 387,
      image: {
        image_url: "https://example.com/gallery/pad.jpg",
        thumbnail_url: null,
      },
      location: {
        name: "Cape Canaveral SFS, FL, USA",
        description: "Cape Canaveral Space Force Station.",
        timezone_name: "America/New_York",
        country: { name: "United States of America" },
      },
      country: { name: "United States of America" },
    },
    info_urls: [],
    vid_urls: [],
    mission_patches: [
      { image_url: "https://example.com/gallery/mission-patch.png" },
    ],
    program: [],
  };
}

export function filterMockLaunches(launches: Launch[], params: URLSearchParams) {
  const search = params.get("search")?.toLowerCase();
  const from = params.get("net__gte");
  const to = params.get("net__lte");
  const status = params.get("status");
  const statusIds = params.get("status__ids")?.split(",").map(Number);
  const ordering = params.get("ordering") ?? "-net";
  const filtered = launches.filter((launch) => {
    const launchTime = new Date(launch.net).getTime();

    return (
      (!search || launch.name.toLowerCase().includes(search)) &&
      (!from || launchTime >= new Date(from).getTime()) &&
      (!to || launchTime <= new Date(to).getTime()) &&
      (!status || launch.status.id === Number(status)) &&
      (!statusIds || statusIds.includes(launch.status.id))
    );
  });
  const descending = ordering.startsWith("-");
  const field = ordering.replace(/^-/, "") === "name" ? "name" : "net";

  return [...filtered].sort((left, right) => {
    const comparison = left[field].localeCompare(right[field], undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return descending ? -comparison : comparison;
  });
}

export function paginateMockLaunches(
  launches: Launch[],
  params: URLSearchParams,
) {
  const limit = Math.max(Number(params.get("limit")) || 12, 1);
  const offset = Math.max(Number(params.get("offset")) || 0, 0);
  const results = launches.slice(offset, offset + limit);
  const nextOffset = offset + limit;

  return {
    count: launches.length,
    next:
      nextOffset < launches.length
        ? `http://mock/launches/?limit=${limit}&offset=${nextOffset}`
        : null,
    previous:
      offset > 0
        ? `http://mock/launches/?limit=${limit}&offset=${Math.max(offset - limit, 0)}`
        : null,
    results,
  };
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
