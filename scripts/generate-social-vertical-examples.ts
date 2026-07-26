#!/usr/bin/env npx tsx
/**
 * Reels / TikTok: Pexels stock video + Veraz overlay (sin zoom en imagen).
 * Output: .social/examples/reels-tiktok/
 *
 * Requires PEXELS_API_KEY in .env.local (free: https://www.pexels.com/api/)
 * Usage: npm run social:examples:vertical
 */
import path from "node:path";

import { buildStockVideoSearchQuery } from "@/features/social-publishing/build-stock-video-query";
import { loadSocialPublishConfig } from "@/features/social-publishing";
import { resolveSocialImageUrl } from "@/features/social-publishing/resolve-image-url";
import { selectSocialCandidates } from "@/features/social-publishing/select-candidates";
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
import { createContentRepositories } from "@/lib/repositories/factory";
import { isSupabasePersistenceConfigured } from "@/lib/supabase";

const ROOT = path.resolve(import.meta.dirname, "..");

async function main(): Promise<void> {
  if (!isSupabasePersistenceConfigured()) {
    console.error("Supabase not configured — need .env.local");
    process.exit(1);
  }

  const repos = createContentRepositories();
  if (!repos?.articleRepository) {
    console.error("Article repository unavailable.");
    process.exit(1);
  }

  const config = loadSocialPublishConfig({
    ...process.env,
    SOCIAL_PUBLISHING_ENABLED: "true",
    SOCIAL_MAX_POSTS_PER_RUN: process.env.SOCIAL_MAX_POSTS_PER_RUN ?? "2",
  });

  const candidates = await selectSocialCandidates(repos.articleRepository, config);
  if (candidates.length === 0) {
    console.log("No candidates.");
    process.exit(0);
  }

  const outDir = path.join(ROOT, ".social/examples/reels-tiktok");
  const assetsDir = path.join(ROOT, ".social/examples/reels-tiktok-assets");
  const hasFfmpeg = await isFfmpegAvailable();
  const usePexels = isPexelsConfigured() && process.env.SOCIAL_REEL_BACKGROUND?.trim() !== "image";

  console.log("Reels / TikTok →", outDir);
  console.log("Fondo:", usePexels ? "Pexels (video real, sin efectos)" : "fallback imagen estática");
  if (!usePexels) {
    console.log("Tip: añade PEXELS_API_KEY en .env.local (gratis en pexels.com/api)\n");
  }
  if (!hasFfmpeg) {
    console.log("ffmpeg requerido para MP4\n");
    process.exit(1);
  }

  for (const candidate of candidates) {
    const mp4Path = path.join(outDir, `${candidate.slug}-reels-tiktok.mp4`);
    const overlayPath = path.join(outDir, `${candidate.slug}-overlay.png`);
    const previewPath = path.join(outDir, `${candidate.slug}-vertical.png`);

    await renderVideoReelOverlay({
      title: candidate.title,
      sourceLabel: candidate.sourceAttribution,
      outputPath: overlayPath,
      projectRoot: ROOT,
    });

    let usedPexels = false;

    if (usePexels) {
      const query = buildStockVideoSearchQuery(candidate);
      const apiKey = process.env.PEXELS_API_KEY!.trim();
      try {
        const pick = await searchPexelsVideo(apiKey, query);
        if (pick) {
          console.log(`Pexels: "${query}" → ${pick.width}×${pick.height} (id ${pick.id})`);
          const bgPath = await downloadSocialVideo(pick.downloadUrl, assetsDir, candidate.slug);
          await renderSocialReelFromVideo({
            backgroundVideoPath: bgPath,
            overlayPngPath: overlayPath,
            outputMp4Path: mp4Path,
            durationSec: 15,
          });
          usedPexels = true;
          console.log(`✓ ${path.basename(mp4Path)} — video stock + overlay Veraz`);
          console.log(`  Atribución: ${pick.pageUrl}`);
        } else {
          console.log(`Pexels: sin resultados para "${query}" — fallback imagen`);
        }
      } catch (error) {
        console.error(`Pexels: ${error instanceof Error ? error.message : error} — fallback`);
      }
    }

    if (!usedPexels) {
      const imageUrl = resolveSocialImageUrl(candidate);
      const photoPath = await downloadSocialImage(imageUrl, assetsDir, candidate.slug);
      await renderSocialCard({
        title: candidate.title,
        sourceLabel: candidate.sourceAttribution,
        photoPath,
        outputPath: previewPath,
        variant: "hero-gradient-vertical",
        projectRoot: ROOT,
      });
      await renderSocialReelStaticImage({
        framePngPath: previewPath,
        outputMp4Path: mp4Path,
        durationSec: 15,
      });
      console.log(`✓ ${path.basename(mp4Path)} — imagen estática (sin zoom)`);
    }

    console.log(`  ${candidate.title.slice(0, 70)}…\n`);
  }

  console.log("Abre:", outDir);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
