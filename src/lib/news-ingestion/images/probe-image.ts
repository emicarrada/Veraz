import { preferSharperImageUrl, readImageSize, type ImageSize } from "@/lib/news-ingestion/images/feed-image";

const PROBE_BYTES = 512 * 1024;

export async function probeImageSize(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ImageSize | null> {
  const target = preferSharperImageUrl(url);
  const probed = await readRemoteImageSize(target, fetchImpl);
  if (probed || target === url) return probed;
  return readRemoteImageSize(url, fetchImpl);
}

async function readRemoteImageSize(
  url: string,
  fetchImpl: typeof fetch,
): Promise<ImageSize | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Range: `bytes=0-${PROBE_BYTES - 1}`,
        "User-Agent": "Veraz-RSS-Ingestion/1.0",
      },
      signal: controller.signal,
    });
    if (!response.ok && response.status !== 206) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    return readImageSize(bytes.subarray(0, Math.min(bytes.length, PROBE_BYTES)));
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
