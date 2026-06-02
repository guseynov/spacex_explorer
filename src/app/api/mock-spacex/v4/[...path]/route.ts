import { NextResponse } from "next/server";
import {
  createMockSpaceXDataset,
  delay,
  filterMockLaunches,
  paginateMockLaunches,
  type MockLaunchQuery,
} from "@/lib/mock-spacex-data";

const dataset = createMockSpaceXDataset();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (path[0] === "launches" && path[1]) {
    const launch = dataset.launches.find((item) => item.id === path[1]);

    if (!launch) {
      return NextResponse.json({ message: "Launch not found" }, { status: 404 });
    }

    return NextResponse.json(launch);
  }

  if (path[0] === "rockets" && path[1]) {
    const rocket = dataset.rocketById.get(path[1]);

    if (!rocket) {
      return NextResponse.json({ message: "Rocket not found" }, { status: 404 });
    }

    return NextResponse.json(rocket);
  }

  if (path[0] === "launchpads" && path[1]) {
    const launchpad = dataset.launchpadById.get(path[1]);

    if (!launchpad) {
      return NextResponse.json(
        { message: "Launchpad not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(launchpad);
  }

  return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (path[0] !== "launches" || path[1] !== "query") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const rawBody = await request.text();
  const body = rawBody
    ? (JSON.parse(rawBody) as {
        query?: MockLaunchQuery["query"];
        options?: MockLaunchQuery["options"];
      })
    : {};

  const launches = filterMockLaunches(dataset, {
    query: body.query,
    options: body.options,
  });
  const payload = paginateMockLaunches(
    launches,
    body.options?.page,
    body.options?.limit,
  );

  if ((body.options?.page ?? 1) > 1) {
    await delay(350);
  }

  return NextResponse.json(payload);
}
