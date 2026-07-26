import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import { promisify } from "node:util";

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
 * Stock / hero video background + Veraz overlay. No zoom or motion effects on the plate.
 */
export async function renderSocialReelFromVideo(
  input: RenderSocialReelFromVideoInput,
): Promise<void> {
  await access(input.backgroundVideoPath);
  await access(input.overlayPngPath);

  const duration = input.durationSec ?? 15;
  const encoder = await pickH264Encoder();

  const filter = [
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,setpts=PTS-STARTPTS[bg]`,
    `[bg][1:v]overlay=0:0:format=auto,format=yuv420p[out]`,
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
}

/** Fallback: single PNG held static (no Ken Burns). */
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
      "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p",
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
}
