import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { SocialPlatform } from "@/features/social-publishing/types";

export async function writePlatformCaptionFiles(
  exportsDir: string,
  slug: string,
  captions: Partial<Record<SocialPlatform, string>>,
): Promise<string[]> {
  const written: string[] = [];
  for (const [platform, caption] of Object.entries(captions) as [SocialPlatform, string][]) {
    if (!caption?.trim()) continue;
    const filePath = path.join(exportsDir, `${slug}.${platform}.caption.txt`);
    await writeFile(filePath, `${caption.trim()}\n`, "utf8");
    written.push(filePath);
  }
  return written;
}
