const API_BASE_URL =
  process.env.LAUNCH_LIBRARY_API_BASE_URL ??
  "https://ll.thespacedevs.com/2.3.0";

const ALLOWED_PATHS = [
  /^launches\/$/,
  /^launches\/[a-z0-9-]+\/$/i,
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const upstreamPath = `${path.join("/")}/`;

  if (!ALLOWED_PATHS.some((pattern) => pattern.test(upstreamPath))) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `${API_BASE_URL.replace(/\/$/, "")}/${upstreamPath}`,
  );

  requestUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });

  const response = await fetch(upstreamUrl, {
    headers: {
      accept: "application/json",
    },
    next: {
      revalidate: 300,
    },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
      "cache-control": "public, max-age=60, s-maxage=300",
    },
  });
}
