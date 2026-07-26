import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const USER_AGENT = "Veraz-Social-Publish/1.0";
const TIMEOUT_MS = 30_000;
const MAX_BYTES = 5 * 1024 * 1024;

function extensionFromContentType(contentType: string | null): string {
  if (!contentType) return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  return ".jpg";
}

function extensionFromUrl(imageUrl: string): string {
  try {
    const pathname = new URL(imageUrl).pathname.toLowerCase();
    if (pathname.endsWith(".png")) return ".png";
    if (pathname.endsWith(".webp")) return ".webp";
    if (pathname.endsWith(".gif")) return ".gif";
  } catch {
    // ignore
  }
  return ".jpg";
}

export async function downloadSocialImage(
  imageUrl: string,
  assetsDir: string,
  slug: string,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "image/*,*/*" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} downloading image`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      throw new Error(`Image exceeds ${MAX_BYTES} bytes`);
    }

    const ext =
      extensionFromContentType(response.headers.get("content-type")) ||
      extensionFromUrl(imageUrl);
    await mkdir(assetsDir, { recursive: true });
    const filePath = path.join(assetsDir, `${slug}${ext}`);
    await writeFile(filePath, buffer);
    return filePath;
  } finally {
    clearTimeout(timer);
  }
}
