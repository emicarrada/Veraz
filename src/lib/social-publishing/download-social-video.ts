import { writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const USER_AGENT = "Veraz-Social-Publish/1.0";
const TIMEOUT_MS = 120_000;
const MAX_BYTES = 80 * 1024 * 1024;

export async function downloadSocialVideo(
  videoUrl: string,
  assetsDir: string,
  slug: string,
  suffix = "bg",
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(videoUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} downloading video`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      throw new Error(`Video exceeds ${MAX_BYTES} bytes`);
    }

    await mkdir(assetsDir, { recursive: true });
    const filePath = path.join(assetsDir, `${slug}-${suffix}.mp4`);
    await writeFile(filePath, buffer);
    return filePath;
  } finally {
    clearTimeout(timer);
  }
}
