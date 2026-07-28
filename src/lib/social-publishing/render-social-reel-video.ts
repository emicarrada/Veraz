import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import { promisify } from "node:util";

import {
  SOCIAL_REEL_HEIGHT,
  SOCIAL_REEL_SCALE_CROP_VF,
  SOCIAL_REEL_WIDTH,
  assertReelMp4Dimensions,
} from "@/lib/social-publishing/social-reel-dimensions";

const execFileAsync = promisify(execFile);

async function pickH264Encoder(): Promise<string> {
  try {
    const { stdout } = await execFileAsync("ffmpeg", ["-encoders"]);
    if (stdout.includes("libx264")) return "libx264";
    if (stdout.includes("libopenh264")) return "libopenh264";
    if (stdout.includes("h264_vaapi")) return "h264_vaapi";
    return "mpeg4";
  } catch {
    return "mpeg4";
  }
}

export type RenderSocialReelFromVideoInput = {
  backgroundVideoPath: string;
  overlayPngPath: string;
  outputMp4Path: string;
  durationSec?: number;
};

export type RenderSocialReelStaticImageInput = {
  framePngPath: string;
  outputMp4Path: string;
  durationSec?: number;
};

export async function isFfmpegAvailable(): Promise<boolean> {
  try {
    await execFileAsync("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stock / hero video background + Veraz overlay. Output always 1080×1920 (9:16).
 */
export async function renderSocialReelFromVideo(
  input: RenderSocialReelFromVideoInput,
): Promise<void> {
  await access(input.backgroundVideoPath);
  await access(input.overlayPngPath);

  const duration = input.durationSec ?? 15;
  const encoder = await pickH264Encoder();

  const filter = [
    `[0:v]${SOCIAL_REEL_SCALE_CROP_VF},setpts=PTS-STARTPTS[bg]`,
    `[1:v]scale=${SOCIAL_REEL_WIDTH}:${SOCIAL_REEL_HEIGHT}[ov]`,
    `[bg][ov]overlay=0:0:format=auto,format=yuv420p[out]`,
  ].join(";");

  await execFileAsync(
    "ffmpeg",
    [
      "-y",
      "-stream_loop",
      "-1",
      "-i",
      input.backgroundVideoPath,
      "-i",
      input.overlayPngPath,
      "-filter_complex",
      filter,
      "-map",
      "[out]",
      "-an",
      "-c:v",
      encoder,
      "-t",
      String(duration),
      "-movflags",
      "+faststart",
      input.outputMp4Path,
    ],
    { maxBuffer: 24 * 1024 * 1024 },
  );

  await assertReelMp4Dimensions(input.outputMp4Path);
}

/** Fallback: vertical PNG or photo — cover-crop to 9:16 (no square letterbox). */
export async function renderSocialReelStaticImage(
  input: RenderSocialReelStaticImageInput,
): Promise<void> {
  await access(input.framePngPath);
  const duration = input.durationSec ?? 15;
  const encoder = await pickH264Encoder();

  await execFileAsync(
    "ffmpeg",
    [
      "-y",
      "-loop",
      "1",
      "-i",
      input.framePngPath,
      "-vf",
      `${SOCIAL_REEL_SCALE_CROP_VF},format=yuv420p`,
      "-c:v",
      encoder,
      "-t",
      String(duration),
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      input.outputMp4Path,
    ],
    { maxBuffer: 16 * 1024 * 1024 },
  );

  await assertReelMp4Dimensions(input.outputMp4Path);
}
