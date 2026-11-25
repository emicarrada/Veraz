import { isPublicHttpUrl } from "@/lib/news-ingestion/utils/url-security";
import { isStoredMediaUrl } from "@/features/news/services/stored-hero-image";

const MAX_BYTES = 8_000_000;

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src")?.trim() ?? "";
  if (!isPublicHttpUrl(src, { allowHttp: false })) {
    return new Response(null, { status: 400 });
  }
  if (!(await isStoredMediaUrl(src))) {
    return new Response(null, { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(src, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "image/*", "User-Agent": "Veraz/1.0" },
    });
  } catch {
    return new Response(null, { status: 502 });
  }

  const type = upstream.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  if (!upstream.ok || !type.startsWith("image/") || !isPublicHttpUrl(upstream.url, { allowHttp: false })) {
    return new Response(null, { status: 502 });
  }

  const bytes = await upstream.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) {
    return new Response(null, { status: 413 });
  }

  return new Response(bytes, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
