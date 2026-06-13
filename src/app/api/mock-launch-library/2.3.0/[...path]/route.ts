import {
  createMockLaunchLibraryDataset,
  delay,
  filterMockLaunches,
  paginateMockLaunches,
} from "@/lib/mock-launch-library-data";

const launches = createMockLaunchLibraryDataset();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (path[0] !== "launches") {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  if (path[1]) {
    const launch = launches.find((item) => item.id === path[1]);

    return launch
      ? Response.json(launch)
      : Response.json({ message: "Launch not found" }, { status: 404 });
  }

  const searchParams = new URL(request.url).searchParams;
  const filtered = filterMockLaunches(launches, searchParams);

  if ((Number(searchParams.get("offset")) || 0) > 0) {
    await delay(350);
  }

  return Response.json(paginateMockLaunches(filtered, searchParams));
}
