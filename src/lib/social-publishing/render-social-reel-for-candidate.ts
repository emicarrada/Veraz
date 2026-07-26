import path from "node:path";

import { buildStockVideoSearchQuery } from "@/features/social-publishing/build-stock-video-query";
import type { SocialArticleCandidate } from "@/features/social-publishing/types";
import { resolveSocialImageUrl } from "@/features/social-publishing/resolve-image-url";
import { downloadSocialImage } from "@/lib/social-publishing/download-social-image";
import { downloadSocialVideo } from "@/lib/social-publishing/download-social-video";
import { isPexelsConfigured, searchPexelsVideo } from "@/lib/social-publishing/pexels-video";
import { renderSocialCard } from "@/lib/social-publishing/render-social-card";
import {
  isFfmpegAvailable,
  renderSocialReelFromVideo,
  renderSocialReelStaticImage,
} from "@/lib/social-publishing/render-social-reel-video";
import { renderVideoReelOverlay } from "@/lib/social-publishing/render-video-reel-overlay";

export type RenderSocialReelResult = {
  mp4Path: string;
  overlayPath: string;
  pexelsPageUrl?: string;
  usedPexels: boolean;
};

export type RenderSocialReelForCandidateInput = {
  candidate: SocialArticleCandidate;
  assetsDir: string;
  exportsDir: string;
  projectRoot: string;
  durationSec?: number;
  env?: NodeJS.ProcessEnv;
};

export async function renderSocialReelForCandidate(
  input: RenderSocialReelForCandidateInput,
): Promise<RenderSocialReelResult> {
  const env = input.env ?? process.env;
  const slug = input.candidate.slug;
  const mp4Path = path.join(input.exportsDir, `${slug}-reels.mp4`);
  const overlayPath = path.join(input.exportsDir, `${slug}-overlay.png`);
  const previewPath = path.join(input.exportsDir, `${slug}-vertical.png`);

  const ffmpegOk = await isFfmpegAvailable();
  if (!ffmpegOk) {
    throw new Error("ffmpeg no está instalado (requerido para Reels/TikTok/Shorts).");
  }

  await renderVideoReelOverlay({
    title: input.candidate.title,
    sourceLabel: input.candidate.sourceAttribution,
    outputPath: overlayPath,
    projectRoot: input.projectRoot,
  });
  console.log("[reel] Overlay PNG listo");

  const usePexels = isPexelsConfigured(env) && env.SOCIAL_REEL_BACKGROUND?.trim() !== "image";
  let usedPexels = false;
  let pexelsPageUrl: string | undefined;

  if (usePexels && env.PEXELS_API_KEY?.trim()) {
    const query = buildStockVideoSearchQuery(input.candidate);
    const pick = await searchPexelsVideo(env.PEXELS_API_KEY.trim(), query);
    if (pick) {
      const bgPath = await downloadSocialVideo(pick.downloadUrl, input.assetsDir, slug);
      await renderSocialReelFromVideo({
        backgroundVideoPath: bgPath,
        overlayPngPath: overlayPath,
        outputMp4Path: mp4Path,
        durationSec: input.durationSec ?? 15,
      });
      usedPexels = true;
      pexelsPageUrl = pick.pageUrl;
      return { mp4Path, overlayPath, usedPexels, ...(pexelsPageUrl ? { pexelsPageUrl } : {}) };
    }
  }

  const imageUrl = resolveSocialImageUrl(input.candidate);
  const photoPath = await downloadSocialImage(imageUrl, input.assetsDir, slug);
  await renderSocialCard({
    title: input.candidate.title,
    sourceLabel: input.candidate.sourceAttribution,
    photoPath,
    outputPath: previewPath,
    variant: "hero-gradient-vertical",
    projectRoot: input.projectRoot,
  });
  await renderSocialReelStaticImage({
    framePngPath: previewPath,
    outputMp4Path: mp4Path,
    durationSec: input.durationSec ?? 15,
  });

  return { mp4Path, overlayPath, usedPexels };
}
