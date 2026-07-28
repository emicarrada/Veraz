import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** TikTok / Instagram Reels — 9:16 */
export const SOCIAL_REEL_WIDTH = 1080;
export const SOCIAL_REEL_HEIGHT = 1920;

/** Cover-crop any input to exact 9:16 (no letterboxing). */
export const SOCIAL_REEL_SCALE_CROP_VF = `scale=${SOCIAL_REEL_WIDTH}:${SOCIAL_REEL_HEIGHT}:force_original_aspect_ratio=increase,crop=${SOCIAL_REEL_WIDTH}:${SOCIAL_REEL_HEIGHT},setsar=1`;

export async function assertReelMp4Dimensions(mp4Path: string): Promise<void> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=p=0",
    mp4Path,
  ]);
  const parts = stdout.trim().split(",");
  const width = Number.parseInt(parts[0] ?? "", 10);
  const height = Number.parseInt(parts[1] ?? "", 10);
  if (width !== SOCIAL_REEL_WIDTH || height !== SOCIAL_REEL_HEIGHT) {
    throw new Error(
      `MP4 debe ser ${SOCIAL_REEL_WIDTH}×${SOCIAL_REEL_HEIGHT} (9:16); obtuvo ${width}×${height}: ${mp4Path}`,
    );
  }
}
